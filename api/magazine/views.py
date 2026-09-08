from django.db.models import Prefetch, QuerySet
from drf_spectacular.utils import extend_schema
from rest_framework import serializers
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny

from magazine.models import Article, ArticleProduct, ArticleRelation, MagazineCategory
from magazine.pagination import ArticlePagination
from magazine.serializers import (
    ArticleDetailSerializer,
    ArticleListSerializer,
    MagazineCategorySerializer,
)


class ArticleFilterSerializer(serializers.Serializer):
    category = serializers.SlugField(required=False, max_length=140)
    featured = serializers.BooleanField(required=False)


class MagazineCategoryListView(ListAPIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = MagazineCategorySerializer
    pagination_class = None
    queryset = MagazineCategory.objects.filter(is_active=True)


class ArticleListView(ListAPIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = ArticleListSerializer
    pagination_class = ArticlePagination

    @extend_schema(parameters=[ArticleFilterSerializer])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self) -> QuerySet[Article]:
        # Match catalog filtering: omitted booleans must not become false.
        filters = ArticleFilterSerializer(data=self.request.query_params.dict())
        filters.is_valid(raise_exception=True)
        values = filters.validated_data

        queryset = Article.objects.public().select_related("category").defer("content")
        if "category" in values:
            queryset = queryset.filter(category__slug=values["category"])
        if "featured" in values:
            queryset = queryset.filter(is_featured=values["featured"])
        return queryset


class ArticleDetailView(RetrieveAPIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = ArticleDetailSerializer
    lookup_field = "slug"

    def get_queryset(self) -> QuerySet[Article]:
        products = ArticleProduct.objects.filter(
            product__is_active=True,
            product__category__is_active=True,
        ).select_related("product")
        articles = (
            ArticleRelation.objects.filter(related_article__in=Article.objects.public())
            .select_related("related_article__category")
            .defer("related_article__content")
        )
        return Article.objects.public().select_related("category").prefetch_related(
            Prefetch("product_links", queryset=products, to_attr="public_product_links"),
            Prefetch("article_links", queryset=articles, to_attr="public_article_links"),
        )
