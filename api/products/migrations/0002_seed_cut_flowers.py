from django.db import migrations


def seed_cut_flowers(apps, schema_editor) -> None:
    from products.seeding import ensure_cut_flowers_category

    category_model = apps.get_model("products", "Category")
    ensure_cut_flowers_category(category_model)


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(
            seed_cut_flowers,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
