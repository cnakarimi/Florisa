from pathlib import PurePosixPath
import warnings

from django.core.exceptions import ValidationError
from PIL import Image, UnidentifiedImageError


MAX_IMAGE_BYTES = 5 * 1024 * 1024
MAX_IMAGE_PIXELS = 16_000_000
IMAGE_FORMATS = {".jpg": "JPEG", ".jpeg": "JPEG", ".png": "PNG", ".webp": "WEBP"}


def validate_image_upload(value):
    # Existing references may point to lost files; don't fetch them during edits.
    if not value or getattr(value, "_committed", False):
        return
    expected_format = IMAGE_FORMATS.get(PurePosixPath(value.name).suffix.lower())
    if expected_format is None:
        raise ValidationError("فقط تصاویر JPG، PNG و WebP مجاز هستند.")
    if value.size > MAX_IMAGE_BYTES:
        raise ValidationError("حجم تصویر نباید بیشتر از ۵ مگابایت باشد.")
    position = value.tell()
    try:
        value.seek(0)
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(value) as image:
                if image.format != expected_format:
                    raise ValidationError("فرمت تصویر با پسوند فایل مطابقت ندارد.")
                if image.width * image.height > MAX_IMAGE_PIXELS or max(image.size) > 8192:
                    raise ValidationError("تصویر باید حداکثر ۱۶ مگاپیکسل و هر ضلع حداکثر ۸۱۹۲ پیکسل باشد.")
                if getattr(image, "is_animated", False):
                    raise ValidationError("تصویر متحرک مجاز نیست.")
                image.verify()
    except (UnidentifiedImageError, OSError, SyntaxError, Image.DecompressionBombError,
            Image.DecompressionBombWarning) as error:
        raise ValidationError("فایل تصویر معتبر نیست.") from error
    finally:
        value.seek(position)
