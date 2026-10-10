from django import forms
from django.contrib import admin
from django.core.exceptions import ValidationError
from django.forms.models import BaseInlineFormSet
from django.utils.html import format_html

from products.models import (
    Arrangement,
    ArrangementComposition,
    ArrangementDetails,
    Category,
    CutFlower,
    CutFlowerDetails,
    CutFlowerVariant,
    HomeSlide,
    Plant,
    PlantDetails,
    Pot,
    PlantPotAssignment,
    Product,
    ProductImage,
    ProductReview,
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
    fields = ("image", "image_upload", "alt_text", "sort_order")
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
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "initial_pot_assignment":
            object_id = request.resolver_match.kwargs.get("object_id") if request.resolver_match else None
            kwargs["queryset"] = PlantPotAssignment.objects.filter(product_id=object_id) if object_id else PlantPotAssignment.objects.none()
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
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
            "گلدان همراه (اطلاعات قدیمی؛ قیمت پایه شامل گلدان پلاستیکی است)",
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
            "انتخاب اولیه گلدان",
            {"fields": ("initial_pot_assignment",)},
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
        "bloom_opening_stage",
        "care_notes",
        "shipping_notes",
    )


class ArrangementDetailsInline(admin.StackedInline):
    model = ArrangementDetails
    formset = RequiredDetailsInlineFormSet
    extra = 1
    min_num = 1
    max_num = 1
    validate_min = True
    validate_max = True
    fields = (
        "arrangement_type",
        "approximate_dimensions",
        "dominant_color_theme",
        "design_style",
        "care_notes",
        "shipping_notes",
    )


class ArrangementCompositionInline(admin.TabularInline):
    model = ArrangementComposition
    extra = 1
    fields = ("label", "stem_count", "sort_order")
    ordering = ("sort_order", "id")


class CutFlowerVariantInline(admin.TabularInline):
    model = CutFlowerVariant
    extra = 1
    fields = ("color", "price", "stock_quantity", "is_active")


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
                    "cover_upload",
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
                    "featured_order",
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


@admin.register(Pot)
class PotAdmin(admin.ModelAdmin):
    list_display = ("name", "material", "color", "is_active", "stock_quantity")
    list_filter = ("is_active", "material", "color")
    search_fields = ("name", "material", "color")


class PlantPotAssignmentInline(admin.TabularInline):
    model = PlantPotAssignment
    extra = 0
    autocomplete_fields = ("pot",)
    fields = ("pot", "additional_price", "is_active", "display_order", "combination_image")


@admin.register(PlantPotAssignment)
class PlantPotAssignmentAdmin(admin.ModelAdmin):
    list_display = ("product", "pot", "additional_price", "is_active", "display_order")
    search_fields = ("product__name", "pot__name")
    autocomplete_fields = ("product", "pot")


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
        "featured_order",
        "created_at",
    )
    list_editable = ("is_featured", "featured_order")
    list_filter = ("category", "sale_unit", "is_active", "is_featured")
    inlines = (PlantDetailsInline, PlantPotAssignmentInline, ProductImageInline)

    def get_changeform_initial_data(self, request):
        initial = super().get_changeform_initial_data(request)
        initial.setdefault("sale_unit", Product.SaleUnit.POT)
        initial.setdefault("unit_size", 1)
        return initial


@admin.register(CutFlower)
class CutFlowerAdmin(TypedProductAdmin):
    product_type = Product.ProductType.CUT_FLOWER
    readonly_fields = TypedProductAdmin.readonly_fields + ("price", "stock_quantity")
    list_display = (
        "name",
        "category",
        "price",
        "stock_quantity",
        "sale_unit",
        "unit_size",
        "is_active",
        "is_featured",
        "featured_order",
        "created_at",
    )
    list_editable = ("is_featured", "featured_order")
    list_filter = ("category", "sale_unit", "is_active", "is_featured")
    inlines = (CutFlowerDetailsInline, CutFlowerVariantInline, ProductImageInline)

    def get_changeform_initial_data(self, request):
        initial = super().get_changeform_initial_data(request)
        initial.setdefault("sale_unit", Product.SaleUnit.BUNCH)
        initial.setdefault("unit_size", 20)
        return initial

    def save_model(self, request, obj, form, change):
        if not change:
            obj.price = 0
            obj.stock_quantity = 0
        super().save_model(request, obj, form, change)


@admin.register(Arrangement)
class ArrangementAdmin(TypedProductAdmin):
    product_type = Product.ProductType.ARRANGEMENT
    list_display = (
        "name", "category", "price", "stock_quantity", "is_active", "is_featured", "created_at"
    )
    list_filter = ("category", "is_active", "is_featured")
    inlines = (ArrangementDetailsInline, ProductImageInline)

    def get_changeform_initial_data(self, request):
        initial = super().get_changeform_initial_data(request)
        initial["sale_unit"] = Product.SaleUnit.ITEM
        initial["unit_size"] = 1
        return initial

    def save_model(self, request, obj, form, change):
        obj.sale_unit = Product.SaleUnit.ITEM
        obj.unit_size = 1
        super().save_model(request, obj, form, change)


@admin.register(ArrangementDetails)
class ArrangementDetailsAdmin(admin.ModelAdmin):
    list_display = ("product", "arrangement_type", "dominant_color_theme", "design_style")
    search_fields = ("product__name", "dominant_color_theme", "design_style")
    autocomplete_fields = ("product",)
    inlines = (ArrangementCompositionInline,)


@admin.register(CutFlowerVariant)
class CutFlowerVariantAdmin(admin.ModelAdmin):
    list_display = ("product", "color", "price", "stock_quantity", "is_active")
    list_filter = ("is_active",)
    search_fields = ("product__name", "color")
    autocomplete_fields = ("product",)


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
        "is_featured",
        "featured_order",
        "created_at",
    )
    list_filter = (
        "product_type",
        "category",
        "sale_unit",
        "is_active",
        "is_featured",
    )
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


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = (
        "product",
        "reviewer_name",
        "rating",
        "is_approved",
        "created_at",
    )
    list_editable = ("is_approved",)
    list_filter = ("rating", "is_approved")
    search_fields = ("product__name", "product__slug", "reviewer_name", "comment")
    autocomplete_fields = ("product", "user")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at", "-id")
    list_select_related = ("product",)


class HomeSlideAdminForm(forms.ModelForm):
    class Meta:
        model = HomeSlide
        fields = "__all__"
        widgets = {
            "button_background_color": forms.TextInput(attrs={"type": "color"}),
            "button_text_color": forms.TextInput(attrs={"type": "color"}),
            "title_text_color": forms.TextInput(attrs={"type": "color"}),
        }


@admin.register(HomeSlide)
class HomeSlideAdmin(admin.ModelAdmin):
    form = HomeSlideAdminForm
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
    search_fields = ("admin_title", "title")
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
            {"fields": ("title", "image_alt")},
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
        (
            "دکمه اقدام",
            {
                "fields": (
                    "cta_label",
                    "cta_url",
                    "button_background_color",
                    "button_text_color",
                    "title_text_color",
                )
            },
        ),
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
