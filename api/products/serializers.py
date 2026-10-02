from drf_spectacular.utils import PolymorphicProxySerializer, extend_schema_field
from rest_framework import serializers

from products.models import (
    ArrangementComposition,
    ArrangementDetails,
    Category,
    CutFlowerDetails,
    CutFlowerVariant,
    HomeSlide,
    PlantDetails,
    Product,
    ProductImage,
    ProductReview,
)


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


class HomeSlideSerializer(serializers.ModelSerializer):
    mobile_image_url = serializers.SerializerMethodField()
    desktop_image_url = serializers.SerializerMethodField()

    @extend_schema_field(serializers.URLField())
    def get_mobile_image_url(self, slide: HomeSlide) -> str:
        return self._absolute_image_url(slide.mobile_image.url)

    @extend_schema_field(serializers.URLField())
    def get_desktop_image_url(self, slide: HomeSlide) -> str:
        return self._absolute_image_url(slide.desktop_image.url)

    def _absolute_image_url(self, url: str) -> str:
        request = self.context.get("request")
        return request.build_absolute_uri(url) if request else url

    class Meta:
        model = HomeSlide
        fields = (
            "id",
            "title",
            "mobile_image_url",
            "desktop_image_url",
            "image_alt",
            "cta_label",
            "cta_url",
            "button_background_color",
            "button_text_color",
            "title_text_color",
        )
        read_only_fields = fields


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    @extend_schema_field(serializers.CharField())
    def get_image(self, image: ProductImage):
        if image.image_upload:
            url = image.image_upload.url
            request = self.context.get("request")
            return request.build_absolute_uri(url) if request else url
        return image.image

    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt_text", "sort_order")
        read_only_fields = fields


class ProductReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductReview
        fields = (
            "id",
            "reviewer_name",
            "rating",
            "comment",
            "created_at",
            "updated_at",
        )
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


class CutFlowerVariantSerializer(serializers.ModelSerializer):
    is_in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = CutFlowerVariant
        fields = ("id", "color", "price", "stock_quantity", "is_active", "is_in_stock")
        read_only_fields = fields


class CutFlowerDetailsSerializer(serializers.ModelSerializer):
    flower_grade_display = serializers.CharField(source="get_flower_grade_display", read_only=True)
    fragrance_level_display = serializers.CharField(source="get_fragrance_level_display", read_only=True)
    seasonal_availability_display = serializers.CharField(
        source="get_seasonal_availability_display", read_only=True
    )
    bloom_opening_stage_display = serializers.CharField(
        source="get_bloom_opening_stage_display", read_only=True
    )
    variants = serializers.SerializerMethodField()

    class Meta:
        model = CutFlowerDetails
        exclude = ("id", "product")
        read_only_fields = tuple(field.name for field in CutFlowerDetails._meta.fields) + (
            "flower_grade_display",
            "fragrance_level_display",
            "seasonal_availability_display",
            "bloom_opening_stage_display",
            "variants",
        )

    @extend_schema_field(CutFlowerVariantSerializer(many=True))
    def get_variants(self, details: CutFlowerDetails):
        variants = [
            variant
            for variant in details.product.cut_flower_variants.all()
            if variant.is_active
        ]
        return CutFlowerVariantSerializer(variants, many=True).data


class ArrangementCompositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArrangementComposition
        fields = ("id", "label", "stem_count", "sort_order")
        read_only_fields = fields


class ArrangementDetailsSerializer(serializers.ModelSerializer):
    arrangement_type_display = serializers.CharField(
        source="get_arrangement_type_display", read_only=True
    )
    composition = ArrangementCompositionSerializer(many=True, read_only=True)

    class Meta:
        model = ArrangementDetails
        exclude = ("id", "product")
        read_only_fields = tuple(field.name for field in ArrangementDetails._meta.fields) + (
            "arrangement_type_display",
            "composition",
        )


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySummarySerializer(read_only=True)
    cover_image = serializers.SerializerMethodField()

    @extend_schema_field(serializers.CharField(allow_blank=True, allow_null=True))
    def get_cover_image(self, product: Product):
        if product.cover_upload:
            url = product.cover_upload.url
            request = self.context.get("request")
            return request.build_absolute_uri(url) if request else url
        return product.cover_image
    product_type_display = serializers.CharField(source="get_product_type_display", read_only=True)
    sale_unit_display = serializers.CharField(source="get_sale_unit_display", read_only=True)
    price = serializers.SerializerMethodField()
    stock_quantity = serializers.SerializerMethodField()
    is_in_stock = serializers.SerializerMethodField()
    has_purchasable_variant = serializers.SerializerMethodField()
    details = serializers.SerializerMethodField()

    # Backward-compatible commercial aliases. New clients should use the canonical names.
    price_per_bundle = serializers.SerializerMethodField()
    stock_bundles = serializers.SerializerMethodField()
    stems_per_bundle = serializers.IntegerField(source="unit_size", read_only=True)
    minimum_order_bundles = serializers.IntegerField(
        source="minimum_order_quantity", read_only=True
    )

    @extend_schema_field(
        PolymorphicProxySerializer(
            component_name="ProductDetails",
            serializers=[PlantDetailsSerializer, ArrangementDetailsSerializer, CutFlowerDetailsSerializer],
            resource_type_field_name=None,
            allow_null=True,
        )
    )
    def get_details(self, product: Product):
        plant_details = getattr(product, "plant_details", None)
        arrangement_details = getattr(product, "arrangement_details", None)
        cut_flower_details = getattr(product, "cut_flower_details", None)
        if (
            product.product_type == Product.ProductType.PLANT
            and plant_details is not None
            and arrangement_details is None
            and cut_flower_details is None
        ):
            return PlantDetailsSerializer(plant_details).data
        if (
            product.product_type == Product.ProductType.ARRANGEMENT
            and arrangement_details is not None
            and plant_details is None
            and cut_flower_details is None
        ):
            return ArrangementDetailsSerializer(arrangement_details).data
        if (
            product.product_type == Product.ProductType.CUT_FLOWER
            and cut_flower_details is not None
            and plant_details is None
            and arrangement_details is None
        ):
            return CutFlowerDetailsSerializer(cut_flower_details).data
        return None

    def get_price(self, product: Product) -> int:
        if product.product_type == Product.ProductType.CUT_FLOWER:
            value = getattr(product, "active_variant_min_price", None)
            return value if value is not None else 0
        return product.price

    def get_stock_quantity(self, product: Product) -> int:
        if product.product_type == Product.ProductType.CUT_FLOWER:
            return getattr(product, "active_variant_stock", None) or 0
        return product.stock_quantity

    def get_has_purchasable_variant(self, product: Product) -> bool:
        if product.product_type != Product.ProductType.CUT_FLOWER:
            return product.stock_quantity >= product.minimum_order_quantity
        value = getattr(product, "has_purchasable_variant", None)
        if value is not None:
            return bool(value)
        return product.cut_flower_variants.filter(
            is_active=True, stock_quantity__gte=product.minimum_order_quantity
        ).exists()

    def get_is_in_stock(self, product: Product) -> bool:
        return self.get_has_purchasable_variant(product)

    def get_price_per_bundle(self, product: Product) -> int:
        return self.get_price(product)

    def get_stock_bundles(self, product: Product) -> int:
        return self.get_stock_quantity(product)

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
            "has_purchasable_variant",
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
    rating_average = serializers.FloatField(read_only=True, allow_null=True)
    review_count = serializers.IntegerField(read_only=True)

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + (
            "description",
            "images",
            "rating_average",
            "review_count",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields
