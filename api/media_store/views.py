from django.http import HttpResponse, HttpResponseNotModified
from django.shortcuts import get_object_or_404
from django.utils.http import http_date, parse_http_date_safe
from django.views.decorators.http import require_safe

from media_store.models import MediaFile


@require_safe
def stored_media(request, name):
    # Public image bytes only, never arbitrary paths on the server filesystem.
    row = get_object_or_404(MediaFile.objects.defer("content"), pk=name)
    modified = int(row.created_at.timestamp())
    since = parse_http_date_safe(request.headers.get("If-Modified-Since", ""))
    if since is not None and since >= modified:
        response = HttpResponseNotModified()
    else:
        response = HttpResponse(
            b"" if request.method == "HEAD" else bytes(row.content),
            content_type=row.content_type,
        )
        response["Content-Length"] = row.size
    response["Last-Modified"] = http_date(modified)
    response["Cache-Control"] = "public, max-age=3600"
    response["X-Content-Type-Options"] = "nosniff"
    return response
