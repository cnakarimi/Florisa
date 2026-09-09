from pathlib import PurePosixPath

from django.core.files.base import ContentFile
from django.core.files.storage import Storage
from django.db import IntegrityError, transaction
from django.urls import reverse
from django.utils.deconstruct import deconstructible

from media_store.models import MediaFile
from media_store.validation import IMAGE_FORMATS, MAX_IMAGE_BYTES, validate_image_upload


@deconstructible
class DatabaseMediaStorage(Storage):
    def _open(self, name, mode="rb"):
        if mode not in {"r", "rb"}:
            raise ValueError("Database media files are read-only; use save().")
        try:
            row = MediaFile.objects.only("content").get(pk=name)
        except MediaFile.DoesNotExist as error:
            raise FileNotFoundError(name) from error
        return ContentFile(bytes(row.content), name=name)

    def _save(self, name, content):
        content.seek(0)
        data = content.read(MAX_IMAGE_BYTES + 1)
        validate_image_upload(ContentFile(data, name=name))
        content_type = "image/" + IMAGE_FORMATS[PurePosixPath(name).suffix.lower()].lower()
        original_name = name
        while True:
            try:
                with transaction.atomic():
                    MediaFile.objects.create(
                        name=name, content=data, size=len(data), content_type=content_type,
                    )
                return name
            except IntegrityError:
                if not self.exists(name):
                    raise
                name = self.get_available_name(original_name, max_length=len(original_name))

    def exists(self, name):
        return MediaFile.objects.filter(pk=name).exists()

    def delete(self, name):
        MediaFile.objects.filter(pk=name).delete()

    def size(self, name):
        try:
            return MediaFile.objects.values_list("size", flat=True).get(pk=name)
        except MediaFile.DoesNotExist as error:
            raise FileNotFoundError(name) from error

    def url(self, name):
        return reverse("stored-media", kwargs={"name": name})
