from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models


class Category(models.Model):
    name = models.CharField("نام", max_length=120)
    slug = models.SlugField("نامک", max_length=140, unique=True)
    description = models.TextField("توضیحات", blank=True)
    image = models.ImageField(
        "تصویر",
        upload_to="categories/",
        blank=True,
        null=True,
    )
    is_active = models.BooleanField("فعال", default=True)
    sort_order = models.PositiveIntegerField("ترتیب نمایش", default=0)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("زمان به‌روزرسانی", auto_now=True)

    class Meta:
        ordering = ("sort_order", "name")
        verbose_name = "دسته‌بندی"
        verbose_name_plural = "دسته‌بندی‌ها"

    def __str__(self) -> str:
        return self.name


class Product(models.Model):
    class QualityGrade(models.TextChoices):
        STANDARD = "standard", "استاندارد"
        PREMIUM = "premium", "ممتاز"
        LUXURY = "luxury", "لوکس"

    class CareDifficulty(models.TextChoices):
        EASY = "easy", "آسان"
        MEDIUM = "medium", "متوسط"
        HARD = "hard", "حساس"

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
        verbose_name="دسته‌بندی",
    )
    name = models.CharField("نام", max_length=180)
    slug = models.SlugField("نامک", max_length=200, unique=True)
    flower_type = models.CharField("نوع گل", max_length=120)
    color = models.CharField("رنگ", max_length=80, blank=True)
    short_description = models.CharField(
        "توضیح کوتاه",
        max_length=300,
        blank=True,
    )
    description = models.TextField("توضیحات", blank=True)
    plant_size = models.CharField(
        "اندازه گیاه",
        max_length=50,
        blank=True,
    )
    plant_height_cm = models.PositiveSmallIntegerField(
        "ارتفاع تقریبی گیاه (سانتی‌متر)",
        blank=True,
        null=True,
        validators=[MinValueValidator(1)],
    )
    quality_grade = models.CharField(
        "درجه کیفیت",
        max_length=20,
        choices=QualityGrade.choices,
        blank=True,
    )
    is_pet_friendly = models.BooleanField(
        "سازگار با حیوانات خانگی",
        blank=True,
        null=True,
    )
    pot_included = models.BooleanField("گلدان همراه", default=True)
    pot_material = models.CharField(
        "جنس گلدان",
        max_length=50,
        blank=True,
    )
    pot_color = models.CharField(
        "رنگ گلدان",
        max_length=50,
        blank=True,
    )
    pot_size_cm = models.PositiveSmallIntegerField(
        "اندازه گلدان (سانتی‌متر)",
        blank=True,
        null=True,
        validators=[MinValueValidator(1)],
    )
    pot_has_drainage = models.BooleanField(
        "دارای زهکشی",
        blank=True,
        null=True,
    )
    light_requirement = models.CharField(
        "نیاز نوری",
        max_length=100,
        blank=True,
    )
    watering_requirement = models.CharField(
        "نیاز آبیاری",
        max_length=100,
        blank=True,
    )
    care_difficulty = models.CharField(
        "سختی نگهداری",
        max_length=20,
        choices=CareDifficulty.choices,
        blank=True,
    )
    ideal_temperature = models.CharField(
        "دمای ایده‌آل",
        max_length=50,
        blank=True,
    )
    care_tips = models.TextField("نکات نگهداری", blank=True)
    delivery_notes = models.CharField(
        "نکات ارسال",
        max_length=250,
        blank=True,
    )
    stems_per_bundle = models.PositiveIntegerField(
        "تعداد شاخه در دسته",
        default=20,
        validators=[MinValueValidator(1)],
    )
    price_per_bundle = models.PositiveBigIntegerField(
        "قیمت هر دسته (تومان)",
        validators=[MinValueValidator(1)],
    )
    stock_bundles = models.PositiveIntegerField(
        "موجودی دسته",
        default=0,
        validators=[MinValueValidator(0)],
    )
    minimum_order_bundles = models.PositiveIntegerField(
        "حداقل سفارش دسته",
        default=1,
        validators=[MinValueValidator(1)],
    )
    cover_image = models.CharField(
        "تصویر اصلی",
        max_length=255,
        blank=True,
        null=True,
    )
    is_active = models.BooleanField("فعال", default=True)
    is_featured = models.BooleanField("ویژه", default=False)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("زمان به‌روزرسانی", auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        verbose_name = "محصول"
        verbose_name_plural = "محصولات"

    @property
    def is_in_stock(self) -> bool:
        return self.stock_bundles > 0

    def clean(self) -> None:
        super().clean()
        if (
            self.stock_bundles is not None
            and self.minimum_order_bundles is not None
            and self.stock_bundles > 0
            and self.minimum_order_bundles > self.stock_bundles
        ):
            raise ValidationError(
                {
                    "minimum_order_bundles": (
                        "حداقل سفارش نمی‌تواند از موجودی بیشتر باشد."
                    ),
                },
            )

    def __str__(self) -> str:
        color = f" {self.color}" if self.color else ""
        return (
            f"{self.flower_type}{color} - "
            f"{self.stems_per_bundle} شاخه در هر دسته"
        )


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
        verbose_name="محصول",
    )
    image = models.CharField(
        "تصویر",
        max_length=255,
    )
    alt_text = models.CharField(
        "متن جایگزین",
        max_length=180,
        blank=True,
    )
    sort_order = models.PositiveIntegerField("ترتیب نمایش", default=0)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)

    class Meta:
        ordering = ("sort_order", "id")
        verbose_name = "تصویر محصول"
        verbose_name_plural = "تصاویر محصول"

    def __str__(self) -> str:
        return f"تصویر {self.product}"
