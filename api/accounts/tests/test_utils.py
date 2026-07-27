from django.core.exceptions import ValidationError
from django.test import SimpleTestCase

from accounts.utils import (
    normalize_digits,
    normalize_phone,
    validate_iranian_phone,
)


class NormalizationTests(SimpleTestCase):
    def test_normalizes_persian_and_arabic_digits(self):
        self.assertEqual(normalize_digits("۰۹۱۲٣٤٥٦٧٨٩"), "09123456789")

    def test_normalizes_supported_iranian_prefixes(self):
        self.assertEqual(normalize_phone("+98 912-345-6789"), "09123456789")
        self.assertEqual(normalize_phone("00989123456789"), "09123456789")
        self.assertEqual(normalize_phone("989123456789"), "09123456789")

    def test_rejects_invalid_iranian_mobile(self):
        with self.assertRaises(ValidationError):
            validate_iranian_phone("02112345678")
