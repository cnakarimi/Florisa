from django.contrib import admin
from django.core.exceptions import ValidationError
from django.forms.models import BaseInlineFormSet
from django.utils.html import format_html

from products.models import (
    Category,
    CutFlower,
    CutFlowerDetails,
    HomeSlide,
    Plant,
    PlantDetails,
    Product,
    ProductImage,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "sort_order")
    list_filter = ("is_active",)
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("sort_order", "name")
    fields = ("name", "slug", "description", "image", "is_active", "sort_order")


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0
    fields = ("image", "alt_text", "sort_order")
    ordering = ("sort_order", "id")


class RequiredDetailsInlineFormSet(BaseInlineFormSet):
    def clean(self) -> None:
        super().clean()
        if any(self.errors):
            return
        active_forms = [
            form
            for form in self.forms
            if form.cleaned_data and not form.cleaned_data.get("DELETE", False)
        ]
        if len(active_forms) != 1:
            raise ValidationError("ثبت دقیقاً یک ردیف مشخصات محصول الزامی است.")


class PlantDetailsInline(admin.StackedInline):
    model = PlantDetails
    formset = RequiredDetailsInlineFormSet
    extra = 1
    min_num = 1
    max_num = 1
    validate_min = True
    validate_max = True
    fieldsets = (
        (
            "مشخصات گیاه",
            {
                "fields": (
                    "plant_type",
                    "color",
                    "plant_size",
                    "approximate_height_cm",
                    "quality_grade",
                    "pet_friendly",
                )
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
                    "has_drainage",
                )
            },
        ),
        (
            "نگهداری و ارسال",
            {
                "fields": (
                    "light_requirement",
                    "watering_requirement",
                    "care_difficulty",
                    "ideal_temperature_min",
                    "ideal_temperature_max",
                    "care_notes",
                    "shipping_notes",
                )
            },
        ),
    )


class CutFlowerDetailsInline(admin.StackedInline):
    model = CutFlowerDetails
    formset = RequiredDetailsInlineFormSet
    extra = 1
    min_num = 1
    max_num = 1
    validate_min = True
    validate_max = True
    fields = (
        "flower_type",
        "variety",
        "color",
        "stem_length_cm",
        "flower_grade",
        "vase_life_days",
        "origin",
        "fragrance_level",
        "seasonal_availability",
        "care_notes",
        "shipping_notes",
    )


class TypedProductAdmin(admin.ModelAdmin):
    product_type: str
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "slug", "category__name")
    autocomplete_fields = ("category",)
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
                    "short_description",
                    "description",
                    "cover_image",
                )
            },
        ),
        (
            "فروش و موجودی",
            {
                "fields": (
                    "price",
                    "stock_quantity",
                    "sale_unit",
                    "unit_size",
                    "minimum_order_quantity",
                    "is_active",
                    "is_featured",
                )
            },
        ),
        ("زمان‌ها", {"fields": ("created_at", "updated_at")}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).filter(product_type=self.product_type)

    def get_changeform_initial_data(self, request):
        initial = super().get_changeform_initial_data(request)
        initial["product_type"] = self.product_type
        return initial

    def save_model(self, request, obj, form, change):
        obj.product_type = self.product_type
        super().save_model(request, obj, form, change)


@admin.register(Plant)
class PlantAdmin(TypedProductAdmin):
    product_type = Product.ProductType.PLANT
    list_display = (
        "name",
        "category",
        "price",
        "stock_quantity",
        "sale_unit",
        "is_active",
        "is_featured",
        "created_at",
    )
    list_filter = ("category", "sale_unit", "is_active", "is_featured")
    inlines = (PlantDetailsInline, ProductImageInline)

    def get_changeform_initial_data(self, request):
        initial = super().get_changeform_initial_data(request)
        initial.setdefault("sale_unit", Product.SaleUnit.POT)
        initial.setdefault("unit_size", 1)
        return initial


@admin.register(CutFlower)
class CutFlowerAdmin(TypedProductAdmin):
    product_type = Product.ProductType.CUT_FLOWER
    list_display = (
        "name",
        "category",
        "price",
        "stock_quantity",
        "sale_unit",
        "unit_size",
        "is_active",
        "is_featured",
        "created_at",
    )
    list_filter = ("category", "sale_unit", "is_active", "is_featured")
    inlines = (CutFlowerDetailsInline, ProductImageInline)

    def get_changeform_initial_data(self, request):
        initial = super().get_changeform_initial_data(request)
        initial.setdefault("sale_unit", Product.SaleUnit.BUNCH)
        initial.setdefault("unit_size", 20)
        return initial


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Read-only overview; typed sections are the supported creation workflow."""

    list_display = (
        "name",
        "product_type",
        "category",
        "price",
        "stock_quantity",
        "sale_unit",
        "is_active",
        "created_at",
    )
    list_filter = ("product_type", "category", "sale_unit", "is_active")
    search_fields = ("name", "slug")
    ordering = ("-created_at",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "alt_text", "sort_order", "created_at")
    list_filter = ("created_at",)
    search_fields = ("product__name", "alt_text")
    autocomplete_fields = ("product",)
    ordering = ("product", "sort_order", "id")


@admin.register(HomeSlide)
class HomeSlideAdmin(admin.ModelAdmin):
    list_display = (
        "admin_title",
        "title",
        "mobile_thumbnail",
        "desktop_thumbnail",
        "sort_order",
        "is_active",
        "updated_at",
    )
    list_editable = ("sort_order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("admin_title", "title", "eyebrow")
    ordering = ("sort_order", "id")
    readonly_fields = (
        "mobile_preview",
        "desktop_preview",
        "created_at",
        "updated_at",
    )
    fieldsets = (
        (
            "شناسایی و وضعیت",
            {"fields": ("admin_title", "is_active", "sort_order")},
        ),
        (
            "محتوای نمایشی",
            {"fields": ("eyebrow", "title", "description", "image_alt")},
        ),
        (
            "تصاویر واکنش‌گرا",
            {
                "fields": (
                    "mobile_image",
                    "mobile_preview",
                    "desktop_image",
                    "desktop_preview",
                )
            },
        ),
        ("دکمه اقدام", {"fields": ("cta_label", "cta_url")}),
        ("زمان‌ها", {"fields": ("created_at", "updated_at")}),
    )

    @staticmethod
    def _thumbnail(image, *, width: int, height: int):
        if not image:
            return "—"
        try:
            url = image.url
        except ValueError:
            return "—"
        return format_html(
            '<img src="{}" alt="" style="width:{}px;height:{}px;object-fit:cover;'
            'border-radius:6px;background:#eee" />',
            url,
            width,
            height,
        )

    @admin.display(description="بندانگشتی موبایل")
    def mobile_thumbnail(self, slide: HomeSlide | None):
        return self._thumbnail(
            slide.mobile_image if slide else None,
            width=48,
            height=64,
        )

    @admin.display(description="بندانگشتی دسکتاپ")
    def desktop_thumbnail(self, slide: HomeSlide | None):
        return self._thumbnail(
            slide.desktop_image if slide else None,
            width=96,
            height=40,
        )

    @admin.display(description="پیش‌نمایش موبایل")
    def mobile_preview(self, slide: HomeSlide | None):
        return self._thumbnail(
            slide.mobile_image if slide else None,
            width=180,
            height=240,
        )

    @admin.display(description="پیش‌نمایش دسکتاپ")
    def desktop_preview(self, slide: HomeSlide | None):
        return self._thumbnail(
            slide.desktop_image if slide else None,
            width=360,
            height=144,
        )
