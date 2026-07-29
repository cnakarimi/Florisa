from django.db.models import Q, QuerySet
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny

from products.models import Category, Product
from products.pagination import ProductPagination
from products.serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)


class CategoryListView(ListAPIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = CategorySerializer
    pagination_class = None
    queryset = Category.objects.filter(is_active=True)


class ProductListView(ListAPIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = ProductListSerializer
    pagination_class = ProductPagination

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="category",
                description="Filter by category slug.",
                type=str,
            ),
            OpenApiParameter(
                name="search",
                description="Search name, flower type, or color.",
                type=str,
            ),
            OpenApiParameter(
                name="featured",
                description="Filter featured products with true or false.",
                type=bool,
            ),
            OpenApiParameter(
                name="ordering",
                description="Sort by price, -price, or newest.",
                type=str,
                enum=["price", "-price", "newest"],
            ),
        ],
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self) -> QuerySet[Product]:
        queryset = Product.objects.filter(
            is_active=True,
            category__is_active=True,
        ).select_related("category")
        params = self.request.query_params

        category = params.get("category")
        if category:
            queryset = queryset.filter(category__slug=category)

        search = params.get("search")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(flower_type__icontains=search)
                | Q(color__icontains=search),
            )

        featured = params.get("featured", "").lower()
        if featured in {"true", "false"}:
            queryset = queryset.filter(is_featured=featured == "true")

        ordering = params.get("ordering")
        ordering_fields = {
            "price": "price_per_bundle",
            "-price": "-price_per_bundle",
            "newest": "-created_at",
        }
        if ordering in ordering_fields:
            queryset = queryset.order_by(ordering_fields[ordering])

        return queryset


class ProductDetailView(RetrieveAPIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = ProductDetailSerializer
    lookup_field = "slug"
    queryset = (
        Product.objects.filter(
            is_active=True,
            category__is_active=True,
        )
        .select_related("category")
        .prefetch_related("images")
    )
