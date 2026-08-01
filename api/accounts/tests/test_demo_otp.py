import json
from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth.hashers import check_password
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from accounts.models import OTPRequest, User


DEMO_PHONE = "09012345678"
DEMO_CODE = "73194"
NON_DEMO_PHONE = "09123456789"


@override_settings(
    DEMO_OTP_ENABLED=True,
    DEMO_OTP_ONLY=False,
    DEMO_OTP_PHONE=DEMO_PHONE,
    DEMO_OTP_CODE=DEMO_CODE,
)
class DemoOTPTests(APITestCase):
    def request_otp(self, phone: str = DEMO_PHONE):
        return self.client.post(
            reverse("accounts:request-otp"),
            {"phone": phone},
            format="json",
        )

    def verify_otp(self, code: str = DEMO_CODE):
        return self.client.post(
            reverse("accounts:verify-otp"),
            {"phone": DEMO_PHONE, "code": code},
            format="json",
        )

    def test_demo_request_skips_generation_and_delivery(self):
        with patch("accounts.services.otp.generate_otp") as generate, patch(
            "accounts.services.otp.send_otp",
        ) as delivery:
            response = self.request_otp("+989012345678")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"detail": "کد تأیید ارسال شد."})
        generate.assert_not_called()
        delivery.assert_not_called()

    def test_new_demo_request_invalidates_previous_active_challenge(self):
        self.request_otp()
        first_request = OTPRequest.objects.get()

        self.request_otp()

        first_request.refresh_from_db()
        self.assertTrue(first_request.is_used)
        self.assertEqual(
            OTPRequest.objects.filter(is_used=False, is_demo=True).count(),
            1,
        )

    def test_demo_code_uses_normal_hashed_persistence(self):
        self.request_otp()

        otp_request = OTPRequest.objects.get()
        self.assertTrue(otp_request.is_demo)
        self.assertNotEqual(otp_request.code_hash, DEMO_CODE)
        self.assertTrue(check_password(DEMO_CODE, otp_request.code_hash))
        self.assertNotIn(
            "code",
            {field.name for field in OTPRequest._meta.concrete_fields},
        )

    def test_demo_code_is_absent_from_response_and_otp_logs(self):
        with self.assertNoLogs("florisa.otp", level="INFO"):
            response = self.request_otp()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn(DEMO_CODE, json.dumps(response.data))
        self.assertNotIn("code", response.data)

    def test_demo_code_verifies_through_existing_endpoint(self):
        self.request_otp()

        response = self.verify_otp()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user = User.objects.get(phone=DEMO_PHONE)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertEqual(response.data["user"]["id"], user.id)
        self.assertIn("_auth_user_id", self.client.session)

    def test_incorrect_demo_code_is_rejected(self):
        self.request_otp()

        response = self.verify_otp("54321")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(OTPRequest.objects.get().attempts, 1)
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_expired_demo_code_is_rejected(self):
        self.request_otp()
        OTPRequest.objects.update(
            expires_at=timezone.now() - timedelta(seconds=1),
        )

        response = self.verify_otp()

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(OTPRequest.objects.get().is_used)
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_consumed_demo_code_cannot_be_reused(self):
        self.request_otp()

        first_response = self.verify_otp()
        second_response = self.verify_otp()

        self.assertEqual(first_response.status_code, status.HTTP_200_OK)
        self.assertEqual(second_response.status_code, status.HTTP_400_BAD_REQUEST)

    @override_settings(OTP_MAX_ATTEMPTS=2)
    def test_demo_code_keeps_existing_verification_attempt_limit(self):
        self.request_otp()

        first_response = self.verify_otp("00000")
        second_response = self.verify_otp("00000")
        replay_response = self.verify_otp()

        self.assertEqual(first_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            second_response.status_code,
            status.HTTP_429_TOO_MANY_REQUESTS,
        )
        self.assertEqual(replay_response.status_code, status.HTTP_400_BAD_REQUEST)
        otp_request = OTPRequest.objects.get()
        self.assertEqual(otp_request.attempts, 2)
        self.assertTrue(otp_request.is_used)

    @override_settings(DEMO_OTP_ONLY=True)
    def test_demo_only_rejects_non_demo_phone_with_existing_error_schema(self):
        with patch("accounts.services.otp.send_otp") as delivery:
            response = self.request_otp(NON_DEMO_PHONE)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(set(response.data), {"detail"})
        self.assertIn("نسخه نمایشی", response.data["detail"])
        self.assertFalse(OTPRequest.objects.exists())
        delivery.assert_not_called()

    def test_non_demo_phone_uses_normal_provider_when_demo_only_is_false(self):
        with patch(
            "accounts.services.otp.generate_otp",
            return_value="48261",
        ), patch("accounts.services.otp.send_otp") as delivery:
            response = self.request_otp(NON_DEMO_PHONE)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        delivery.assert_called_once_with(NON_DEMO_PHONE, "48261")
        self.assertFalse(OTPRequest.objects.get().is_demo)

    def test_existing_privileged_demo_account_is_rejected_at_request(self):
        for field in ("is_staff", "is_superuser"):
            with self.subTest(field=field):
                User.objects.create_user(DEMO_PHONE, **{field: True})

                response = self.request_otp()

                self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
                self.assertEqual(set(response.data), {"detail"})
                self.assertFalse(OTPRequest.objects.exists())
                self.assertNotIn("_auth_user_id", self.client.session)
                User.objects.all().delete()

    def test_account_promoted_after_demo_request_cannot_authenticate(self):
        self.request_otp()
        User.objects.create_user(DEMO_PHONE, is_staff=True)

        response = self.verify_otp()

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(OTPRequest.objects.get().is_used)
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_account_promoted_to_superuser_after_request_cannot_authenticate(self):
        self.request_otp()
        User.objects.create_user(DEMO_PHONE, is_superuser=True)

        response = self.verify_otp()

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(OTPRequest.objects.get().is_used)
        self.assertNotIn("_auth_user_id", self.client.session)

    @override_settings(DEMO_OTP_ONLY=True)
    def test_demo_only_does_not_block_other_authentication_endpoints(self):
        csrf_response = self.client.get(reverse("accounts:csrf"))
        self.request_otp()
        verify_response = self.verify_otp()
        me_response = self.client.get(reverse("accounts:me"))
        profile_response = self.client.post(
            reverse("accounts:complete-registration"),
            {"full_name": "Portfolio Demo"},
            format="json",
        )
        logout_response = self.client.post(
            reverse("accounts:logout"),
            format="json",
        )
        logged_out_me_response = self.client.get(reverse("accounts:me"))

        self.assertEqual(csrf_response.status_code, status.HTTP_200_OK)
        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            profile_response.data["user"]["full_name"],
            "Portfolio Demo",
        )
        self.assertEqual(logout_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(
            logged_out_me_response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    @override_settings(DEMO_OTP_ONLY=True)
    def test_demo_only_preserves_csrf_enforcement(self):
        strict_client = APIClient(enforce_csrf_checks=True)
        csrf_response = strict_client.get(reverse("accounts:csrf"))
        csrf_token = csrf_response.cookies["csrftoken"].value

        rejected_request = strict_client.post(
            reverse("accounts:request-otp"),
            {"phone": DEMO_PHONE},
            format="json",
        )
        accepted_request = strict_client.post(
            reverse("accounts:request-otp"),
            {"phone": DEMO_PHONE},
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        rejected_verify = strict_client.post(
            reverse("accounts:verify-otp"),
            {"phone": DEMO_PHONE, "code": DEMO_CODE},
            format="json",
        )
        accepted_verify = strict_client.post(
            reverse("accounts:verify-otp"),
            {"phone": DEMO_PHONE, "code": DEMO_CODE},
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(
            rejected_request.status_code,
            status.HTTP_403_FORBIDDEN,
        )
        self.assertEqual(accepted_request.status_code, status.HTTP_200_OK)
        self.assertEqual(
            rejected_verify.status_code,
            status.HTTP_403_FORBIDDEN,
        )
        self.assertEqual(accepted_verify.status_code, status.HTTP_200_OK)

    def test_demo_mode_does_not_change_public_openapi_contract(self):
        response = self.client.get(
            reverse("schema"),
            HTTP_ACCEPT="application/vnd.oai.openapi+json",
        )
        schema = json.loads(response.content)

        request_operation = schema["paths"][
            reverse("accounts:request-otp")
        ]["post"]
        verify_operation = schema["paths"][
            reverse("accounts:verify-otp")
        ]["post"]

        self.assertEqual(
            request_operation["requestBody"]["content"][
                "application/json"
            ]["schema"],
            {"$ref": "#/components/schemas/Phone"},
        )
        self.assertEqual(set(request_operation["responses"]), {"200"})
        self.assertEqual(
            verify_operation["requestBody"]["content"][
                "application/json"
            ]["schema"],
            {"$ref": "#/components/schemas/VerifyOTP"},
        )
        self.assertFalse(
            any("demo" in path for path in schema["paths"]),
        )
        self.assertEqual(
            set(schema["components"]["schemas"]["Phone"]["properties"]),
            {"phone"},
        )
        self.assertEqual(
            set(
                schema["components"]["schemas"]["VerifyOTP"][
                    "properties"
                ],
            ),
            {"phone", "code"},
        )
        self.assertNotIn(DEMO_CODE, json.dumps(schema))
        self.assertNotIn("SMS.ir", json.dumps(schema))


@override_settings(
    DEMO_OTP_ENABLED=False,
    DEMO_OTP_ONLY=False,
    DEMO_OTP_PHONE="",
    DEMO_OTP_CODE="",
)
class DemoOTPDisabledTests(APITestCase):
    def test_disabled_demo_mode_calls_normal_provider(self):
        with patch(
            "accounts.services.otp.generate_otp",
            return_value="48261",
        ), patch("accounts.services.otp.send_otp") as delivery:
            response = self.client.post(
                reverse("accounts:request-otp"),
                {"phone": DEMO_PHONE},
                format="json",
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        delivery.assert_called_once_with(DEMO_PHONE, "48261")
        self.assertFalse(OTPRequest.objects.get().is_demo)

    def test_disabled_demo_mode_preserves_provider_failure_behavior(self):
        with patch(
            "accounts.services.otp.generate_otp",
            return_value="48261",
        ), patch(
            "accounts.services.otp.send_otp",
            side_effect=RuntimeError("provider unavailable"),
        ):
            with self.assertRaisesMessage(RuntimeError, "provider unavailable"):
                self.client.post(
                    reverse("accounts:request-otp"),
                    {"phone": DEMO_PHONE},
                    format="json",
                )

        self.assertFalse(OTPRequest.objects.exists())
