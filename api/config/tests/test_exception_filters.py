from unittest.mock import patch

from django.test import TestCase, override_settings
from django.views.debug import (
    ExceptionReporter,
    get_default_exception_reporter_filter,
)

from accounts.services.otp import create_otp
from config.exception_filters import FlorisaExceptionReporterFilter


DEMO_PHONE = "09012345678"
DEMO_CODE = "73194"


@override_settings(
    DEBUG=False,
    DEMO_OTP_ENABLED=True,
    DEMO_OTP_ONLY=False,
    DEMO_OTP_PHONE=DEMO_PHONE,
    DEMO_OTP_CODE=DEMO_CODE,
)
class ExceptionReporterFilterTests(TestCase):
    def test_configured_filter_redacts_demo_code_and_django_secrets(self):
        reporter_filter = get_default_exception_reporter_filter()
        safe_settings = reporter_filter.get_safe_settings()

        self.assertIsInstance(
            reporter_filter,
            FlorisaExceptionReporterFilter,
        )
        self.assertEqual(
            safe_settings["DEMO_OTP_CODE"],
            reporter_filter.cleansed_substitute,
        )
        self.assertEqual(
            safe_settings["SECRET_KEY"],
            reporter_filter.cleansed_substitute,
        )
        self.assertNotIn(DEMO_CODE, str(safe_settings))

    @override_settings(DEBUG=True)
    def test_traceback_report_redacts_selected_demo_code_local(self):
        try:
            with patch(
                "accounts.services.otp.make_password",
                side_effect=RuntimeError("forced hashing failure"),
            ):
                create_otp(DEMO_PHONE)
        except RuntimeError as error:
            reporter = ExceptionReporter(
                request=None,
                exc_type=type(error),
                exc_value=error,
                tb=error.__traceback__,
            )
            reports = (
                ("text", reporter.get_traceback_text()),
                ("html", reporter.get_traceback_html()),
            )
        else:
            self.fail("The forced OTP creation exception was not raised.")

        for report_type, report in reports:
            with self.subTest(report_type=report_type):
                self.assertNotIn(DEMO_CODE, report)
                self.assertIn("********************", report)
