from urllib.parse import urlsplit

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Q

from products.validators import validate_repository_image_path


class Category(models.Model):
    name = models.CharField("نام", max_length=120)
    slug = models.SlugField("نامک", max_length=140, unique=True)
    description = models.TextField("توضیحات", blank=True)
    image = models.CharField(
        "تصویر",
        max_length=255,
        blank=True,
        null=True,
        validators=[validate_repository_image_path],
        help_text=(
            "نام فایل موجود در web/public/images/categories را وارد کنید؛ "
            "مانند florisa-indoor-plants-category.webp"
        ),
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
    class ProductType(models.TextChoices):
        PLANT = "plant", "گیاه"
        CUT_FLOWER = "cut_flower", "گل شاخه‌ای"

    class SaleUnit(models.TextChoices):
        ITEM = "item", "عدد"
        POT = "pot", "گلدان"
        STEM = "stem", "شاخه"
        BUNCH = "bunch", "دسته"
        BOUQUET = "bouquet", "دسته‌گل"

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
        verbose_name="دسته‌بندی",
    )
    name = models.CharField("نام", max_length=180)
    slug = models.SlugField("نامک", max_length=200, unique=True)
    product_type = models.CharField(
        "نوع محصول",
        max_length=20,
        choices=ProductType.choices,
        db_index=True,
    )
    short_description = models.CharField("توضیح کوتاه", max_length=300, blank=True)
    description = models.TextField("توضیحات", blank=True)
    price = models.PositiveBigIntegerField(
        "قیمت هر واحد فروش (تومان)",
        validators=[MinValueValidator(0)],
    )
    stock_quantity = models.PositiveIntegerField(
        "موجودی واحد فروش",
        default=0,
        validators=[MinValueValidator(0)],
    )
    sale_unit = models.CharField(
        "واحد فروش",
        max_length=20,
        choices=SaleUnit.choices,
        default=SaleUnit.ITEM,
    )
    unit_size = models.PositiveIntegerField(
        "تعداد در هر واحد فروش",
        default=1,
        validators=[MinValueValidator(1)],
    )
    minimum_order_quantity = models.PositiveIntegerField(
        "حداقل تعداد واحد سفارش",
        default=1,
        validators=[MinValueValidator(1)],
    )
    cover_image = models.CharField("تصویر اصلی", max_length=255, blank=True, null=True)
    is_active = models.BooleanField("فعال", default=True)
    is_featured = models.BooleanField("ویژه", default=False)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("زمان به‌روزرسانی", auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        verbose_name = "محصول"
        verbose_name_plural = "محصولات"
        constraints = (
            models.CheckConstraint(condition=Q(price__gte=0), name="product_price_nonnegative"),
            models.CheckConstraint(
                condition=Q(stock_quantity__gte=0),
                name="product_stock_nonnegative",
            ),
            models.CheckConstraint(condition=Q(unit_size__gte=1), name="product_unit_size_positive"),
            models.CheckConstraint(
                condition=Q(minimum_order_quantity__gte=1),
                name="product_minimum_order_positive",
            ),
        )

    @property
    def is_in_stock(self) -> bool:
        return self.stock_quantity > 0

    def clean(self) -> None:
        super().clean()
        errors: dict[str, str] = {}

        if (
            self.stock_quantity is not None
            and self.minimum_order_quantity is not None
            and self.stock_quantity > 0
            and self.minimum_order_quantity > self.stock_quantity
        ):
            errors["minimum_order_quantity"] = (
                "حداقل سفارش نمی‌تواند از موجودی بیشتر باشد."
            )

        if self.pk:
            original_type = (
                Product.objects.filter(pk=self.pk)
                .values_list("product_type", flat=True)
                .first()
            )
            if original_type and original_type != self.product_type:
                errors["product_type"] = (
                    "تغییر نوع محصول پس از ایجاد مجاز نیست؛ از فرایند تبدیل صریح استفاده کنید."
                )

            has_plant = PlantDetails.objects.filter(product_id=self.pk).exists()
            has_cut_flower = CutFlowerDetails.objects.filter(product_id=self.pk).exists()
            if self.product_type == self.ProductType.PLANT and (not has_plant or has_cut_flower):
                errors["product_type"] = "محصول گیاهی باید فقط مشخصات گیاه داشته باشد."
            if self.product_type == self.ProductType.CUT_FLOWER and (
                not has_cut_flower or has_plant
            ):
                errors["product_type"] = "گل شاخه‌ای باید فقط مشخصات گل شاخه‌ای داشته باشد."

        if errors:
            raise ValidationError(errors)

    def __str__(self) -> str:
        return self.name


class PlantDetails(models.Model):
    class PlantSize(models.TextChoices):
        SMALL = "small", "کوچک"
        MEDIUM = "medium", "متوسط"
        LARGE = "large", "بزرگ"

    class QualityGrade(models.TextChoices):
        STANDARD = "standard", "استاندارد"
        PREMIUM = "premium", "ممتاز"
        LUXURY = "luxury", "لوکس"

    class LightRequirement(models.TextChoices):
        LOW = "low", "نور کم"
        INDIRECT = "indirect", "نور غیرمستقیم"
        BRIGHT = "bright", "نور زیاد"
        DIRECT = "direct", "نور مستقیم"

    class WateringRequirement(models.TextChoices):
        LOW = "low", "کم"
        MEDIUM = "medium", "متوسط"
        HIGH = "high", "زیاد"

    class CareDifficulty(models.TextChoices):
        EASY = "easy", "آسان"
        MEDIUM = "medium", "متوسط"
        HARD = "hard", "حساس"

    product = models.OneToOneField(
        Product,
        on_delete=models.CASCADE,
        related_name="plant_details",
        verbose_name="محصول",
    )
    plant_type = models.CharField("نوع گیاه", max_length=120)
    color = models.CharField("رنگ", max_length=80, blank=True)
    plant_size = models.CharField(
        "اندازه گیاه", max_length=20, choices=PlantSize.choices, blank=True
    )
    approximate_height_cm = models.PositiveSmallIntegerField(
        "ارتفاع تقریبی (سانتی‌متر)", blank=True, null=True, validators=[MinValueValidator(0)]
    )
    quality_grade = models.CharField(
        "درجه کیفیت", max_length=20, choices=QualityGrade.choices, blank=True
    )
    pet_friendly = models.BooleanField("سازگار با حیوانات خانگی", blank=True, null=True)
    pot_included = models.BooleanField("گلدان همراه", default=True)
    pot_material = models.CharField("جنس گلدان", max_length=50, blank=True)
    pot_color = models.CharField("رنگ گلدان", max_length=50, blank=True)
    pot_size_cm = models.PositiveSmallIntegerField(
        "اندازه گلدان (سانتی‌متر)", blank=True, null=True, validators=[MinValueValidator(0)]
    )
    has_drainage = models.BooleanField("دارای زهکشی", blank=True, null=True)
    light_requirement = models.CharField(
        "نیاز نوری", max_length=20, choices=LightRequirement.choices, blank=True
    )
    watering_requirement = models.CharField(
        "نیاز آبیاری", max_length=20, choices=WateringRequirement.choices, blank=True
    )
    care_difficulty = models.CharField(
        "سختی نگهداری", max_length=20, choices=CareDifficulty.choices, blank=True
    )
    ideal_temperature_min = models.SmallIntegerField("کمینه دمای مناسب", blank=True, null=True)
    ideal_temperature_max = models.SmallIntegerField("بیشینه دمای مناسب", blank=True, null=True)
    care_notes = models.TextField("نکات نگهداری", blank=True)
    shipping_notes = models.TextField("نکات ارسال", blank=True)

    class Meta:
        verbose_name = "مشخصات گیاه"
        verbose_name_plural = "مشخصات گیاهان"
        constraints = (
            models.CheckConstraint(
                condition=Q(approximate_height_cm__gte=0) | Q(approximate_height_cm__isnull=True),
                name="plant_height_nonnegative",
            ),
            models.CheckConstraint(
                condition=Q(pot_size_cm__gte=0) | Q(pot_size_cm__isnull=True),
                name="plant_pot_size_nonnegative",
            ),
            models.CheckConstraint(
                condition=(
                    Q(ideal_temperature_min__isnull=True)
                    | Q(ideal_temperature_max__isnull=True)
                    | Q(ideal_temperature_min__lte=models.F("ideal_temperature_max"))
                ),
                name="plant_temperature_range_valid",
            ),
        )

    def clean(self) -> None:
        super().clean()
        errors: dict[str, str] = {}
        if self.product_id and self.product.product_type != Product.ProductType.PLANT:
            errors["product"] = "مشخصات گیاه فقط برای محصول از نوع گیاه مجاز است."
        if (
            self.ideal_temperature_min is not None
            and self.ideal_temperature_max is not None
            and self.ideal_temperature_min > self.ideal_temperature_max
        ):
            errors["ideal_temperature_max"] = "بیشینه دما باید از کمینه دما بیشتر باشد."
        if not self.pot_included:
            self.pot_material = ""
            self.pot_color = ""
            self.pot_size_cm = None
            self.has_drainage = None
        if errors:
            raise ValidationError(errors)

    def __str__(self) -> str:
        return f"مشخصات {self.product.name}"


class CutFlowerDetails(models.Model):
    class FlowerGrade(models.TextChoices):
        STANDARD = "standard", "استاندارد"
        PREMIUM = "premium", "ممتاز"
        LUXURY = "luxury", "لوکس"

    class FragranceLevel(models.TextChoices):
        NONE = "none", "بدون رایحه"
        LIGHT = "light", "ملایم"
        MEDIUM = "medium", "متوسط"
        STRONG = "strong", "قوی"

    class SeasonalAvailability(models.TextChoices):
        YEAR_ROUND = "year_round", "چهارفصل"
        SPRING = "spring", "بهار"
        SUMMER = "summer", "تابستان"
        AUTUMN = "autumn", "پاییز"
        WINTER = "winter", "زمستان"

    product = models.OneToOneField(
        Product,
        on_delete=models.CASCADE,
        related_name="cut_flower_details",
        verbose_name="محصول",
    )
    flower_type = models.CharField("نوع گل", max_length=120)
    variety = models.CharField("رقم", max_length=120, blank=True)
    color = models.CharField("رنگ", max_length=80, blank=True)
    stem_length_cm = models.PositiveSmallIntegerField(
        "طول ساقه (سانتی‌متر)", blank=True, null=True, validators=[MinValueValidator(0)]
    )
    flower_grade = models.CharField(
        "درجه گل", max_length=20, choices=FlowerGrade.choices, blank=True
    )
    vase_life_days = models.PositiveSmallIntegerField(
        "ماندگاری در گلدان (روز)", blank=True, null=True, validators=[MinValueValidator(0)]
    )
    origin = models.CharField("مبدأ", max_length=120, blank=True)
    fragrance_level = models.CharField(
        "میزان رایحه", max_length=20, choices=FragranceLevel.choices, blank=True
    )
    seasonal_availability = models.CharField(
        "فصل عرضه", max_length=20, choices=SeasonalAvailability.choices, blank=True
    )
    care_notes = models.TextField("نکات نگهداری", blank=True)
    shipping_notes = models.TextField("نکات ارسال", blank=True)

    class Meta:
        verbose_name = "مشخصات گل شاخه‌ای"
        verbose_name_plural = "مشخصات گل‌های شاخه‌ای"
        constraints = (
            models.CheckConstraint(
                condition=Q(stem_length_cm__gte=0) | Q(stem_length_cm__isnull=True),
                name="cut_flower_stem_length_nonnegative",
            ),
            models.CheckConstraint(
                condition=Q(vase_life_days__gte=0) | Q(vase_life_days__isnull=True),
                name="cut_flower_vase_life_nonnegative",
            ),
        )

    def clean(self) -> None:
        super().clean()
        if self.product_id and self.product.product_type != Product.ProductType.CUT_FLOWER:
            raise ValidationError(
                {"product": "مشخصات گل شاخه‌ای فقط برای محصول از نوع گل شاخه‌ای مجاز است."}
            )

    def __str__(self) -> str:
        return f"مشخصات {self.product.name}"


class Plant(Product):
    class Meta:
        proxy = True
        verbose_name = "گیاه"
        verbose_name_plural = "گیاهان"


class CutFlower(Product):
    class Meta:
        proxy = True
        verbose_name = "گل شاخه‌ای"
        verbose_name_plural = "گل‌های شاخه‌ای"


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="images", verbose_name="محصول"
    )
    image = models.CharField("تصویر", max_length=255)
    alt_text = models.CharField("متن جایگزین", max_length=180, blank=True)
    sort_order = models.PositiveIntegerField("ترتیب نمایش", default=0)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)

    class Meta:
        ordering = ("sort_order", "id")
        verbose_name = "تصویر محصول"
        verbose_name_plural = "تصاویر محصول"

    def __str__(self) -> str:
        return f"تصویر {self.product}"


