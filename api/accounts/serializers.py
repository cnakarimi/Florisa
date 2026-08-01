from rest_framework import serializers

from accounts.models import User
from accounts.utils import (
    IRANIAN_MOBILE_PATTERN,
    OTP_CODE_LENGTH,
    is_valid_otp_code,
    normalize_otp_code,
    normalize_phone,
)


class PhoneSerializer(serializers.Serializer):
    phone = serializers.CharField(
        max_length=32,
        trim_whitespace=True,
        error_messages={
            "blank": "شماره موبایل الزامی است.",
            "required": "شماره موبایل الزامی است.",
        },
    )

    def validate_phone(self, value: str) -> str:
        normalized = normalize_phone(value)
        if not IRANIAN_MOBILE_PATTERN.fullmatch(normalized):
            raise serializers.ValidationError(
                "شماره موبایل وارد شده معتبر نیست.",
            )
        return normalized


class VerifyOTPSerializer(PhoneSerializer):
    code = serializers.CharField(
        min_length=OTP_CODE_LENGTH,
        max_length=OTP_CODE_LENGTH,
        trim_whitespace=True,
        error_messages={
            "blank": "کد تأیید الزامی است.",
            "required": "کد تأیید الزامی است.",
            "min_length": "کد تأیید باید پنج رقمی باشد.",
            "max_length": "کد تأیید باید پنج رقمی باشد.",
        },
    )

    def validate_code(self, value: str) -> str:
        normalized = normalize_otp_code(value)
        if not is_valid_otp_code(normalized):
            raise serializers.ValidationError("کد تأیید باید پنج رقمی باشد.")
        return normalized


class UserSerializer(serializers.ModelSerializer):
    is_profile_complete = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "phone",
            "full_name",
            "email",
            "is_profile_complete",
        )
        read_only_fields = fields


class UserResponseSerializer(serializers.Serializer):
    user = UserSerializer(read_only=True)


class CompleteRegistrationSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(
        max_length=150,
        required=True,
        allow_blank=False,
        trim_whitespace=True,
    )
    email = serializers.EmailField(
        required=False,
        allow_blank=True,
        allow_null=True,
        trim_whitespace=True,
    )

    class Meta:
        model = User
        fields = ("full_name", "email")

    def validate_email(self, value: str | None) -> str | None:
        return value or None


class CompleteRegistrationValidationErrorSerializer(serializers.Serializer):
    full_name = serializers.ListField(
        child=serializers.CharField(),
        required=False,
    )
    email = serializers.ListField(
        child=serializers.CharField(),
        required=False,
    )


class DetailResponseSerializer(serializers.Serializer):
    detail = serializers.CharField()
