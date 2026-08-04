from django.contrib import admin

from orders.models import Order, OrderItem, UserAddress


@admin.register(UserAddress)
class UserAddressAdmin(admin.ModelAdmin):
    list_display = ("recipient_name", "recipient_phone", "title", "city", "is_default", "updated_at")
    list_filter = ("city", "is_default")
    search_fields = ("recipient_name", "recipient_phone", "user__phone", "address_line", "postal_code")
    readonly_fields = ("created_at", "updated_at")
    autocomplete_fields = ("user",)


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    can_delete = False
    readonly_fields = (
        "product", "product_name", "product_type", "sale_unit", "sale_unit_display",
        "unit_size", "quantity", "unit_price", "line_total", "cover_image",
    )

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("public_number", "recipient_name", "recipient_phone", "status", "payment_status", "total", "created_at")
    list_filter = ("status", "payment_status", "payment_method", "created_at")
    search_fields = ("public_number", "recipient_name", "recipient_phone", "user__phone")
    autocomplete_fields = ("user",)
    readonly_fields = (
        "public_number", "user", "payment_method", "subtotal", "delivery_fee", "total",
        "address_title", "recipient_name", "recipient_phone", "province", "city", "district",
        "address_line", "plaque", "unit", "postal_code", "delivery_note", "customer_note",
        "idempotency_key", "created_at", "updated_at",
    )
    inlines = (OrderItemInline,)

    def has_add_permission(self, request):
        return False


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("product_name", "order", "quantity", "unit_price", "line_total")
    search_fields = ("product_name", "order__public_number")
    readonly_fields = tuple(field.name for field in OrderItem._meta.fields)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
