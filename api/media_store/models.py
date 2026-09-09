from django.db import models


class MediaFile(models.Model):
    """Temporary small-file storage in the existing persistent database."""

    name = models.CharField(max_length=255, primary_key=True)
    content = models.BinaryField()
    content_type = models.CharField(max_length=32)
    size = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
