from django.contrib.auth import login, logout
from django.db import transaction
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.serializers import (
    CompleteRegistrationSerializer,
    CompleteRegistrationValidationErrorSerializer,
    DetailResponseSerializer,
    PhoneSerializer,
    ProfileUpdateSerializer,
    ProfileUpdateValidationErrorSerializer,
    UserResponseSerializer,
    UserSerializer,
    VerifyOTPSerializer,
)
from accounts.services.otp import (
    OTPDemoAccountError,
    OTPError,
    create_otp,
    verify_otp,
)


@method_decorator(ensure_csrf_cookie, name="dispatch")
class CSRFView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        responses={
            200: OpenApiResponse(description="CSRF cookie initialized."),
        },
    )
    def get(self, request: Request) -> Response:
        return Response({"detail": "کوکی امنیتی تنظیم شد."})


@method_decorator(ensure_csrf_cookie, name="dispatch")
@method_decorator(csrf_protect, name="dispatch")
class RequestOTPView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        request=PhoneSerializer,
        responses={
            200: OpenApiResponse(description="OTP sent."),
        },
    )
    def post(self, request: Request) -> Response:
        serializer = PhoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            create_otp(serializer.validated_data["phone"])
        except OTPError as error:
            return Response(
                {"detail": error.message},
                status=error.status_code,
            )
        return Response(
            {"detail": "کد تأیید ارسال شد."},
            status=status.HTTP_200_OK,
        )


@method_decorator(ensure_csrf_cookie, name="dispatch")
@method_decorator(csrf_protect, name="dispatch")
class VerifyOTPView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        request=VerifyOTPSerializer,
        responses={
            200: OpenApiResponse(
                response=UserResponseSerializer,
                description="Authenticated user, returned under the `user` key.",
            ),
        },
    )
    def post(self, request: Request) -> Response:
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data["phone"]

        try:
            otp_request = verify_otp(
                phone,
                serializer.validated_data["code"],
            )
        except OTPError as error:
            return Response(
                {"detail": error.message},
                status=error.status_code,
            )

        with transaction.atomic():
            try:
                user = User.objects.select_for_update().get(phone=phone)
            except User.DoesNotExist:
                user = User.objects.create_user(
                    phone=phone,
                    is_staff=False,
                    is_superuser=False,
                )

            if otp_request.is_demo and (user.is_staff or user.is_superuser):
                error = OTPDemoAccountError()
                return Response(
                    {"detail": error.message},
                    status=error.status_code,
                )

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

    @extend_schema(
        responses={
            200: OpenApiResponse(
                response=UserResponseSerializer,
                description="Current user, returned under the `user` key.",
            ),
        },
    )
    def get(self, request: Request) -> Response:
        return Response({"user": UserSerializer(request.user).data})

    @extend_schema(
        auth=[{"cookieAuth": []}],
        request=ProfileUpdateSerializer,
        responses={
            200: OpenApiResponse(
                response=UserResponseSerializer,
                description="Current user profile updated successfully.",
            ),
            400: OpenApiResponse(
                response=ProfileUpdateValidationErrorSerializer,
                description="Validation error.",
            ),
            403: OpenApiResponse(
                response=DetailResponseSerializer,
                description="Authentication required.",
            ),
        },
    )
    def patch(self, request: Request) -> Response:
        serializer = ProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({"user": UserSerializer(user).data})


class CompleteRegistrationView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        auth=[{"cookieAuth": []}],
        request=CompleteRegistrationSerializer,
        responses={
            200: OpenApiResponse(
                response=UserResponseSerializer,
                description="Profile completed or updated successfully.",
            ),
            400: OpenApiResponse(
                response=CompleteRegistrationValidationErrorSerializer,
                description="Validation error.",
            ),
            403: OpenApiResponse(
                response=DetailResponseSerializer,
                description="Authentication required.",
            ),
        },
    )
    def post(self, request: Request) -> Response:
        serializer = CompleteRegistrationSerializer(
            request.user,
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"user": UserSerializer(user).data},
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=None,
        responses={204: None},
    )
    def post(self, request: Request) -> Response:
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)
