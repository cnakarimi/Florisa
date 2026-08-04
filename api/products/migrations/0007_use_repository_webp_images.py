import products.validators
from django.db import migrations, models
from django.db.models import Q


CATEGORY_IMAGES = {
    "cut-flowers": (
        "florisa-cut-flowers-category.webp",
        ("", "florisa-cut-flowers-category.png"),
    ),
    "indoor-plants": (
        "florisa-indoor-plants-category.webp",
        ("", "florisa-indoor-plants-category.png"),
    ),
}

PRODUCT_COVER_IMAGES = {
    "dawoodi-sefid": ("dawoodi-white.webp", ("", "dawoodi-white.jpg")),
    "dawoodi-zard": ("dawoodi-yellow.webp", ("", "dawoodi-yellow.jpg")),
    "red-rose": ("rose-red.webp", ("", "rose-red.jpg")),
    "white-lilium": ("lily-white.webp", ("", "lily-white.jpg")),
    "pink-carnation": ("carnation-pink.webp", ("", "carnation-pink.jpg")),
    "zamioculcas-green": (
        "green-zz-plant.webp",
        ("", "green-zz-plant.jpg", "green-zz-plant.jpg.png"),
    ),
    "sword-sansevieria": (
        "snake-plant.webp",
        ("", "snake-plant.jpg", "snake-plant.jpg.png"),
    ),
    "variegated-pothos": (
        "golden-pothos.webp",
        ("", "golden-pothos.jpg", "golden-pothos.jpg.png"),
    ),
}


def use_repository_webp_images(apps, schema_editor) -> None:
    category_model = apps.get_model("products", "Category")
    product_model = apps.get_model("products", "Product")

    for slug, (target, legacy_values) in CATEGORY_IMAGES.items():
        category_model.objects.filter(slug=slug).filter(
            Q(image__isnull=True) | Q(image__in=legacy_values),
        ).update(image=target)

    for slug, (target, legacy_values) in PRODUCT_COVER_IMAGES.items():
        product_model.objects.filter(slug=slug).filter(
            Q(cover_image__isnull=True) | Q(cover_image__in=legacy_values),
        ).update(cover_image=target)


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0006_product_type_details"),
    ]

    operations = [
        migrations.AlterField(
            model_name="category",
            name="image",
            field=models.CharField(
                blank=True,
                help_text=(
                    "نام فایل موجود در web/public/images/categories را وارد کنید؛ "
                    "مانند florisa-indoor-plants-category.webp"
                ),
                max_length=255,
                null=True,
                validators=[products.validators.validate_repository_image_path],
                verbose_name="تصویر",
            ),
        ),
        migrations.RunPython(
            use_repository_webp_images,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
