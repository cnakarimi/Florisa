from typing import Any

from django.views.debug import SafeExceptionReporterFilter


class FlorisaExceptionReporterFilter(SafeExceptionReporterFilter):
    sensitive_setting_names = frozenset({"DEMO_OTP_CODE"})

    def is_active(self, request: Any) -> bool:
        # Keep explicitly marked secrets out of DEBUG technical reports too.
        return True

    def cleanse_setting(self, key: str, value: Any) -> Any:
        if key in self.sensitive_setting_names:
            return self.cleansed_substitute
        return super().cleanse_setting(key, value)
