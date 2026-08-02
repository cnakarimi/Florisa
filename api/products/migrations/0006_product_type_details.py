import re

import django.core.validators
import django.db.models.deletion
from django.db import migrations, models


PLANT_CATEGORY_SLUGS = {"indoor-plants"}
CUT_FLOWER_CATEGORY_SLUGS = {"cut-flowers"}
PLANT_SIZE_MAP = {
    "کوچک": "small",
    "متوسط": "medium",
    "بزرگ": "large",
    "small": "small",
    "medium": "medium",
    "large": "large",
}
PERSIAN_DIGITS = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")


def _temperature_range(value):
    numbers = [int(item) for item in re.findall(r"-?\d+", (value or "").translate(PERSIAN_DIGITS))]
    if len(numbers) >= 2:
        return numbers[0], numbers[1]
    return None, None


def _light_choice(value):
    value = value or ""
    if "غیرمستقیم" in value:
        return "indirect"
    if "مستقیم" in value:
        return "direct"
    if "زیاد" in value:
        return "bright"
    if "کم" in value:
        return "low"
    return ""


def _watering_choice(value):
    value = value or ""
    if any(token in value for token in ("۱۲", "۱۴", "15", "12", "14")):
        return "low"
    if value:
        return "medium"
    return ""


def migrate_product_details(apps, schema_editor):
    Product = apps.get_model("products", "Product")
    Category = apps.get_model("products", "Category")
    PlantDetails = apps.get_model("products", "PlantDetails")
    CutFlowerDetails = apps.get_model("products", "CutFlowerDetails")
    unresolved = []

    Category.objects.filter(
        slug="cut-flowers",
        name__in=("گل شاخه‌بریده", "گل شاخه‌بریده‌شده"),
    ).update(name="گل شاخه‌ای")

    plant_fields = (
        "plant_size",
        "plant_height_cm",
        "quality_grade",
        "is_pet_friendly",
        "pot_material",
        "pot_color",
        "pot_size_cm",
        "pot_has_drainage",
        "light_requirement",
        "watering_requirement",
        "care_difficulty",
        "ideal_temperature",
        "care_tips",
    )

    for product in Product.objects.select_related("category").all():
        category_slug = product.category.slug
        has_plant_data = any(getattr(product, field) not in (None, "", False) for field in plant_fields)
        if category_slug in PLANT_CATEGORY_SLUGS or has_plant_data:
            product.product_type = "plant"
            product.sale_unit = "pot"
            minimum_temperature, maximum_temperature = _temperature_range(product.ideal_temperature)
            preserved_notes = [product.care_tips]
            if product.light_requirement:
                preserved_notes.append(f"نیاز نوری پیشین: {product.light_requirement}")
            if product.watering_requirement:
                preserved_notes.append(f"نیاز آبیاری پیشین: {product.watering_requirement}")
            if product.ideal_temperature:
                preserved_notes.append(f"دمای ایده‌آل پیشین: {product.ideal_temperature}")
            PlantDetails.objects.create(
                product=product,
                plant_type=product.flower_type,
                color=product.color,
                plant_size=PLANT_SIZE_MAP.get(product.plant_size, product.plant_size),
                approximate_height_cm=product.plant_height_cm,
                quality_grade=product.quality_grade,
                pet_friendly=product.is_pet_friendly,
                pot_included=product.pot_included,
                pot_material=product.pot_material,
                pot_color=product.pot_color,
                pot_size_cm=product.pot_size_cm,
                has_drainage=product.pot_has_drainage,
                light_requirement=_light_choice(product.light_requirement),
                watering_requirement=_watering_choice(product.watering_requirement),
                care_difficulty=product.care_difficulty,
                ideal_temperature_min=minimum_temperature,
                ideal_temperature_max=maximum_temperature,
                care_notes="\n".join(note for note in preserved_notes if note),
                shipping_notes=product.delivery_notes,
            )
        elif category_slug in CUT_FLOWER_CATEGORY_SLUGS or product.flower_type:
            product.product_type = "cut_flower"
            product.sale_unit = "stem" if product.stems_per_bundle == 1 else "bunch"
            CutFlowerDetails.objects.create(
                product=product,
                flower_type=product.flower_type,
                color=product.color,
                flower_grade=product.quality_grade,
                care_notes=product.care_tips,
                shipping_notes=product.delivery_notes,
            )
        else:
            unresolved.append(product.pk)
            continue
        product.save(update_fields=("product_type", "sale_unit"))

    if unresolved:
        raise RuntimeError(
            "Product type could not be inferred for product IDs: "
            + ", ".join(str(pk) for pk in unresolved)
        )


