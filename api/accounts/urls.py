from django.urls import path

from accounts.views import (
    CurrentUserView,
    LogoutView,
    RequestOTPView,
    VerifyOTPView,
)


app_name = "accounts"

urlpatterns = [
    path("request-otp/", RequestOTPView.as_view(), name="request-otp"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path("me/", CurrentUserView.as_view(), name="me"),
    path("logout/", LogoutView.as_view(), name="logout"),
]
