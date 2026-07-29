from django.contrib import admin

from products.models import Category, Product, ProductImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "sort_order")
    list_filter = ("is_active",)
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("sort_order", "name")


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0
    fields = ("image", "alt_text", "sort_order")
    ordering = ("sort_order", "id")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "flower_type",
        "color",
        "category",
        "price_per_bundle",
        "stock_bundles",
        "stems_per_bundle",
        "minimum_order_bundles",
        "is_active",
        "is_featured",
        "created_at",
    )
    list_filter = (
        "category",
        "flower_type",
        "color",
        "is_active",
        "is_featured",
    )
    search_fields = ("name", "slug", "flower_type", "color")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at")
    inlines = (ProductImageInline,)


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "alt_text", "sort_order", "created_at")
    list_filter = ("created_at",)
    search_fields = ("product__name", "alt_text")
    ordering = ("product", "sort_order", "id")
