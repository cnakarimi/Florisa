from rest_framework.exceptions import (
    AuthenticationFailed,
    NotAuthenticated,
    PermissionDenied,
)
from rest_framework.response import Response
from rest_framework.views import exception_handler


def persian_exception_handler(exc, context) -> Response | None:
    response = exception_handler(exc, context)

    if response is None:
        return None

    if isinstance(exc, (NotAuthenticated, AuthenticationFailed)):
        response.data = {"detail": "برای دسترسی باید وارد حساب کاربری شوید."}
    elif isinstance(exc, PermissionDenied):
        response.data = {"detail": "اجازه انجام این عملیات را ندارید."}

    return response
