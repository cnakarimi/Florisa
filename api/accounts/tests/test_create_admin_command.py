import os
from io import StringIO
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase


ADMIN_ENVIRONMENT = {
    "FLORISA_ADMIN_PHONE": "09123456789",
    "FLORISA_ADMIN_PASSWORD": "Strong-Test-Password!234",
    "FLORISA_ADMIN_FULL_NAME": "Florisa Admin",
    "FLORISA_ADMIN_EMAIL": "admin@florisa.test",
}


class CreateAdminCommandTests(TestCase):
    @patch.dict(os.environ, ADMIN_ENVIRONMENT, clear=True)
    def test_command_creates_superuser_without_logging_password(self):
        output = StringIO()

        call_command("create_admin", stdout=output)

        user = get_user_model().objects.get(phone="09123456789")
        self.assertEqual(user.full_name, "Florisa Admin")
        self.assertEqual(user.email, "admin@florisa.test")
        self.assertTrue(user.is_active)
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.check_password(ADMIN_ENVIRONMENT["FLORISA_ADMIN_PASSWORD"]))
        self.assertNotIn(ADMIN_ENVIRONMENT["FLORISA_ADMIN_PASSWORD"], output.getvalue())

    @patch.dict(os.environ, ADMIN_ENVIRONMENT, clear=True)
    def test_command_is_idempotent(self):
        output = StringIO()

        call_command("create_admin", stdout=output)
        call_command("create_admin", stdout=output)

        self.assertEqual(
            get_user_model().objects.filter(phone="09123456789").count(),
            1,
        )
        self.assertIn("already exists", output.getvalue())

    @patch.dict(
        os.environ,
        {
            "FLORISA_ADMIN_PHONE": "09123456789",
            "FLORISA_ADMIN_FULL_NAME": "Florisa Admin",
        },
        clear=True,
    )
    def test_command_reports_missing_required_environment_variables(self):
        with self.assertRaisesMessage(
            CommandError,
            "FLORISA_ADMIN_PASSWORD",
        ):
            call_command("create_admin")
