from django.db import migrations
from django.db.models import Q


PRODUCT_COVER_IMAGES = {
    "fiddle-leaf-fig": "parlor-palm.webp",
    "monstera-deliciosa": "variegated-spider-plant.webp",
}


def assign_remaining_plant_webp_images(apps, schema_editor) -> None:
    product_model = apps.get_model("products", "Product")

    for slug, filename in PRODUCT_COVER_IMAGES.items():
        product_model.objects.filter(slug=slug).filter(
            Q(cover_image__isnull=True) | Q(cover_image=""),
        ).update(cover_image=filename)


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0007_use_repository_webp_images"),
    ]

    operations = [
        migrations.RunPython(
            assign_remaining_plant_webp_images,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
