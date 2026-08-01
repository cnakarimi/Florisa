from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from accounts.models import OTPRequest, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ("phone",)
    list_display = (
        "phone",
        "full_name",
        "email",
        "is_active",
        "is_staff",
        "date_joined",
    )
    list_filter = ("is_active", "is_staff", "is_superuser")
    search_fields = ("phone", "full_name", "email")
    readonly_fields = ("date_joined", "last_login")
    fieldsets = (
        (None, {"fields": ("phone", "password")}),
        ("اطلاعات شخصی", {"fields": ("full_name", "email")}),
        (
            "دسترسی‌ها",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        ("تاریخ‌ها", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "phone",
                    "full_name",
                    "email",
                    "password1",
                    "password2",
                    "is_active",
                    "is_staff",
                ),
            },
        ),
    )


@admin.register(OTPRequest)
class OTPRequestAdmin(admin.ModelAdmin):
    list_display = (
        "phone",
        "status_label",
        "is_demo",
        "attempts",
        "expires_at",
        "created_at",
    )
    list_filter = ("is_demo", "is_used", "created_at", "expires_at")
    search_fields = ("phone",)
    readonly_fields = (
        "phone",
        "hash_stored",
        "expires_at",
        "attempts",
        "is_used",
        "is_demo",
        "created_at",
    )
    fields = readonly_fields

    @admin.display(description="وضعیت")
    def status_label(self, obj: OTPRequest) -> str:
        if obj.is_used:
            return "استفاده‌شده"
        if obj.is_expired:
            return "منقضی"
        return "فعال"

    @admin.display(description="وضعیت هش")
    def hash_stored(self, obj: OTPRequest) -> str:
        return "هش امن ذخیره شده است" if obj.code_hash else "هش موجود نیست"

    def has_add_permission(self, request) -> bool:
        return False

    def has_change_permission(self, request, obj=None) -> bool:
        return False
