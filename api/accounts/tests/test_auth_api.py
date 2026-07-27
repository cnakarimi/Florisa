from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth.hashers import check_password
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from accounts.models import OTPRequest, User


class AuthenticationAPITests(APITestCase):
    phone = "09123456789"
    code = "12345"

    def request_otp(self, phone: str | None = None):
        with patch(
            "accounts.services.otp.generate_otp",
            return_value=self.code,
        ):
            return self.client.post(
                reverse("accounts:request-otp"),
                {"phone": phone or self.phone},
                format="json",
            )

    def verify_otp(self, phone: str | None = None, code: str | None = None):
        return self.client.post(
            reverse("accounts:verify-otp"),
            {
                "phone": phone or self.phone,
                "code": code or self.code,
            },
            format="json",
        )

    def test_valid_phone_otp_request_hashes_code(self):
        response = self.request_otp("۰۹۱۲۳۴۵۶۷۸۹")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        otp_request = OTPRequest.objects.get()
        self.assertEqual(otp_request.phone, self.phone)
        self.assertNotEqual(otp_request.code_hash, self.code)
        self.assertTrue(check_password(self.code, otp_request.code_hash))
        self.assertIn("csrftoken", response.cookies)

    def test_invalid_phone_is_rejected_in_persian(self):
        response = self.request_otp("02112345678")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("معتبر نیست", str(response.data))
        self.assertFalse(OTPRequest.objects.exists())

    def test_new_request_invalidates_previous_active_otp(self):
        self.request_otp()
        first_request = OTPRequest.objects.get()

        self.request_otp()

        first_request.refresh_from_db()
        self.assertTrue(first_request.is_used)
        self.assertEqual(OTPRequest.objects.filter(is_used=False).count(), 1)

    def test_expired_otp_is_rejected_and_invalidated(self):
        self.request_otp()
        otp_request = OTPRequest.objects.get()
        otp_request.expires_at = timezone.now() - timedelta(seconds=1)
        otp_request.save(update_fields=["expires_at"])

        response = self.verify_otp()

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("پایان رسیده", response.data["detail"])
        otp_request.refresh_from_db()
        self.assertTrue(otp_request.is_used)

    def test_wrong_otp_increments_attempts(self):
        self.request_otp()

        response = self.verify_otp(code="54321")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("صحیح نیست", response.data["detail"])
        self.assertEqual(OTPRequest.objects.get().attempts, 1)

    @override_settings(OTP_MAX_ATTEMPTS=3)
    def test_attempt_limit_invalidates_otp(self):
        self.request_otp()

        first = self.verify_otp(code="00000")
        second = self.verify_otp(code="00000")
        third = self.verify_otp(code="00000")

        self.assertEqual(first.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(second.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(third.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        otp_request = OTPRequest.objects.get()
        self.assertEqual(otp_request.attempts, 3)
        self.assertTrue(otp_request.is_used)

    def test_successful_verification_creates_user_and_session(self):
        self.request_otp()

        response = self.verify_otp()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(response.data["user"]["phone"], self.phone)
        self.assertIn("_auth_user_id", self.client.session)

    def test_otp_is_single_use(self):
        self.request_otp()
        first_response = self.verify_otp()
        second_response = self.verify_otp()

        self.assertEqual(first_response.status_code, status.HTTP_200_OK)
        self.assertEqual(second_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("یافت نشد", second_response.data["detail"])

    def test_existing_user_is_logged_in_without_duplicate(self):
        user = User.objects.create_user(phone=self.phone, full_name="کاربر موجود")
        self.request_otp()

        response = self.verify_otp()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(response.data["user"]["id"], user.id)

    def test_persian_phone_and_code_are_normalized_for_verification(self):
        self.request_otp()

        response = self.verify_otp(
            phone="۰۹۱۲۳۴۵۶۷۸۹",
            code="۱۲۳۴۵",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"]["phone"], self.phone)

    def test_authenticated_me_returns_current_user(self):
        user = User.objects.create_user(phone=self.phone, full_name="سینا رضایی")
        self.client.force_login(user)

        response = self.client.get(reverse("accounts:me"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"]["phone"], self.phone)
        self.assertEqual(response.data["user"]["full_name"], "سینا رضایی")

    def test_me_rejects_anonymous_user_with_persian_message(self):
        response = self.client.get(reverse("accounts:me"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("وارد حساب", response.data["detail"])

    def test_logout_clears_authenticated_session(self):
        self.request_otp()
        self.verify_otp()
        csrf_token = self.client.cookies["csrftoken"].value

        response = self.client.post(
            reverse("accounts:logout"),
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        me_response = self.client.get(reverse("accounts:me"))
        self.assertEqual(me_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_verification_and_logout_enforce_csrf(self):
        strict_client = APIClient(enforce_csrf_checks=True)
        with patch(
            "accounts.services.otp.generate_otp",
            return_value=self.code,
        ):
            request_response = strict_client.post(
                reverse("accounts:request-otp"),
                {"phone": self.phone},
                format="json",
            )

        csrf_token = request_response.cookies["csrftoken"].value
        rejected_verify = strict_client.post(
            reverse("accounts:verify-otp"),
            {"phone": self.phone, "code": self.code},
            format="json",
        )
        accepted_verify = strict_client.post(
            reverse("accounts:verify-otp"),
            {"phone": self.phone, "code": self.code},
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(
            rejected_verify.status_code,
            status.HTTP_403_FORBIDDEN,
        )
        self.assertEqual(accepted_verify.status_code, status.HTTP_200_OK)

        rotated_token = strict_client.cookies["csrftoken"].value
        rejected_logout = strict_client.post(
            reverse("accounts:logout"),
            format="json",
        )
        accepted_logout = strict_client.post(
            reverse("accounts:logout"),
            format="json",
            HTTP_X_CSRFTOKEN=rotated_token,
        )

        self.assertEqual(
            rejected_logout.status_code,
            status.HTTP_403_FORBIDDEN,
        )
        self.assertEqual(accepted_logout.status_code, status.HTTP_204_NO_CONTENT)
