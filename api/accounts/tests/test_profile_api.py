import json

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from accounts.models import User


class ProfileCompletionAPITests(APITestCase):
    phone = "09123456789"

    def setUp(self) -> None:
        self.user = User.objects.create_user(phone=self.phone)
        self.endpoint = reverse("accounts:complete-registration")

    def authenticate(self) -> None:
        self.client.force_login(self.user)

    def test_authenticated_user_can_complete_profile(self):
        self.authenticate()

        response = self.client.post(
            self.endpoint,
            {
                "full_name": "  Sina Rezaei  ",
                "email": "  sina@example.com  ",
                "phone": "09999999999",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.full_name, "Sina Rezaei")
        self.assertEqual(self.user.email, "sina@example.com")
        self.assertEqual(self.user.phone, self.phone)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(
            set(response.data["user"]),
            {
                "id",
                "phone",
                "full_name",
                "email",
                "is_profile_complete",
            },
        )
        self.assertTrue(response.data["user"]["is_profile_complete"])

    def test_unauthenticated_user_is_rejected(self):
        response = self.client.post(
            self.endpoint,
            {"full_name": "Sina Rezaei"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.user.refresh_from_db()
        self.assertEqual(self.user.full_name, "")

    def test_completion_enforces_csrf_for_session_authentication(self):
        strict_client = APIClient(enforce_csrf_checks=True)
        strict_client.force_login(self.user)
        csrf_response = strict_client.get(reverse("accounts:csrf"))
        csrf_token = csrf_response.cookies["csrftoken"].value

        rejected_response = strict_client.post(
            self.endpoint,
            {"full_name": "Sina Rezaei"},
            format="json",
        )
        accepted_response = strict_client.post(
            self.endpoint,
            {"full_name": "Sina Rezaei"},
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(
            rejected_response.status_code,
            status.HTTP_403_FORBIDDEN,
        )
        self.assertEqual(accepted_response.status_code, status.HTTP_200_OK)

    def test_empty_full_name_is_rejected(self):
        self.authenticate()

        response = self.client.post(
            self.endpoint,
            {"full_name": "   "},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("full_name", response.data)
        self.user.refresh_from_db()
        self.assertEqual(self.user.full_name, "")

    def test_invalid_email_is_rejected(self):
        self.authenticate()

        response = self.client.post(
            self.endpoint,
            {
                "full_name": "Sina Rezaei",
                "email": "not-an-email",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)
        self.user.refresh_from_db()
        self.assertEqual(self.user.full_name, "")
        self.assertIsNone(self.user.email)

    def test_email_may_be_omitted(self):
        self.authenticate()

        response = self.client.post(
            self.endpoint,
            {"full_name": "Sina Rezaei"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.full_name, "Sina Rezaei")
        self.assertIsNone(self.user.email)
        self.assertIsNone(response.data["user"]["email"])

    def test_existing_profile_can_be_updated_without_clearing_email(self):
        self.user.full_name = "Old Name"
        self.user.email = "preserved@example.com"
        self.user.save(update_fields=["full_name", "email"])
        self.authenticate()

        response = self.client.post(
            self.endpoint,
            {"full_name": "Updated Name"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.full_name, "Updated Name")
        self.assertEqual(self.user.email, "preserved@example.com")

    def test_repeated_updates_modify_only_the_same_user(self):
        self.authenticate()

        first_response = self.client.post(
            self.endpoint,
            {
                "full_name": "First Name",
                "email": "first@example.com",
            },
            format="json",
        )
        second_response = self.client.post(
            self.endpoint,
            {
                "full_name": "Second Name",
                "email": "second@example.com",
            },
            format="json",
        )

        self.assertEqual(first_response.status_code, status.HTTP_200_OK)
        self.assertEqual(second_response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.count(), 1)
        self.user.refresh_from_db()
        self.assertEqual(self.user.full_name, "Second Name")
        self.assertEqual(self.user.email, "second@example.com")
        self.assertEqual(self.user.phone, self.phone)

    def test_me_exposes_computed_profile_completion_state(self):
        self.authenticate()

        incomplete_response = self.client.get(reverse("accounts:me"))
        self.user.full_name = "Sina Rezaei"
        self.user.email = "sina@example.com"
        self.user.save(update_fields=["full_name", "email"])
        complete_response = self.client.get(reverse("accounts:me"))

        self.assertEqual(incomplete_response.status_code, status.HTTP_200_OK)
        self.assertFalse(
            incomplete_response.data["user"]["is_profile_complete"],
        )
        self.assertIsNone(incomplete_response.data["user"]["email"])
        self.assertEqual(complete_response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            complete_response.data["user"]["is_profile_complete"],
        )
        self.assertEqual(
            complete_response.data["user"]["email"],
            "sina@example.com",
        )

    def test_schema_uses_session_cookie_without_manual_csrf_field(self):
        response = self.client.get(
            reverse("schema"),
            HTTP_ACCEPT="application/vnd.oai.openapi+json",
        )
        schema = json.loads(response.content)
        operation = schema["paths"][self.endpoint]["post"]

        self.assertIn({"cookieAuth": []}, operation["security"])
        unsafe_paths = (
            reverse("accounts:request-otp"),
            reverse("accounts:verify-otp"),
            self.endpoint,
            reverse("accounts:logout"),
        )
        for path in unsafe_paths:
            with self.subTest(path=path):
                self.assertNotIn(
                    "X-CSRFToken",
                    {
                        parameter["name"]
                        for parameter in schema["paths"][path]["post"].get(
                            "parameters",
                            [],
                        )
                    },
                )

    def test_swagger_uses_current_csrf_cookie_for_unsafe_requests(self):
        response = self.client.get(reverse("swagger-ui"))
        content = response.content.decode()

        self.assertContains(response, 'request.credentials = "same-origin"')
        self.assertContains(response, "document.cookie")
        self.assertContains(response, 'cookie.startsWith("csrftoken=")')
        self.assertContains(
            response,
            "requestOrigin === window.location.origin",
        )
        self.assertContains(
            response,
            '["POST", "PUT", "PATCH", "DELETE"].includes(method)',
        )
        self.assertContains(response, 'request.headers["X-CSRFToken"]')
