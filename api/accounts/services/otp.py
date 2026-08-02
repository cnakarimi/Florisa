import secrets
from dataclasses import dataclass
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from django.views.decorators.debug import sensitive_variables

from accounts.models import OTPRequest, User
from accounts.services.providers import send_otp
from accounts.utils import (
    OTP_CODE_LENGTH,
    normalize_otp_code,
    normalize_phone,
    validate_iranian_phone,
)


class OTPError(Exception):
    message = "اعتبارسنجی کد تأیید ناموفق بود."
    status_code = 400

    def __init__(self, message: str | None = None) -> None:
        super().__init__(message or self.message)
        self.message = message or self.message


class OTPNotFoundError(OTPError):
    message = "کد تأیید فعالی برای این شماره یافت نشد."


class OTPExpiredError(OTPError):
    message = "زمان استفاده از کد تأیید به پایان رسیده است."


class OTPInvalidError(OTPError):
    message = "کد تأیید وارد شده صحیح نیست."


class OTPAttemptLimitError(OTPError):
    message = "تعداد تلاش‌های مجاز به پایان رسیده است. کد جدیدی دریافت کنید."
    status_code = 429


class OTPDemoOnlyError(OTPError):
    message = "این نسخه نمایشی است و در حال حاضر فقط شماره نمایشی پشتیبانی می‌شود."


class OTPDemoAccountError(OTPError):
    message = "ورود نمایشی برای این حساب مجاز نیست."
    status_code = 403


@dataclass(frozen=True)
class CreatedOTP:
    request: OTPRequest


def generate_otp() -> str:
    upper_bound = 10**OTP_CODE_LENGTH
    return f"{secrets.randbelow(upper_bound):0{OTP_CODE_LENGTH}d}"


def _is_privileged_user(phone: str) -> bool:
    return User.objects.filter(phone=phone).filter(
        Q(is_staff=True) | Q(is_superuser=True),
    ).exists()


@sensitive_variables()
@transaction.atomic
def create_otp(phone: str) -> CreatedOTP:
    normalized_phone = normalize_phone(phone)
    normalized_demo_phone = normalize_phone(settings.DEMO_OTP_PHONE)
    validate_iranian_phone(normalized_phone)
    is_demo = (
        settings.DEMO_OTP_ENABLED
        and normalized_phone == normalized_demo_phone
    )

    if settings.DEMO_OTP_ENABLED and settings.DEMO_OTP_ONLY and not is_demo:
        raise OTPDemoOnlyError
    if is_demo and _is_privileged_user(normalized_phone):
        raise OTPDemoAccountError

    OTPRequest.objects.filter(
        phone=normalized_phone,
        is_used=False,
    ).update(is_used=True)

    code = settings.DEMO_OTP_CODE if is_demo else generate_otp()
    otp_request = OTPRequest.objects.create(
        phone=normalized_phone,
        code_hash=make_password(code),
        expires_at=timezone.now()
        + timedelta(seconds=settings.OTP_EXPIRATION_SECONDS),
        is_demo=is_demo,
    )
    if not is_demo:
        send_otp(normalized_phone, code)
    return CreatedOTP(request=otp_request)


def verify_otp(phone: str, code: str) -> OTPRequest:
    normalized_phone = normalize_phone(phone)
    normalized_code = normalize_otp_code(code)
    validate_iranian_phone(normalized_phone)

    error: OTPError | None = None
    otp_request: OTPRequest | None = None

    with transaction.atomic():
        otp_request = (
            OTPRequest.objects.select_for_update()
            .filter(phone=normalized_phone, is_used=False)
            .order_by("-created_at")
            .first()
        )

        if otp_request is None:
            error = OTPNotFoundError()
        elif otp_request.is_expired:
            otp_request.is_used = True
            otp_request.save(update_fields=["is_used"])
            error = OTPExpiredError()
        elif otp_request.attempts >= settings.OTP_MAX_ATTEMPTS:
            otp_request.is_used = True
            otp_request.save(update_fields=["is_used"])
            error = OTPAttemptLimitError()
        elif not check_password(normalized_code, otp_request.code_hash):
            otp_request.attempts += 1
            if otp_request.attempts >= settings.OTP_MAX_ATTEMPTS:
                otp_request.is_used = True
                error = OTPAttemptLimitError()
            else:
                error = OTPInvalidError()
            otp_request.save(update_fields=["attempts", "is_used"])
        else:
            otp_request.is_used = True
            otp_request.save(update_fields=["is_used"])

    if error is not None:
        raise error

    if otp_request is None:
        raise OTPNotFoundError

    return otp_request
