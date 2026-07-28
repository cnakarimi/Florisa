import secrets
from dataclasses import dataclass
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.db import transaction
from django.utils import timezone

from accounts.models import OTPRequest
from accounts.services.providers import send_otp
from accounts.utils import (
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


@dataclass(frozen=True)
class CreatedOTP:
    request: OTPRequest
    code: str


def generate_otp() -> str:
    return f"{secrets.randbelow(100_000):05d}"


@transaction.atomic
def create_otp(phone: str) -> CreatedOTP:
    normalized_phone = normalize_phone(phone)
    validate_iranian_phone(normalized_phone)

    OTPRequest.objects.filter(
        phone=normalized_phone,
        is_used=False,
    ).update(is_used=True)

    code = generate_otp()
    otp_request = OTPRequest.objects.create(
        phone=normalized_phone,
        code_hash=make_password(code),
        expires_at=timezone.now()
        + timedelta(seconds=settings.OTP_EXPIRATION_SECONDS),
    )
    send_otp(normalized_phone, code)
    return CreatedOTP(request=otp_request, code=code)


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