def restore_legacy_fields(apps, schema_editor):
    Product = apps.get_model("products", "Product")
    for product in Product.objects.all():
        if product.product_type == "plant":
            details = getattr(product, "plant_details", None)
            if details:
                product.flower_type = details.plant_type
                product.color = details.color
                product.plant_size = details.plant_size
                product.plant_height_cm = details.approximate_height_cm
                product.quality_grade = details.quality_grade
                product.is_pet_friendly = details.pet_friendly
                product.pot_included = details.pot_included
                product.pot_material = details.pot_material
                product.pot_color = details.pot_color
                product.pot_size_cm = details.pot_size_cm
                product.pot_has_drainage = details.has_drainage
                product.light_requirement = details.light_requirement
                product.watering_requirement = details.watering_requirement
                product.care_difficulty = details.care_difficulty
                product.care_tips = details.care_notes
                product.delivery_notes = details.shipping_notes
        elif product.product_type == "cut_flower":
            details = getattr(product, "cut_flower_details", None)
            if details:
                product.flower_type = details.flower_type
                product.color = details.color
                product.quality_grade = details.flower_grade
                product.care_tips = details.care_notes
                product.delivery_notes = details.shipping_notes
        product.save()


class Migration(migrations.Migration):
    dependencies = [("products", "0005_store_category_image_filenames")]

    operations = [
        migrations.AddField(
            model_name="product",
            name="product_type",
            field=models.CharField(
                blank=True,
                choices=[("plant", "گیاه"), ("cut_flower", "گل شاخه‌ای")],
                db_index=True,
                max_length=20,
                null=True,
                verbose_name="نوع محصول",
            ),
        ),
        migrations.AddField(
            model_name="product",
            name="sale_unit",
            field=models.CharField(
                choices=[
                    ("item", "عدد"),
                    ("pot", "گلدان"),
                    ("stem", "شاخه"),
                    ("bunch", "دسته"),
                    ("bouquet", "دسته‌گل"),
                ],
                default="item",
                max_length=20,
                verbose_name="واحد فروش",
            ),
        ),
        migrations.CreateModel(
            name="PlantDetails",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("plant_type", models.CharField(max_length=120, verbose_name="نوع گیاه")),
                ("color", models.CharField(blank=True, max_length=80, verbose_name="رنگ")),
                ("plant_size", models.CharField(blank=True, choices=[("small", "کوچک"), ("medium", "متوسط"), ("large", "بزرگ")], max_length=20, verbose_name="اندازه گیاه")),
                ("approximate_height_cm", models.PositiveSmallIntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0)], verbose_name="ارتفاع تقریبی (سانتی‌متر)")),
                ("quality_grade", models.CharField(blank=True, choices=[("standard", "استاندارد"), ("premium", "ممتاز"), ("luxury", "لوکس")], max_length=20, verbose_name="درجه کیفیت")),
                ("pet_friendly", models.BooleanField(blank=True, null=True, verbose_name="سازگار با حیوانات خانگی")),
                ("pot_included", models.BooleanField(default=True, verbose_name="گلدان همراه")),
                ("pot_material", models.CharField(blank=True, max_length=50, verbose_name="جنس گلدان")),
                ("pot_color", models.CharField(blank=True, max_length=50, verbose_name="رنگ گلدان")),
                ("pot_size_cm", models.PositiveSmallIntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0)], verbose_name="اندازه گلدان (سانتی‌متر)")),
                ("has_drainage", models.BooleanField(blank=True, null=True, verbose_name="دارای زهکشی")),
                ("light_requirement", models.CharField(blank=True, choices=[("low", "نور کم"), ("indirect", "نور غیرمستقیم"), ("bright", "نور زیاد"), ("direct", "نور مستقیم")], max_length=20, verbose_name="نیاز نوری")),
                ("watering_requirement", models.CharField(blank=True, choices=[("low", "کم"), ("medium", "متوسط"), ("high", "زیاد")], max_length=20, verbose_name="نیاز آبیاری")),
                ("care_difficulty", models.CharField(blank=True, choices=[("easy", "آسان"), ("medium", "متوسط"), ("hard", "حساس")], max_length=20, verbose_name="سختی نگهداری")),
                ("ideal_temperature_min", models.SmallIntegerField(blank=True, null=True, verbose_name="کمینه دمای مناسب")),
                ("ideal_temperature_max", models.SmallIntegerField(blank=True, null=True, verbose_name="بیشینه دمای مناسب")),
                ("care_notes", models.TextField(blank=True, verbose_name="نکات نگهداری")),
                ("shipping_notes", models.TextField(blank=True, verbose_name="نکات ارسال")),
                ("product", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="plant_details", to="products.product", verbose_name="محصول")),
            ],
            options={
                "verbose_name": "مشخصات گیاه",
                "verbose_name_plural": "مشخصات گیاهان",
                "constraints": [
                    models.CheckConstraint(condition=models.Q(("approximate_height_cm__gte", 0), ("approximate_height_cm__isnull", True), _connector="OR"), name="plant_height_nonnegative"),
                    models.CheckConstraint(condition=models.Q(("pot_size_cm__gte", 0), ("pot_size_cm__isnull", True), _connector="OR"), name="plant_pot_size_nonnegative"),
                    models.CheckConstraint(condition=models.Q(("ideal_temperature_min__isnull", True), ("ideal_temperature_max__isnull", True), ("ideal_temperature_min__lte", models.F("ideal_temperature_max")), _connector="OR"), name="plant_temperature_range_valid"),
                ],
            },
        ),
        migrations.CreateModel(
            name="CutFlowerDetails",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("flower_type", models.CharField(max_length=120, verbose_name="نوع گل")),
                ("variety", models.CharField(blank=True, max_length=120, verbose_name="رقم")),
                ("color", models.CharField(blank=True, max_length=80, verbose_name="رنگ")),
                ("stem_length_cm", models.PositiveSmallIntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0)], verbose_name="طول ساقه (سانتی‌متر)")),
                ("flower_grade", models.CharField(blank=True, choices=[("standard", "استاندارد"), ("premium", "ممتاز"), ("luxury", "لوکس")], max_length=20, verbose_name="درجه گل")),
                ("vase_life_days", models.PositiveSmallIntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0)], verbose_name="ماندگاری در گلدان (روز)")),
                ("origin", models.CharField(blank=True, max_length=120, verbose_name="مبدأ")),
                ("fragrance_level", models.CharField(blank=True, choices=[("none", "بدون رایحه"), ("light", "ملایم"), ("medium", "متوسط"), ("strong", "قوی")], max_length=20, verbose_name="میزان رایحه")),
                ("seasonal_availability", models.CharField(blank=True, choices=[("year_round", "چهارفصل"), ("spring", "بهار"), ("summer", "تابستان"), ("autumn", "پاییز"), ("winter", "زمستان")], max_length=20, verbose_name="فصل عرضه")),
                ("care_notes", models.TextField(blank=True, verbose_name="نکات نگهداری")),
                ("shipping_notes", models.TextField(blank=True, verbose_name="نکات ارسال")),
                ("product", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="cut_flower_details", to="products.product", verbose_name="محصول")),
            ],
            options={
                "verbose_name": "مشخصات گل شاخه‌ای",
                "verbose_name_plural": "مشخصات گل‌های شاخه‌ای",
                "constraints": [
                    models.CheckConstraint(condition=models.Q(("stem_length_cm__gte", 0), ("stem_length_cm__isnull", True), _connector="OR"), name="cut_flower_stem_length_nonnegative"),
                    models.CheckConstraint(condition=models.Q(("vase_life_days__gte", 0), ("vase_life_days__isnull", True), _connector="OR"), name="cut_flower_vase_life_nonnegative"),
                ],
            },
        ),
        migrations.RunPython(migrate_product_details, restore_legacy_fields),
        migrations.AlterField(
            model_name="product",
            name="product_type",
            field=models.CharField(choices=[("plant", "گیاه"), ("cut_flower", "گل شاخه‌ای")], db_index=True, max_length=20, verbose_name="نوع محصول"),
        ),
        migrations.RenameField(model_name="product", old_name="stems_per_bundle", new_name="unit_size"),
        migrations.RenameField(model_name="product", old_name="price_per_bundle", new_name="price"),
        migrations.RenameField(model_name="product", old_name="stock_bundles", new_name="stock_quantity"),
        migrations.RenameField(model_name="product", old_name="minimum_order_bundles", new_name="minimum_order_quantity"),
        migrations.AlterField(model_name="product", name="unit_size", field=models.PositiveIntegerField(default=1, validators=[django.core.validators.MinValueValidator(1)], verbose_name="تعداد در هر واحد فروش")),
        migrations.AlterField(model_name="product", name="price", field=models.PositiveBigIntegerField(validators=[django.core.validators.MinValueValidator(0)], verbose_name="قیمت هر واحد فروش (تومان)")),
        migrations.AlterField(model_name="product", name="stock_quantity", field=models.PositiveIntegerField(default=0, validators=[django.core.validators.MinValueValidator(0)], verbose_name="موجودی واحد فروش")),
        migrations.AlterField(model_name="product", name="minimum_order_quantity", field=models.PositiveIntegerField(default=1, validators=[django.core.validators.MinValueValidator(1)], verbose_name="حداقل تعداد واحد سفارش")),
        migrations.RemoveField(model_name="product", name="flower_type"),
        migrations.RemoveField(model_name="product", name="color"),
        migrations.RemoveField(model_name="product", name="plant_size"),
        migrations.RemoveField(model_name="product", name="plant_height_cm"),
        migrations.RemoveField(model_name="product", name="quality_grade"),
        migrations.RemoveField(model_name="product", name="is_pet_friendly"),
        migrations.RemoveField(model_name="product", name="pot_included"),
        migrations.RemoveField(model_name="product", name="pot_material"),
        migrations.RemoveField(model_name="product", name="pot_color"),
        migrations.RemoveField(model_name="product", name="pot_size_cm"),
        migrations.RemoveField(model_name="product", name="pot_has_drainage"),
        migrations.RemoveField(model_name="product", name="light_requirement"),
        migrations.RemoveField(model_name="product", name="watering_requirement"),
        migrations.RemoveField(model_name="product", name="care_difficulty"),
        migrations.RemoveField(model_name="product", name="ideal_temperature"),
        migrations.RemoveField(model_name="product", name="care_tips"),
        migrations.RemoveField(model_name="product", name="delivery_notes"),
        migrations.AddConstraint(model_name="product", constraint=models.CheckConstraint(condition=models.Q(("price__gte", 0)), name="product_price_nonnegative")),
        migrations.AddConstraint(model_name="product", constraint=models.CheckConstraint(condition=models.Q(("stock_quantity__gte", 0)), name="product_stock_nonnegative")),
        migrations.AddConstraint(model_name="product", constraint=models.CheckConstraint(condition=models.Q(("unit_size__gte", 1)), name="product_unit_size_positive")),
        migrations.AddConstraint(model_name="product", constraint=models.CheckConstraint(condition=models.Q(("minimum_order_quantity__gte", 1)), name="product_minimum_order_positive")),
        migrations.CreateModel(name="Plant", fields=[], options={"verbose_name": "گیاه", "verbose_name_plural": "گیاهان", "proxy": True, "indexes": [], "constraints": []}, bases=("products.product",)),
        migrations.CreateModel(name="CutFlower", fields=[], options={"verbose_name": "گل شاخه‌ای", "verbose_name_plural": "گل‌های شاخه‌ای", "proxy": True, "indexes": [], "constraints": []}, bases=("products.product",)),
    ]
