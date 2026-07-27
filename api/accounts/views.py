from django.contrib.auth import login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.serializers import (
    PhoneSerializer,
    UserSerializer,
    VerifyOTPSerializer,
)
from accounts.services.otp import OTPError, create_otp, verify_otp


@method_decorator(ensure_csrf_cookie, name="dispatch")
class RequestOTPView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = PhoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        create_otp(serializer.validated_data["phone"])
        return Response(
            {"detail": "کد تأیید ارسال شد."},
            status=status.HTTP_200_OK,
        )


@method_decorator(ensure_csrf_cookie, name="dispatch")
@method_decorator(csrf_protect, name="dispatch")
class VerifyOTPView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data["phone"]

        try:
            verify_otp(phone, serializer.validated_data["code"])
        except OTPError as error:
            return Response(
                {"detail": error.message},
                status=error.status_code,
            )

        try:
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            user = User.objects.create_user(phone=phone)
        login(
            request,
            user,
            backend="django.contrib.auth.backends.ModelBackend",
        )
        return Response(
            {"user": UserSerializer(user).data},
            status=status.HTTP_200_OK,
        )


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        return Response({"user": UserSerializer(request.user).data})


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)
