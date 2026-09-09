from django.core.exceptions import RequestDataTooBig
from django.core.files.uploadhandler import FileUploadHandler
from django.http import HttpResponse

from media_store.validation import MAX_IMAGE_BYTES


MAX_UPLOAD_REQUEST_BYTES = 20 * 1024 * 1024


class UploadLimitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.content_type == "multipart/form-data":
            try:
                length = int(request.META.get("CONTENT_LENGTH") or 0)
            except ValueError:
                length = 0
            if length > MAX_UPLOAD_REQUEST_BYTES:
                return HttpResponse("Upload request exceeds 20 MiB.", status=413)
        return self.get_response(request)


class LimitedUploadHandler(FileUploadHandler):
    """Bound file bytes before form image decoding or storage writes."""

    def __init__(self, request=None):
        super().__init__(request)
        self.total_bytes = 0

    def receive_data_chunk(self, raw_data, start):
        self.total_bytes += len(raw_data)
        if start + len(raw_data) > MAX_IMAGE_BYTES:
            raise RequestDataTooBig("Each image must be at most 5 MiB.")
        if self.total_bytes > MAX_UPLOAD_REQUEST_BYTES:
            raise RequestDataTooBig("Upload request exceeds 20 MiB.")
        return raw_data

    def file_complete(self, file_size):
        return None
