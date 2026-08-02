from drf_spectacular.utils import PolymorphicProxySerializer, extend_schema_field
from rest_framework import serializers

from products.models import Category, CutFlowerDetails, PlantDetails, Product, ProductImage


class CategorySummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug")
        read_only_fields = fields


class CategorySerializer(serializers.ModelSerializer):
    image = serializers.CharField(allow_blank=True, allow_null=True, read_only=True)

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "image", "sort_order")
        read_only_fields = fields


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.CharField(read_only=True)

    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt_text", "sort_order")
        read_only_fields = fields


class PlantDetailsSerializer(serializers.ModelSerializer):
    plant_size_display = serializers.CharField(source="get_plant_size_display", read_only=True)
    quality_grade_display = serializers.CharField(source="get_quality_grade_display", read_only=True)
    light_requirement_display = serializers.CharField(source="get_light_requirement_display", read_only=True)
    watering_requirement_display = serializers.CharField(source="get_watering_requirement_display", read_only=True)
    care_difficulty_display = serializers.CharField(source="get_care_difficulty_display", read_only=True)

    class Meta:
        model = PlantDetails
        exclude = ("id", "product")
        read_only_fields = tuple(field.name for field in PlantDetails._meta.fields) + (
            "plant_size_display",
            "quality_grade_display",
            "light_requirement_display",
            "watering_requirement_display",
            "care_difficulty_display",
        )


class CutFlowerDetailsSerializer(serializers.ModelSerializer):
    flower_grade_display = serializers.CharField(source="get_flower_grade_display", read_only=True)
    fragrance_level_display = serializers.CharField(source="get_fragrance_level_display", read_only=True)
    seasonal_availability_display = serializers.CharField(
        source="get_seasonal_availability_display", read_only=True
    )

    class Meta:
        model = CutFlowerDetails
        exclude = ("id", "product")
        read_only_fields = tuple(field.name for field in CutFlowerDetails._meta.fields) + (
            "flower_grade_display",
            "fragrance_level_display",
            "seasonal_availability_display",
        )


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySummarySerializer(read_only=True)
    cover_image = serializers.CharField(allow_blank=True, allow_null=True, read_only=True)
    product_type_display = serializers.CharField(source="get_product_type_display", read_only=True)
    sale_unit_display = serializers.CharField(source="get_sale_unit_display", read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    details = serializers.SerializerMethodField()

    # Backward-compatible commercial aliases. New clients should use the canonical names.
    price_per_bundle = serializers.IntegerField(source="price", read_only=True)
    stock_bundles = serializers.IntegerField(source="stock_quantity", read_only=True)
    stems_per_bundle = serializers.IntegerField(source="unit_size", read_only=True)
    minimum_order_bundles = serializers.IntegerField(
        source="minimum_order_quantity", read_only=True
    )

    @extend_schema_field(
        PolymorphicProxySerializer(
            component_name="ProductDetails",
            serializers=[PlantDetailsSerializer, CutFlowerDetailsSerializer],
            resource_type_field_name=None,
            allow_null=True,
        )
    )
    def get_details(self, product: Product):
        plant_details = getattr(product, "plant_details", None)
        cut_flower_details = getattr(product, "cut_flower_details", None)
        if (
            product.product_type == Product.ProductType.PLANT
            and plant_details is not None
            and cut_flower_details is None
        ):
            return PlantDetailsSerializer(plant_details).data
        if (
            product.product_type == Product.ProductType.CUT_FLOWER
            and cut_flower_details is not None
            and plant_details is None
        ):
            return CutFlowerDetailsSerializer(cut_flower_details).data
        return None

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "product_type",
            "product_type_display",
            "short_description",
            "price",
            "stock_quantity",
            "sale_unit",
            "sale_unit_display",
            "unit_size",
            "minimum_order_quantity",
            "cover_image",
            "is_featured",
            "is_in_stock",
            "category",
            "details",
            "price_per_bundle",
            "stock_bundles",
            "stems_per_bundle",
            "minimum_order_bundles",
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
