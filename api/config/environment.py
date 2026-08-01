from collections.abc import Mapping
from dataclasses import dataclass, field

from django.core.exceptions import ImproperlyConfigured, ValidationError

from accounts.utils import (
    is_valid_otp_code,
    normalize_otp_code,
    normalize_phone,
    validate_iranian_phone,
)


TRUE_VALUES = frozenset({"1", "true", "yes", "on"})
FALSE_VALUES = frozenset({"0", "false", "no", "off"})


@dataclass(frozen=True)
class DemoOTPConfig:
    enabled: bool
    only: bool
    phone: str
    code: str = field(repr=False)


def _read_bool(
    environment: Mapping[str, str],
    name: str,
    *,
    default: bool = False,
) -> bool:
    raw_value = environment.get(name)
    if raw_value is None or not raw_value.strip():
        return default

    value = raw_value.strip().lower()
    if value in TRUE_VALUES:
        return True
    if value in FALSE_VALUES:
        return False
    raise ImproperlyConfigured(
        f"{name} must be a boolean value (true/false).",
    )


def load_demo_otp_config(
    environment: Mapping[str, str],
) -> DemoOTPConfig:
    enabled = _read_bool(environment, "DEMO_OTP_ENABLED")
    only = _read_bool(environment, "DEMO_OTP_ONLY")
    phone = normalize_phone(environment.get("DEMO_OTP_PHONE", ""))
    code = normalize_otp_code(environment.get("DEMO_OTP_CODE", ""))

    if only and not enabled:
        raise ImproperlyConfigured(
            "DEMO_OTP_ONLY requires DEMO_OTP_ENABLED=true.",
        )

    if enabled:
        if not phone:
            raise ImproperlyConfigured(
                "DEMO_OTP_PHONE is required when demo OTP mode is enabled.",
            )
        try:
            validate_iranian_phone(phone)
        except ValidationError as error:
            raise ImproperlyConfigured(
                "DEMO_OTP_PHONE must be a valid Iranian mobile number.",
            ) from error

        if not code:
            raise ImproperlyConfigured(
                "DEMO_OTP_CODE is required when demo OTP mode is enabled.",
            )
        if not is_valid_otp_code(code):
            raise ImproperlyConfigured(
                "DEMO_OTP_CODE must have the same five-digit format as "
                "normal OTP codes.",
            )

    return DemoOTPConfig(
        enabled=enabled,
        only=only,
        phone=phone,
        code=code,
    )
