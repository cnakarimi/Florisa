import re

from django.core.exceptions import ValidationError


PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹"
ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩"
ASCII_DIGITS = "0123456789"
IRANIAN_MOBILE_PATTERN = re.compile(r"^09\d{9}$")

_DIGIT_TRANSLATION = str.maketrans(
    PERSIAN_DIGITS + ARABIC_DIGITS,
    ASCII_DIGITS + ASCII_DIGITS,
)


def normalize_digits(value: object) -> str:
    return str(value).translate(_DIGIT_TRANSLATION)


def normalize_phone(value: object) -> str:
    phone = normalize_digits(value).strip()
    phone = re.sub(r"[\s\-()]", "", phone)

    if phone.startswith("+98"):
        phone = f"0{phone[3:]}"
    elif phone.startswith("0098"):
        phone = f"0{phone[4:]}"
    elif phone.startswith("98") and len(phone) == 12:
        phone = f"0{phone[2:]}"

    return phone


def validate_iranian_phone(value: object) -> None:
    if not IRANIAN_MOBILE_PATTERN.fullmatch(normalize_phone(value)):
        raise ValidationError("شماره موبایل وارد شده معتبر نیست.")


def normalize_otp_code(value: object) -> str:
    return normalize_digits(value).strip()
