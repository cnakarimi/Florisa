from django.db.models import (
    Avg,
    BigIntegerField,
    Case,
    Count,
    Exists,
    F,
    IntegerField,
    OuterRef,
    Q,
    Prefetch,
    QuerySet,
    Subquery,
    Sum,
    Value,
    When,
)
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import serializers
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny

from products.models import (
    ArrangementDetails,
    Category,
    CutFlowerDetails,
    CutFlowerVariant,
    HomeSlide,
    PlantDetails,
    PlantPotAssignment,
    Product,
    ProductReview,
)
from products.pagination import ProductPagination
from products.serializers import (
    CategorySerializer,
    HomeSlideSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ProductReviewSerializer,
)


PRODUCT_ORDERING_FIELDS = {
    "newest": ("-created_at",),
    "price": ("catalog_price",),
    "-price": ("-catalog_price",),
    "name": ("name",),
    "-name": ("-name",),
    "featured": ("featured_order", "id"),
}
PRODUCT_ORDERING_CHOICES = tuple(PRODUCT_ORDERING_FIELDS)


def public_product_queryset() -> QuerySet[Product]:
    active_variants = CutFlowerVariant.objects.filter(product_id=OuterRef("pk"), is_active=True)
    purchasable_variants = active_variants.filter(
        stock_quantity__gte=OuterRef("minimum_order_quantity"),
    )
    minimum_price = active_variants.order_by("price", "pk").values("price")[:1]
    total_stock = (
        active_variants.values("product_id")
        .annotate(total=Sum("stock_quantity"))
        .values("total")[:1]
    )
    return Product.objects.filter(
        is_active=True,
        category__is_active=True,
    ).select_related("category", "plant_details", "arrangement_details", "cut_flower_details").prefetch_related(
        "arrangement_details__composition", "cut_flower_variants",
        Prefetch("pot_assignments", queryset=PlantPotAssignment.objects.select_related("pot")),
    ).annotate(
        active_variant_min_price=Subquery(minimum_price, output_field=BigIntegerField()),
        active_variant_stock=Coalesce(
            Subquery(total_stock, output_field=IntegerField()),
            0,
        ),
        has_purchasable_variant=Exists(purchasable_variants),
    ).annotate(
        catalog_price=Case(
            When(
                product_type=Product.ProductType.CUT_FLOWER,
                then=Coalesce("active_variant_min_price", Value(0)),
            ),
            default=F("price"),
            output_field=BigIntegerField(),
        ),
    )


