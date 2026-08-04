from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from accounts.utils import normalize_digits, normalize_phone, validate_iranian_phone
from orders.models import Order, OrderItem, UserAddress


class UserAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAddress
        fields = (
            "id", "title", "recipient_name", "recipient_phone", "province",
            "city", "district", "address_line", "plaque", "unit",
            "postal_code", "delivery_note", "is_default", "created_at", "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_recipient_phone(self, value: str) -> str:
        normalized = normalize_phone(value)
        validate_iranian_phone(normalized)
        return normalized

    def validate_postal_code(self, value: str) -> str:
        normalized = normalize_digits(value).replace(" ", "").replace("-", "")
        if normalized and (not normalized.isascii() or not normalized.isdigit() or len(normalized) != 10):
            raise serializers.ValidationError("کد پستی باید ۱۰ رقم باشد.")
        return normalized

    def validate_province(self, value: str) -> str:
        if value.strip() != "تهران":
            raise serializers.ValidationError("ارسال در نسخه فعلی فقط در استان تهران انجام می‌شود.")
        return "تهران"

    def validate_city(self, value: str) -> str:
        if value.strip() != "تهران":
            raise serializers.ValidationError("ارسال در نسخه فعلی فقط در شهر تهران انجام می‌شود.")
        return "تهران"

    def validate(self, attrs):
        attrs = super().validate(attrs)
        for field in ("recipient_name", "address_line"):
            if field in attrs and not attrs[field].strip():
                raise serializers.ValidationError({field: "این فیلد نمی‌تواند خالی باشد."})
        return attrs

    def _save_default_safely(self, instance=None, validated_data=None):
        validated_data = validated_data or {}
        user = self.context["request"].user
        with transaction.atomic():
            get_user_model().objects.select_for_update().get(pk=user.pk)
            list(UserAddress.objects.select_for_update().filter(user=user).values_list("pk", flat=True))
            make_default = validated_data.get("is_default", getattr(instance, "is_default", False))
            if instance is None and not UserAddress.objects.filter(user=user).exists():
                make_default = True
            if make_default:
                UserAddress.objects.filter(user=user, is_default=True).exclude(
                    pk=getattr(instance, "pk", None),
                ).update(is_default=False)
                validated_data["is_default"] = True
            if instance is None:
                return UserAddress.objects.create(user=user, **validated_data)
            for key, value in validated_data.items():
                setattr(instance, key, value)
            instance.save()
            if not UserAddress.objects.filter(user=user, is_default=True).exists():
                instance.is_default = True
                instance.save(update_fields=("is_default", "updated_at"))
            return instance

    def create(self, validated_data):
        return self._save_default_safely(validated_data=validated_data)

    def update(self, instance, validated_data):
        return self._save_default_safely(instance=instance, validated_data=validated_data)


class CheckoutItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1, max_value=2_147_483_647)
    quantity = serializers.IntegerField(min_value=1, max_value=1_000_000)


class CartPreviewRequestSerializer(serializers.Serializer):
    items = CheckoutItemInputSerializer(many=True, allow_empty=False, max_length=100)

    def validate_items(self, items):
        product_ids = [item["product_id"] for item in items]
        if len(product_ids) != len(set(product_ids)):
            raise serializers.ValidationError("هر محصول باید فقط یک‌بار در سبد ارسال شود.")
        return items


class OrderCreateRequestSerializer(CartPreviewRequestSerializer):
    address_id = serializers.IntegerField(min_value=1)
    idempotency_key = serializers.UUIDField()
    customer_note = serializers.CharField(required=False, allow_blank=True, max_length=500)


class CartPreviewItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    product_type = serializers.CharField()
    sale_unit = serializers.CharField()
    sale_unit_display = serializers.CharField()
    unit_size = serializers.IntegerField()
    quantity = serializers.IntegerField()
    unit_price = serializers.DecimalField(max_digits=16, decimal_places=0)
    line_total = serializers.DecimalField(max_digits=16, decimal_places=0)
    cover_image = serializers.CharField(allow_blank=True)
    stock_quantity = serializers.IntegerField()
    minimum_order_quantity = serializers.IntegerField()


class CartPreviewResponseSerializer(serializers.Serializer):
    items = CartPreviewItemSerializer(many=True)
    subtotal = serializers.DecimalField(max_digits=16, decimal_places=0)
    delivery_fee = serializers.DecimalField(max_digits=16, decimal_places=0)
    total = serializers.DecimalField(max_digits=16, decimal_places=0)
    payment_method = serializers.CharField()
    payment_method_display = serializers.CharField()


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = (
            "id", "product", "product_name", "product_type", "sale_unit",
            "sale_unit_display", "unit_size", "quantity", "unit_price",
            "line_total", "cover_image",
        )
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    payment_method_display = serializers.CharField(source="get_payment_method_display", read_only=True)
    payment_status_display = serializers.CharField(source="get_payment_status_display", read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            "public_number", "status", "status_display", "payment_method",
            "payment_method_display", "payment_status", "payment_status_display",
            "subtotal", "delivery_fee", "total", "address_title", "recipient_name",
            "recipient_phone", "province", "city", "district", "address_line",
            "plaque", "unit", "postal_code", "delivery_note", "customer_note",
            "created_at", "updated_at", "items",
        )
        read_only_fields = fields
