from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone

from accounts.managers import UserManager
from accounts.utils import normalize_phone, validate_iranian_phone


class User(AbstractBaseUser, PermissionsMixin):
    phone = models.CharField(
        "شماره موبایل",
        max_length=11,
        unique=True,
        validators=[validate_iranian_phone],
    )
    full_name = models.CharField("نام و نام خانوادگی", max_length=150)
    email = models.EmailField(
        "ایمیل",
        blank=True,
        null=True,
        unique=False,
    )
    is_active = models.BooleanField("فعال", default=True)
    is_staff = models.BooleanField("عضو تیم", default=False)
    date_joined = models.DateTimeField("تاریخ عضویت", default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS: list[str] = []

    class Meta:
        verbose_name = "کاربر"
        verbose_name_plural = "کاربران"

    @property
    def is_profile_complete(self) -> bool:
        return bool(self.full_name.strip())

    def clean(self) -> None:
        super().clean()
        self.phone = normalize_phone(self.phone)
        validate_iranian_phone(self.phone)

    def save(self, *args, **kwargs) -> None:
        self.phone = normalize_phone(self.phone)
        validate_iranian_phone(self.phone)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.phone


class OTPRequest(models.Model):
    phone = models.CharField(
        "شماره موبایل",
        max_length=11,
        db_index=True,
        validators=[validate_iranian_phone],
    )
    code_hash = models.CharField("هش کد", max_length=255, editable=False)
    expires_at = models.DateTimeField("زمان انقضا")
    attempts = models.PositiveSmallIntegerField("تعداد تلاش", default=0)
    is_used = models.BooleanField("استفاده شده", default=False)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "درخواست کد یکبار مصرف"
        verbose_name_plural = "درخواست‌های کد یکبار مصرف"
        indexes = [
            models.Index(
                fields=["phone", "is_used", "-created_at"],
                name="otp_phone_active_idx",
            ),
        ]

    @property
    def is_expired(self) -> bool:
        return self.expires_at <= timezone.now()

    def save(self, *args, **kwargs) -> None:
        self.phone = normalize_phone(self.phone)
        validate_iranian_phone(self.phone)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.phone} - {self.created_at:%Y-%m-%d %H:%M}"
