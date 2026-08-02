from django.db.models import Q, QuerySet
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import serializers
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny

from products.models import Category, CutFlowerDetails, PlantDetails, Product
from products.pagination import ProductPagination
from products.serializers import CategorySerializer, ProductDetailSerializer, ProductListSerializer


class ProductFilterSerializer(serializers.Serializer):
    search = serializers.CharField(required=False, allow_blank=False, max_length=200)
    product_type = serializers.ChoiceField(required=False, choices=Product.ProductType.choices)
    category = serializers.SlugField(required=False)
    min_price = serializers.IntegerField(required=False, min_value=0)
    max_price = serializers.IntegerField(required=False, min_value=0)
    in_stock = serializers.BooleanField(required=False)
    sale_unit = serializers.ChoiceField(required=False, choices=Product.SaleUnit.choices)
    featured = serializers.BooleanField(required=False)
    ordering = serializers.ChoiceField(
        required=False,
        choices=("price", "-price", "newest", "name", "-name"),
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


FILTER_PARAMETERS = [
    OpenApiParameter(name=field_name, type=str, required=False)
    for field_name in ProductFilterSerializer().fields
]


class ProductListView(ListAPIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = ProductListSerializer
    pagination_class = ProductPagination

    @extend_schema(parameters=FILTER_PARAMETERS)
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self) -> QuerySet[Product]:
        # A plain dict prevents DRF's HTML-form BooleanField behavior from
        # treating omitted query parameters as explicit false values.
        filters = ProductFilterSerializer(data=self.request.query_params.dict())
        filters.is_valid(raise_exception=True)
        values = filters.validated_data

        queryset = Product.objects.filter(
            is_active=True,
            category__is_active=True,
        ).select_related("category", "plant_details", "cut_flower_details")

        direct_filters = {
            "product_type": "product_type",
            "category": "category__slug",
            "min_price": "price__gte",
            "max_price": "price__lte",
            "sale_unit": "sale_unit",
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
        }
        for parameter, lookup in direct_filters.items():
            if parameter in values:
                queryset = queryset.filter(**{lookup: values[parameter]})

        if values.get("in_stock") is True:
            queryset = queryset.filter(stock_quantity__gt=0)
        elif values.get("in_stock") is False:
            queryset = queryset.filter(stock_quantity=0)

        for parameter, lookup in (
            ("pot_material", "plant_details__pot_material__iexact"),
            ("pot_color", "plant_details__pot_color__iexact"),
            ("flower_type", "cut_flower_details__flower_type__iexact"),
            ("variety", "cut_flower_details__variety__iexact"),
            ("color", "cut_flower_details__color__iexact"),
        ):
            if parameter in values:
                queryset = queryset.filter(**{lookup: values[parameter]})

        search = values.get("search")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(short_description__icontains=search)
                | Q(plant_details__plant_type__icontains=search)
                | Q(plant_details__color__icontains=search)
                | Q(cut_flower_details__flower_type__icontains=search)
                | Q(cut_flower_details__variety__icontains=search)
                | Q(cut_flower_details__color__icontains=search)
            )

        ordering_fields = {
            "price": "price",
            "-price": "-price",
            "newest": "-created_at",
            "name": "name",
            "-name": "-name",
        }
        return queryset.order_by(ordering_fields.get(values.get("ordering"), "-created_at"))


class ProductDetailView(RetrieveAPIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = ProductDetailSerializer
    lookup_field = "slug"
    queryset = (
        Product.objects.filter(is_active=True, category__is_active=True)
        .select_related("category", "plant_details", "cut_flower_details")
        .prefetch_related("images")
    )
