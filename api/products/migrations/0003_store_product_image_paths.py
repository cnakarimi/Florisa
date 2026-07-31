from pathlib import PurePosixPath

from django.db import migrations, models


PRODUCT_COVER_FILENAMES = {
    "dawoodi-sefid": "dawoodi-white.jpg",
    "dawoodi-zard": "dawoodi-yellow.jpg",
    "red-rose": "rose-red.jpg",
    "white-lilium": "lily-white.jpg",
    "pink-carnation": "carnation-pink.jpg",
}


def filename(value: str) -> str:
    normalized = value.replace("\\", "/").rstrip("/")
    return PurePosixPath(normalized).name


def normalize_product_image_paths(apps, schema_editor) -> None:
    product_model = apps.get_model("products", "Product")
    product_image_model = apps.get_model("products", "ProductImage")

    for product in product_model.objects.exclude(cover_image__isnull=True).exclude(
        cover_image="",
    ):
        product.cover_image = PRODUCT_COVER_FILENAMES.get(
            product.slug,
            filename(product.cover_image),
        )
        product.save(update_fields=("cover_image",))

    for product_image in product_image_model.objects.exclude(image=""):
        product_image.image = filename(product_image.image)
        product_image.save(update_fields=("image",))


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0002_seed_cut_flowers"),
    ]

    operations = [
        migrations.AlterField(
            model_name="product",
            name="cover_image",
            field=models.CharField(
                blank=True,
                max_length=255,
                null=True,
                verbose_name="تصویر اصلی",
            ),
        ),
        migrations.AlterField(
            model_name="productimage",
            name="image",
            field=models.CharField(max_length=255, verbose_name="تصویر"),
        ),
        migrations.RunPython(
            normalize_product_image_paths,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
