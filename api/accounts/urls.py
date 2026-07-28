from django.urls import path

from accounts.views import (
    CSRFView,
    CompleteRegistrationView,
    CurrentUserView,
    LogoutView,
    RequestOTPView,
    VerifyOTPView,
)


app_name = "accounts"

urlpatterns = [
    path("csrf/", CSRFView.as_view(), name="csrf"),
    path("request-otp/", RequestOTPView.as_view(), name="request-otp"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path(
        "complete-registration/",
        CompleteRegistrationView.as_view(),
        name="complete-registration",
    ),
    path("me/", CurrentUserView.as_view(), name="me"),
    path("logout/", LogoutView.as_view(), name="logout"),
]
