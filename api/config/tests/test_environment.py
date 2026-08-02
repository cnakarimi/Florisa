from django.core.exceptions import ImproperlyConfigured
from django.test import SimpleTestCase

from config.environment import load_demo_otp_config


class DemoOTPEnvironmentTests(SimpleTestCase):
    valid_environment = {
        "DEMO_OTP_ENABLED": "true",
        "DEMO_OTP_ONLY": "true",
        "DEMO_OTP_PHONE": "+989012345678",
        "DEMO_OTP_CODE": "۷۳۱۹۴",
    }

    def test_demo_mode_defaults_to_disabled(self):
        config = load_demo_otp_config({})

        self.assertFalse(config.enabled)
        self.assertFalse(config.only)
        self.assertEqual(config.phone, "")
        self.assertEqual(config.code, "")

    def test_demo_phone_and_code_use_authentication_normalization(self):
        config = load_demo_otp_config(self.valid_environment)

        self.assertTrue(config.enabled)
        self.assertTrue(config.only)
        self.assertEqual(config.phone, "09012345678")
        self.assertEqual(config.code, "73194")
        self.assertNotIn(config.code, repr(config))

    def test_render_style_values_allow_case_and_whitespace(self):
        environment = {
            **self.valid_environment,
            "DEMO_OTP_ENABLED": " True ",
            "DEMO_OTP_ONLY": " True ",
            "DEMO_OTP_PHONE": " 09012345678 ",
        }

        config = load_demo_otp_config(environment)

        self.assertTrue(config.enabled)
        self.assertTrue(config.only)
        self.assertEqual(config.phone, "09012345678")

    def test_enabled_demo_mode_rejects_missing_values(self):
        invalid_environments = (
            {"DEMO_OTP_ENABLED": "true", "DEMO_OTP_CODE": "73194"},
            {
                "DEMO_OTP_ENABLED": "true",
                "DEMO_OTP_PHONE": "09012345678",
            },
        )

        for environment in invalid_environments:
            with self.subTest(environment=set(environment)):
                with self.assertRaises(ImproperlyConfigured):
                    load_demo_otp_config(environment)

    def test_enabled_demo_mode_rejects_invalid_phone_or_code(self):
        invalid_environments = (
            {
                **self.valid_environment,
                "DEMO_OTP_PHONE": "02112345678",
            },
            {**self.valid_environment, "DEMO_OTP_CODE": "1234"},
            {**self.valid_environment, "DEMO_OTP_CODE": "123456"},
            {**self.valid_environment, "DEMO_OTP_CODE": "12A45"},
        )

        for environment in invalid_environments:
            with self.subTest(environment=environment):
                with self.assertRaises(ImproperlyConfigured) as captured:
                    load_demo_otp_config(environment)
                self.assertNotIn(
                    environment.get("DEMO_OTP_CODE", ""),
                    str(captured.exception),
                )

    def test_invalid_boolean_is_rejected(self):
        with self.assertRaises(ImproperlyConfigured):
            load_demo_otp_config({"DEMO_OTP_ENABLED": "sometimes"})

    def test_demo_only_requires_enabled_demo_mode(self):
        with self.assertRaisesMessage(
            ImproperlyConfigured,
            "DEMO_OTP_ONLY requires DEMO_OTP_ENABLED=true",
        ):
            load_demo_otp_config({"DEMO_OTP_ONLY": "true"})
