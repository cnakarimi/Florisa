from rest_framework import serializers

from products.models import Category, Product, ProductImage


class CategorySummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug")
        read_only_fields = fields


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "image",
            "sort_order",
        )
        read_only_fields = fields


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.CharField(read_only=True)

    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt_text", "sort_order")
        read_only_fields = fields


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySummarySerializer(read_only=True)
    cover_image = serializers.CharField(
        allow_blank=True,
        allow_null=True,
        read_only=True,
    )
    is_in_stock = serializers.BooleanField(read_only=True)
    quality_grade_display = serializers.CharField(
        source="get_quality_grade_display",
        read_only=True,
    )
    care_difficulty_display = serializers.CharField(
        source="get_care_difficulty_display",
        read_only=True,
    )

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "flower_type",
            "color",
            "short_description",
            "plant_size",
            "plant_height_cm",
            "quality_grade",
            "quality_grade_display",
            "is_pet_friendly",
            "pot_included",
            "pot_material",
            "pot_color",
            "pot_size_cm",
            "pot_has_drainage",
            "light_requirement",
            "watering_requirement",
            "care_difficulty",
            "care_difficulty_display",
            "ideal_temperature",
            "care_tips",
            "delivery_notes",
            "stems_per_bundle",
            "price_per_bundle",
            "stock_bundles",
            "minimum_order_bundles",
            "cover_image",
            "is_featured",
            "is_in_stock",
            "category",
        )
        read_only_fields = fields


class ProductDetailSerializer(ProductListSerializer):
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + (
            "description",
            "images",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields
