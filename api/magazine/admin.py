from django.contrib import admin
from django.utils.html import format_html

from magazine.models import Article, ArticleProduct, ArticleRelation, MagazineCategory


@admin.register(MagazineCategory)
class MagazineCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "sort_order", "is_active")
    list_editable = ("sort_order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("sort_order", "id")
    readonly_fields = ("created_at", "updated_at")
    fields = (
        "name", "slug", "description", "sort_order", "is_active",
        "created_at", "updated_at",
    )


class ArticleProductInline(admin.TabularInline):
    model = ArticleProduct
    extra = 0
    fields = ("product", "sort_order")
    autocomplete_fields = ("product",)
    ordering = ("sort_order", "id")


class ArticleRelationInline(admin.TabularInline):
    model = ArticleRelation
    fk_name = "article"
    extra = 0
    fields = ("related_article", "sort_order")
    autocomplete_fields = ("related_article",)
    ordering = ("sort_order", "id")


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = (
        "title", "category", "is_published", "is_featured",
        "published_at", "updated_at",
    )
    list_filter = ("category", "is_published", "is_featured", "published_at")
    list_editable = ("is_featured",)
    search_fields = ("title", "slug", "excerpt")
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("category",)
    list_select_related = ("category",)
    ordering = ("-published_at", "-id")
    date_hierarchy = "published_at"
    readonly_fields = ("cover_preview", "created_at", "updated_at")
    inlines = (ArticleProductInline, ArticleRelationInline)
    fieldsets = (
        ("اطلاعات اصلی", {"fields": ("title", "slug", "category", "excerpt")}),
        ("محتوا", {"fields": ("cover_image", "cover_preview", "content")}),
        (
            "انتشار",
            {"fields": ("is_published", "published_at", "is_featured", "reading_time")},
        ),
        ("زمان‌ها", {"fields": ("created_at", "updated_at")}),
    )

    @admin.display(description="پیش‌نمایش تصویر")
    def cover_preview(self, article: Article | None):
        # Match the safe, escaped image-preview pattern used for home slides.
        if article is None or not article.cover_image:
            return "—"
        try:
            url = article.cover_image.url
        except ValueError:
            return "—"
        return format_html(
            '<img src="{}" alt="" style="max-width:360px;max-height:240px;'
            'object-fit:cover;border-radius:6px;background:#eee" />',
            url,
        )