class HomeSlide(models.Model):
    admin_title = models.CharField(
        "عنوان داخلی",
        max_length=120,
        help_text="فقط برای شناسایی اسلاید در پنل مدیریت نمایش داده می‌شود.",
    )
    eyebrow = models.CharField("متن بالای عنوان", max_length=80, blank=True)
    title = models.CharField("عنوان اصلی", max_length=120)
    description = models.CharField("توضیح کوتاه", max_length=240, blank=True)
    mobile_image = models.ImageField(
        "تصویر موبایل",
        upload_to="home/slides/mobile/%Y/%m/",
        help_text=(
            "تصویر عمودی با نسبت حدود ۳:۴ (برای نمونه ۹۰۰×۱۲۰۰) پیشنهاد می‌شود؛ "
            "سوژه و فضای امن متن را در مرکز نگه دارید."
        ),
    )
    desktop_image = models.ImageField(
        "تصویر دسکتاپ",
        upload_to="home/slides/desktop/%Y/%m/",
        help_text=(
            "تصویر عریض با نسبت حدود ۸:۳ (برای نمونه ۱۶۰۰×۶۰۰) پیشنهاد می‌شود؛ "
            "سوژه و فضای امن متن را در مرکز نگه دارید."
        ),
    )
    image_alt = models.CharField(
        "متن جایگزین تصویر",
        max_length=180,
        help_text="تصویر را کوتاه و معنادار برای کاربران صفحه‌خوان توصیف کنید.",
    )
    cta_label = models.CharField("متن دکمه", max_length=60, blank=True)
    cta_url = models.CharField(
        "مقصد دکمه",
        max_length=500,
        blank=True,
        help_text="فقط مسیر داخلی فلوریسا را وارد کنید؛ مانند /shop?category=plants.",
    )
    sort_order = models.PositiveIntegerField("ترتیب نمایش", default=0)
    is_active = models.BooleanField("فعال", default=True)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("زمان به‌روزرسانی", auto_now=True)

    class Meta:
        ordering = ("sort_order", "id")
        verbose_name = "اسلاید خانه"
        verbose_name_plural = "اسلایدهای خانه"

    def clean(self) -> None:
        super().clean()
        for field_name in (
            "admin_title",
            "eyebrow",
            "title",
            "description",
            "image_alt",
            "cta_label",
            "cta_url",
        ):
            value = getattr(self, field_name, "")
            if isinstance(value, str):
                setattr(self, field_name, value.strip())

        errors: dict[str, str] = {}
        for field_name in ("admin_title", "title", "image_alt"):
            if not getattr(self, field_name):
                errors[field_name] = "این فیلد نمی‌تواند خالی باشد."

        if bool(self.cta_label) != bool(self.cta_url):
            message = "متن و مقصد دکمه باید هر دو وارد شوند یا هر دو خالی باشند."
            errors["cta_label"] = message
            errors["cta_url"] = message

        if self.cta_url:
            parsed = urlsplit(self.cta_url)
            is_safe_internal_path = (
                self.cta_url.startswith("/")
                and not self.cta_url.startswith("//")
                and not parsed.scheme
                and not parsed.netloc
                and "\\" not in self.cta_url
                and not any(ord(character) < 32 for character in self.cta_url)
            )
            if not is_safe_internal_path:
                errors["cta_url"] = (
                    "مقصد دکمه باید یک مسیر داخلی امن باشد که با / شروع می‌شود."
                )

        if errors:
            raise ValidationError(errors)

    def __str__(self) -> str:
        return self.admin_title
