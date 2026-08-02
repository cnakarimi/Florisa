from django.contrib import admin

from products.models import Category, Product, ProductImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "sort_order")
    list_filter = ("is_active",)
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("sort_order", "name")
    fields = (
        "name",
        "slug",
        "description",
        "image",
        "is_active",
        "sort_order",
    )


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
        "quality_grade",
        "care_difficulty",
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
        "quality_grade",
        "care_difficulty",
        "pot_included",
        "is_active",
        "is_featured",
    )
    search_fields = ("name", "slug", "flower_type", "color")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at")
    inlines = (ProductImageInline,)
    fieldsets = (
        (
            "اطلاعات اصلی",
            {
                "fields": (
                    "category",
                    "name",
                    "slug",
                    "flower_type",
                    "color",
                    "short_description",
                    "description",
                    "cover_image",
                ),
            },
        ),
        (
            "مشخصات گیاه",
            {
                "fields": (
                    "plant_size",
                    "plant_height_cm",
                    "quality_grade",
                    "is_pet_friendly",
                ),
            },
        ),
        (
            "گلدان همراه",
            {
                "fields": (
                    "pot_included",
                    "pot_material",
                    "pot_color",
                    "pot_size_cm",
                    "pot_has_drainage",
                ),
            },
        ),
        (
            "راهنمای نگهداری و ارسال",
            {
                "fields": (
                    "light_requirement",
                    "watering_requirement",
                    "care_difficulty",
                    "ideal_temperature",
                    "care_tips",
                    "delivery_notes",
                ),
            },
        ),
        (
            "فروش و موجودی",
            {
                "fields": (
                    "stems_per_bundle",
                    "price_per_bundle",
                    "stock_bundles",
                    "minimum_order_bundles",
                    "is_active",
                    "is_featured",
                ),
            },
        ),
        ("زمان‌ها", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "alt_text", "sort_order", "created_at")
    list_filter = ("created_at",)
    search_fields = ("product__name", "alt_text")
    ordering = ("product", "sort_order", "id")
