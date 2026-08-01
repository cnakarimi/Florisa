import os
from pathlib import Path

import dj_database_url
from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

from config.environment import load_demo_otp_config


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def env_list(name: str, default: str = "") -> list[str]:
    return [
        value.strip()
        for value in os.getenv(name, default).split(",")
        if value.strip()
    ]


ON_RENDER = env_bool("RENDER", False)
DEBUG = env_bool(
    "DEBUG",
    env_bool("DJANGO_DEBUG", not ON_RENDER),
)

SECRET_KEY = os.getenv("SECRET_KEY") or os.getenv("DJANGO_SECRET_KEY")
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = "development-only-secret-key-change-before-production"
    else:
        raise ImproperlyConfigured(
            "SECRET_KEY must be set when DEBUG is False.",
        )

ALLOWED_HOSTS = env_list(
    "ALLOWED_HOSTS",
    os.getenv(
        "DJANGO_ALLOWED_HOSTS",
        "localhost,127.0.0.1" if DEBUG else "",
    ),
)
FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:3000" if DEBUG else "",
).strip().rstrip("/")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "drf_spectacular",
    "accounts",
    "products.apps.ProductsConfig",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=60,
            conn_health_checks=True,
            ssl_require=not DEBUG,
        ),
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        },
    }

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        ),
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = "fa-ir"
TIME_ZONE = "Asia/Tehran"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": (
            "whitenoise.storage.CompressedManifestStaticFilesStorage"
        ),
    },
}

MEDIA_STORAGE_BACKEND = os.getenv(
    "MEDIA_STORAGE_BACKEND",
    "filesystem",
).strip().lower()
if MEDIA_STORAGE_BACKEND == "s3":
    AWS_STORAGE_BUCKET_NAME = os.getenv("AWS_STORAGE_BUCKET_NAME", "").strip()
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "").strip()
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "").strip()
    if not all(
        (
            AWS_STORAGE_BUCKET_NAME,
            AWS_ACCESS_KEY_ID,
            AWS_SECRET_ACCESS_KEY,
        ),
    ):
        raise ImproperlyConfigured(
            "S3 media storage requires AWS_STORAGE_BUCKET_NAME, "
            "AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY.",
        )

    INSTALLED_APPS.append("storages")
    STORAGES["default"] = {
        "BACKEND": "storages.backends.s3.S3Storage",
    }
    AWS_S3_ENDPOINT_URL = (
        os.getenv("AWS_S3_ENDPOINT_URL", "").strip() or None
    )
    AWS_S3_REGION_NAME = (
        os.getenv("AWS_S3_REGION_NAME", "").strip() or None
    )
    AWS_S3_CUSTOM_DOMAIN = (
        os.getenv("AWS_S3_CUSTOM_DOMAIN", "").strip() or None
    )
    AWS_S3_SIGNATURE_VERSION = "s3v4"
    AWS_DEFAULT_ACL = None
    AWS_QUERYSTRING_AUTH = env_bool("AWS_QUERYSTRING_AUTH", False)
    AWS_S3_FILE_OVERWRITE = False
elif MEDIA_STORAGE_BACKEND != "filesystem":
    raise ImproperlyConfigured(
        "MEDIA_STORAGE_BACKEND must be 'filesystem' or 's3'.",
    )

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "accounts.User"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "EXCEPTION_HANDLER": "accounts.exceptions.persian_exception_handler",
}

DEFAULT_EXCEPTION_REPORTER_FILTER = (
    "config.exception_filters.FlorisaExceptionReporterFilter"
)

SPECTACULAR_SETTINGS = {
    "TITLE": "Florisa API",
    "DESCRIPTION": "Florisa Backend API",
    "VERSION": "1.0.0",
    "SWAGGER_UI_SETTINGS": r"""
    {
      deepLinking: true,
      withCredentials: true,
      requestInterceptor: (request) => {
        request.credentials = "same-origin";
        const method = (request.method || "GET").toUpperCase();
        const requestOrigin = new URL(
          request.url,
          window.location.href,
        ).origin;
        const csrfCookie = document.cookie
          .split(";")
          .map((cookie) => cookie.trim())
          .find((cookie) => cookie.startsWith("csrftoken="));
        if (
          csrfCookie
          && requestOrigin === window.location.origin
          && ["POST", "PUT", "PATCH", "DELETE"].includes(method)
        ) {
          request.headers["X-CSRFToken"] = decodeURIComponent(
            csrfCookie.substring("csrftoken=".length),
          );
        }
        return request;
      },
    }
    """,
}

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "message_only": {
            "format": "{message}",
            "style": "{",
        },
        "standard": {
            "format": (
                "{asctime} {levelname} {name} "
                "{process:d} {thread:d} {message}"
            ),
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "standard",
            "stream": "ext://sys.stdout",
        },
        "otp_console": {
            "class": "logging.StreamHandler",
            "formatter": "message_only",
            "stream": "ext://sys.stdout",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": os.getenv("DJANGO_LOG_LEVEL", "INFO"),
            "propagate": False,
        },
        "florisa.otp": {
            "handlers": ["otp_console"],
            "level": "INFO",
            "propagate": False,
        },
    },
    "root": {
        "handlers": ["console"],
        "level": os.getenv("LOG_LEVEL", "INFO"),
    },
}

CORS_ALLOWED_ORIGINS = env_list(
    "CORS_ALLOWED_ORIGINS",
    os.getenv(
        "DJANGO_CORS_ALLOWED_ORIGINS",
        (
            "http://localhost:3000,http://127.0.0.1:3000"
            if DEBUG
            else ""
        ),
    ),
)
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = env_list(
    "CSRF_TRUSTED_ORIGINS",
    os.getenv(
        "DJANGO_CSRF_TRUSTED_ORIGINS",
        (
            "http://localhost:3000,http://127.0.0.1:3000"
            if DEBUG
            else ""
        ),
    ),
)

SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = env_bool(
    "SESSION_COOKIE_SECURE",
    env_bool("DJANGO_SESSION_COOKIE_SECURE", not DEBUG),
)
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SECURE = env_bool(
    "CSRF_COOKIE_SECURE",
    env_bool("DJANGO_CSRF_COOKIE_SECURE", not DEBUG),
)
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_FAILURE_VIEW = "accounts.csrf.csrf_failure"

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = env_bool("SECURE_SSL_REDIRECT", not DEBUG)
SECURE_HSTS_SECONDS = int(
    os.getenv("SECURE_HSTS_SECONDS", "31536000" if not DEBUG else "0"),
)
SECURE_HSTS_INCLUDE_SUBDOMAINS = env_bool(
    "SECURE_HSTS_INCLUDE_SUBDOMAINS",
    not DEBUG,
)
SECURE_HSTS_PRELOAD = env_bool("SECURE_HSTS_PRELOAD", not DEBUG)
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
ENABLE_API_DOCS = env_bool("ENABLE_API_DOCS", DEBUG)

OTP_EXPIRATION_SECONDS = int(os.getenv("OTP_EXPIRATION_SECONDS", "120"))
OTP_MAX_ATTEMPTS = int(os.getenv("OTP_MAX_ATTEMPTS", "5"))
OTP_DELIVERY_BACKEND = os.getenv(
    "OTP_DELIVERY_BACKEND",
    "console" if DEBUG else "sms",
).strip().lower()

demo_otp_config = load_demo_otp_config(os.environ)
DEMO_OTP_ENABLED = demo_otp_config.enabled
DEMO_OTP_ONLY = demo_otp_config.only
DEMO_OTP_PHONE = demo_otp_config.phone
DEMO_OTP_CODE = demo_otp_config.code
