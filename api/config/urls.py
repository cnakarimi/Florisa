from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)
from config.views import health
from media_store.views import stored_media


urlpatterns = [
    path("admin/", admin.site.urls),
    path("media/<path:name>", stored_media, name="stored-media"),
    path("api/health/", health, name="health"),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("products.urls")),
    path("api/", include("orders.urls")),
    path("api/magazine/", include("magazine.urls")),
]

if settings.ENABLE_API_DOCS:
    urlpatterns += [
        path(
            "api/schema/",
            SpectacularAPIView.as_view(),
            name="schema",
        ),
        path(
            "api/schema/swagger-ui/",
            SpectacularSwaggerView.as_view(url_name="schema"),
            name="swagger-ui",
        ),
    ]

if settings.DEBUG and settings.MEDIA_STORAGE_BACKEND == "filesystem":
    urlpatterns = static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    ) + urlpatterns
