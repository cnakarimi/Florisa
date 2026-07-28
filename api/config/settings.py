import os
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def env_list(name: str, default: str) -> list[str]:
    return [
        value.strip()
        for value in os.getenv(name, default).split(",")
        if value.strip()
    ]


SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "development-only-secret-key-change-before-production",
)
DEBUG = env_bool("DJANGO_DEBUG", True)
ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1")

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
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
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

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
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

STATIC_URL = "static/"
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
    },
    "handlers": {
        "otp_console": {
            "class": "logging.StreamHandler",
            "formatter": "message_only",
            "stream": "ext://sys.stdout",
        },
    },
    "loggers": {
        "florisa.otp": {
            "handlers": ["otp_console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}

CORS_ALLOWED_ORIGINS = env_list(
    "DJANGO_CORS_ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
)
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = env_list(
    "DJANGO_CSRF_TRUSTED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
)

SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = env_bool("DJANGO_SESSION_COOKIE_SECURE", not DEBUG)
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SECURE = env_bool("DJANGO_CSRF_COOKIE_SECURE", not DEBUG)
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_FAILURE_VIEW = "accounts.csrf.csrf_failure"

SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

OTP_EXPIRATION_SECONDS = int(os.getenv("OTP_EXPIRATION_SECONDS", "120"))
OTP_MAX_ATTEMPTS = int(os.getenv("OTP_MAX_ATTEMPTS", "5"))
OTP_DELIVERY_BACKEND = os.getenv(
    "OTP_DELIVERY_BACKEND",
    "console" if DEBUG else "sms",
).strip().lower()