class ProductFilterSerializer(serializers.Serializer):
    search = serializers.CharField(required=False, allow_blank=False, max_length=200)
    product_type = serializers.ChoiceField(required=False, choices=Product.ProductType.choices)
    category = serializers.SlugField(required=False)
    min_price = serializers.IntegerField(required=False, min_value=0)
    max_price = serializers.IntegerField(required=False, min_value=0)
    in_stock = serializers.BooleanField(required=False)
    sale_unit = serializers.ChoiceField(required=False, choices=Product.SaleUnit.choices)
    is_featured = serializers.BooleanField(required=False)
    # Kept as a backwards-compatible alias for existing catalog clients.
    featured = serializers.BooleanField(required=False)
    ordering = serializers.ChoiceField(
        required=False,
        choices=PRODUCT_ORDERING_CHOICES,
    )

    plant_size = serializers.ChoiceField(required=False, choices=PlantDetails.PlantSize.choices)
    min_height = serializers.IntegerField(required=False, min_value=0)
    max_height = serializers.IntegerField(required=False, min_value=0)
    quality_grade = serializers.ChoiceField(required=False, choices=PlantDetails.QualityGrade.choices)
    pet_friendly = serializers.BooleanField(required=False)
    pot_included = serializers.BooleanField(required=False)
    pot_material = serializers.CharField(required=False, allow_blank=False, max_length=50)
    pot_color = serializers.CharField(required=False, allow_blank=False, max_length=50)
    has_drainage = serializers.BooleanField(required=False)
    light_requirement = serializers.ChoiceField(required=False, choices=PlantDetails.LightRequirement.choices)
    watering_requirement = serializers.ChoiceField(required=False, choices=PlantDetails.WateringRequirement.choices)
    care_difficulty = serializers.ChoiceField(required=False, choices=PlantDetails.CareDifficulty.choices)

    flower_type = serializers.CharField(required=False, allow_blank=False, max_length=120)
    variety = serializers.CharField(required=False, allow_blank=False, max_length=120)
    color = serializers.CharField(required=False, allow_blank=False, max_length=80)
    min_stem_length = serializers.IntegerField(required=False, min_value=0)
    max_stem_length = serializers.IntegerField(required=False, min_value=0)
    flower_grade = serializers.ChoiceField(required=False, choices=CutFlowerDetails.FlowerGrade.choices)
    min_vase_life = serializers.IntegerField(required=False, min_value=0)
    fragrance_level = serializers.ChoiceField(required=False, choices=CutFlowerDetails.FragranceLevel.choices)
    seasonal_availability = serializers.ChoiceField(required=False, choices=CutFlowerDetails.SeasonalAvailability.choices)
    bloom_opening_stage = serializers.ChoiceField(required=False, choices=CutFlowerDetails.BloomOpeningStage.choices)
    arrangement_type = serializers.ChoiceField(required=False, choices=ArrangementDetails.ArrangementType.choices)
    dominant_color_theme = serializers.CharField(required=False, allow_blank=False, max_length=120)
    design_style = serializers.CharField(required=False, allow_blank=False, max_length=120)

    def validate(self, attrs):
        for minimum, maximum in (
            ("min_price", "max_price"),
            ("min_height", "max_height"),
            ("min_stem_length", "max_stem_length"),
        ):
            if minimum in attrs and maximum in attrs and attrs[minimum] > attrs[maximum]:
                raise serializers.ValidationError(
                    {maximum: "مقدار بیشینه نمی‌تواند از مقدار کمینه کمتر باشد."}
                )
        return attrs


