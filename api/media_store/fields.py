from django import forms
from django.db import models

from media_store.validation import validate_image_upload


class UploadImageFormField(forms.ImageField):
    def to_python(self, data):
        if data:
            validate_image_upload(data)
        return super().to_python(data)


class UploadImageField(models.ImageField):
    """Validate before Pillow's admin processing; use the default storage."""

    default_validators = [validate_image_upload]

    def formfield(self, **kwargs):
        return super().formfield(**{"form_class": UploadImageFormField, **kwargs})
