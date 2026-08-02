import re
from pathlib import PurePosixPath
from urllib.parse import urlsplit

from django.core.exceptions import ValidationError


SUPPORTED_REPOSITORY_IMAGE_EXTENSIONS = {
    ".avif",
    ".gif",
    ".jpeg",
    ".jpg",
    ".png",
    ".webp",
}


def validate_repository_image_path(value: str | None) -> None:
    if not value:
        return

    if value != value.strip():
        raise ValidationError("نام فایل تصویر نباید فاصله اضافی داشته باشد.")

    if "\\" in value:
        raise ValidationError("مسیر تصویر باید با / نوشته شود، نه \\.")

    parsed = urlsplit(value)
    if parsed.scheme or parsed.netloc or value.startswith(("/", "//")):
        raise ValidationError("فقط نام یا مسیر نسبی فایل تصویر مجاز است.")

    if re.match(r"^[a-zA-Z]:", value):
        raise ValidationError("مسیر مطلق سیستم‌عامل مجاز نیست.")

    raw_parts = value.split("/")
    if any(part in {"", ".", ".."} for part in raw_parts):
        raise ValidationError("مسیر تصویر نامعتبر است.")

    extension = PurePosixPath(value).suffix.lower()
    if extension not in SUPPORTED_REPOSITORY_IMAGE_EXTENSIONS:
        supported = "، ".join(
            sorted(SUPPORTED_REPOSITORY_IMAGE_EXTENSIONS),
        )
        raise ValidationError(
            f"پسوند تصویر پشتیبانی نمی‌شود. پسوندهای مجاز: {supported}",
        )