class CategoryListView(ListAPIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = CategorySerializer
    pagination_class = None
    queryset = Category.objects.filter(is_active=True)


class HomeSlideListView(ListAPIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = HomeSlideSerializer
    pagination_class = None
    queryset = HomeSlide.objects.filter(is_active=True).order_by("sort_order", "id")


class ProductListView(ListAPIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = ProductListSerializer
    pagination_class = ProductPagination

    @extend_schema(parameters=[ProductFilterSerializer])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self) -> QuerySet[Product]:
        # A plain dict prevents DRF's HTML-form BooleanField behavior from
        # treating omitted query parameters as explicit false values.
        filters = ProductFilterSerializer(data=self.request.query_params.dict())
        filters.is_valid(raise_exception=True)
        values = filters.validated_data

        queryset = public_product_queryset()

        direct_filters = {
            "product_type": "product_type",
            "category": "category__slug",
            "min_price": "catalog_price__gte",
            "max_price": "catalog_price__lte",
            "sale_unit": "sale_unit",
            "is_featured": "is_featured",
            "featured": "is_featured",
            "plant_size": "plant_details__plant_size",
            "min_height": "plant_details__approximate_height_cm__gte",
            "max_height": "plant_details__approximate_height_cm__lte",
            "quality_grade": "plant_details__quality_grade",
            "pet_friendly": "plant_details__pet_friendly",
            "pot_included": "plant_details__pot_included",
            "has_drainage": "plant_details__has_drainage",
            "light_requirement": "plant_details__light_requirement",
            "watering_requirement": "plant_details__watering_requirement",
            "care_difficulty": "plant_details__care_difficulty",
            "min_stem_length": "cut_flower_details__stem_length_cm__gte",
            "max_stem_length": "cut_flower_details__stem_length_cm__lte",
            "flower_grade": "cut_flower_details__flower_grade",
            "min_vase_life": "cut_flower_details__vase_life_days__gte",
            "fragrance_level": "cut_flower_details__fragrance_level",
            "seasonal_availability": "cut_flower_details__seasonal_availability",
            "bloom_opening_stage": "cut_flower_details__bloom_opening_stage",
            "arrangement_type": "arrangement_details__arrangement_type",
        }
        for parameter, lookup in direct_filters.items():
            if parameter in values:
                queryset = queryset.filter(**{lookup: values[parameter]})

        if values.get("in_stock") is True:
            queryset = queryset.filter(
                Q(product_type=Product.ProductType.CUT_FLOWER, has_purchasable_variant=True)
                | ~Q(product_type=Product.ProductType.CUT_FLOWER)
                & Q(stock_quantity__gte=F("minimum_order_quantity"))
            )
        elif values.get("in_stock") is False:
            queryset = queryset.filter(
                Q(product_type=Product.ProductType.CUT_FLOWER, has_purchasable_variant=False)
                | ~Q(product_type=Product.ProductType.CUT_FLOWER)
                & Q(stock_quantity__lt=F("minimum_order_quantity"))
            )

        for parameter, lookup in (
            ("pot_material", "plant_details__pot_material__iexact"),
            ("pot_color", "plant_details__pot_color__iexact"),
            ("flower_type", "cut_flower_details__flower_type__iexact"),
            ("variety", "cut_flower_details__variety__iexact"),
            ("dominant_color_theme", "arrangement_details__dominant_color_theme__iexact"),
            ("design_style", "arrangement_details__design_style__iexact"),
        ):
            if parameter in values:
                queryset = queryset.filter(**{lookup: values[parameter]})

        if "color" in values:
            queryset = queryset.filter(
                cut_flower_variants__color__iexact=values["color"],
                cut_flower_variants__is_active=True,
            ).distinct()

        search = values.get("search")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(short_description__icontains=search)
                | Q(plant_details__plant_type__icontains=search)
                | Q(plant_details__color__icontains=search)
                | Q(cut_flower_details__flower_type__icontains=search)
                | Q(cut_flower_details__variety__icontains=search)
                | Q(cut_flower_variants__color__icontains=search, cut_flower_variants__is_active=True)
                | Q(arrangement_details__dominant_color_theme__icontains=search)
                | Q(arrangement_details__design_style__icontains=search)
                | Q(arrangement_details__composition__label__icontains=search)
            ).distinct()

        ordering = values.get("ordering", "newest")
        return queryset.order_by(*PRODUCT_ORDERING_FIELDS[ordering])


class ProductDetailView(RetrieveAPIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = ProductDetailSerializer
    lookup_field = "slug"
    queryset = (
        public_product_queryset()
        .prefetch_related("images", "arrangement_details__composition", "cut_flower_variants")
        .annotate(
            rating_average=Avg(
                "reviews__rating",
                filter=Q(reviews__is_approved=True),
            ),
            review_count=Count(
                "reviews",
                filter=Q(reviews__is_approved=True),
            ),
        )
    )


class ProductRelatedListView(ListAPIView):
    """Up to eight public products in the same category, newest first."""

    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = ProductListSerializer
    pagination_class = None
    queryset = public_product_queryset()
    result_limit = 8
    ordering = (*PRODUCT_ORDERING_FIELDS["newest"], "-id")

    def get_queryset(self) -> QuerySet[Product]:
        queryset = super().get_queryset()
        product = get_object_or_404(queryset.prefetch_related(None), slug=self.kwargs["slug"])
        related = queryset.filter(category_id=product.category_id).exclude(pk=product.pk)
        # Keep ordering separate from eligibility for future ranking changes.
        return related.order_by(*self.ordering)[:self.result_limit]


class ProductReviewListView(ListAPIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = ProductReviewSerializer
    pagination_class = ProductPagination

    def get_queryset(self) -> QuerySet[ProductReview]:
        product = get_object_or_404(
            Product.objects.filter(is_active=True, category__is_active=True).only("pk"),
            slug=self.kwargs["slug"],
        )
        return ProductReview.objects.filter(product=product, is_approved=True)
