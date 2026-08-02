import logging

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.views.decorators.debug import sensitive_variables


logger = logging.getLogger("florisa.otp")
CONSOLE_BACKEND = "console"


@sensitive_variables("code")
def send_otp(phone: str, code: str) -> None:
    backend = settings.OTP_DELIVERY_BACKEND

    if backend != CONSOLE_BACKEND:
        raise ImproperlyConfigured(
            f"Unsupported OTP delivery backend: {backend!r}.",
        )
    if not settings.DEBUG:
        raise ImproperlyConfigured(
            "Console OTP delivery is only permitted when DEBUG is True.",
        )

    divider = "=" * 50
    logger.info(
        "%s\n"
        "FLORISA DEVELOPMENT OTP\n"
        "Phone: %s\n"
        "Code: %s\n"
        "Expires in: %s seconds\n"
        "%s",
        divider,
        phone,
        code,
        settings.OTP_EXPIRATION_SECONDS,
        divider,
    )
