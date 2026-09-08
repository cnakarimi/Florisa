from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from magazine.models import Article, MagazineCategory
from products.models import Product


class MagazineCategorySummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = MagazineCategory
        fields = ("id", "name", "slug")
        read_only_fields = fields


class MagazineCategorySerializer(MagazineCategorySummarySerializer):
    class Meta(MagazineCategorySummarySerializer.Meta):
        fields = MagazineCategorySummarySerializer.Meta.fields + (
            "description", "sort_order",
        )
        read_only_fields = fields


class ArticleListSerializer(serializers.ModelSerializer):
    category = MagazineCategorySummarySerializer(read_only=True)
    cover_image = serializers.ImageField(read_only=True, use_url=True)

    class Meta:
        model = Article
        fields = (
            "id", "title", "slug", "excerpt", "cover_image", "category",
            "published_at", "reading_time", "is_featured",
        )
        read_only_fields = fields


class MagazineProductSerializer(serializers.ModelSerializer):
    # Preserve the catalog's filename/path contract for existing product assets.
    cover_image = serializers.CharField(allow_blank=True, allow_null=True, read_only=True)
    sale_unit_display = serializers.CharField(source="get_sale_unit_display", read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id", "name", "slug", "product_type", "price", "cover_image",
            "sale_unit", "sale_unit_display", "unit_size",
            "minimum_order_quantity", "is_in_stock",
        )
        read_only_fields = fields


class ArticleDetailSerializer(ArticleListSerializer):
    related_products = serializers.SerializerMethodField()
    related_articles = serializers.SerializerMethodField()

    @extend_schema_field(MagazineProductSerializer(many=True))
    def get_related_products(self, article: Article):
        # The public detail queryset supplies filtered, ordered through rows.
        return MagazineProductSerializer(
            [link.product for link in article.public_product_links],
            many=True,
            context=self.context,
        ).data

    @extend_schema_field(ArticleListSerializer(many=True))
    def get_related_articles(self, article: Article):
        return ArticleListSerializer(
            [link.related_article for link in article.public_article_links],
            many=True,
            context=self.context,
        ).data

    class Meta(ArticleListSerializer.Meta):
        fields = ArticleListSerializer.Meta.fields + (
            "content", "related_products", "related_articles",
        )
        read_only_fields = fields
