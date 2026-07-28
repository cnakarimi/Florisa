from unittest.mock import patch

from django.core.exceptions import ImproperlyConfigured
from django.test import SimpleTestCase, override_settings

from accounts.services.providers import send_otp


class OTPDeliveryTests(SimpleTestCase):
    phone = "09123456789"
    code = "48261"

    @override_settings(
        DEBUG=True,
        OTP_DELIVERY_BACKEND="console",
        OTP_EXPIRATION_SECONDS=120,
    )
    def test_console_backend_logs_readable_otp_once(self):
        expected_message = (
            f"{'=' * 50}\n"
            "FLORISA DEVELOPMENT OTP\n"
            f"Phone: {self.phone}\n"
            f"Code: {self.code}\n"
            "Expires in: 120 seconds\n"
            f"{'=' * 50}"
        )

        with self.assertLogs("florisa.otp", level="INFO") as captured:
            send_otp(self.phone, self.code)

        self.assertEqual(len(captured.records), 1)
        self.assertEqual(captured.records[0].getMessage(), expected_message)

    @override_settings(DEBUG=True, OTP_DELIVERY_BACKEND="unsupported")
    def test_unsupported_backend_fails_clearly_without_logging_otp(self):
        with patch("accounts.services.providers.logger.info") as log:
            with self.assertRaisesMessage(
                ImproperlyConfigured,
                "Unsupported OTP delivery backend",
            ):
                send_otp(self.phone, self.code)

        log.assert_not_called()

    @override_settings(DEBUG=False, OTP_DELIVERY_BACKEND="console")
    def test_console_backend_is_blocked_in_production(self):
        with patch("accounts.services.providers.logger.info") as log:
            with self.assertRaisesMessage(
                ImproperlyConfigured,
                "only permitted when DEBUG is True",
            ):
                send_otp(self.phone, self.code)

        log.assert_not_called()
