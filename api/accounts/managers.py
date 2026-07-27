from typing import Any

from django.contrib.auth.base_user import BaseUserManager

from accounts.utils import normalize_phone, validate_iranian_phone


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(
        self,
        phone: str,
        password: str | None = None,
        **extra_fields: Any,
    ):
        if not phone:
            raise ValueError("شماره موبایل الزامی است.")

        normalized_phone = normalize_phone(phone)
        validate_iranian_phone(normalized_phone)
        user = self.model(phone=normalized_phone, **extra_fields)

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        user.save(using=self._db)
        return user

    def create_superuser(
        self,
        phone: str,
        password: str,
        **extra_fields: Any,
    ):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("کاربر مدیر باید is_staff=True داشته باشد.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("کاربر مدیر باید is_superuser=True داشته باشد.")

        return self.create_user(phone, password, **extra_fields)
