from django.db import migrations


def create_initial_variants(apps, schema_editor):
    Product = apps.get_model("products", "Product")
    CutFlowerDetails = apps.get_model("products", "CutFlowerDetails")
    CutFlowerVariant = apps.get_model("products", "CutFlowerVariant")

    details_by_product = {
        details.product_id: details
        for details in CutFlowerDetails.objects.all().iterator()
    }
    variants = []
    for product in Product.objects.filter(product_type="cut_flower").iterator():
        details = details_by_product.get(product.pk)
        color = (details.color if details else "").strip() or "پیش‌فرض"
        variants.append(
            CutFlowerVariant(
                product_id=product.pk,
                color=color,
                price=product.price,
                stock_quantity=product.stock_quantity,
                is_active=True,
            )
        )
    CutFlowerVariant.objects.bulk_create(variants)


def remove_initial_variants(apps, schema_editor):
    CutFlowerVariant = apps.get_model("products", "CutFlowerVariant")
    CutFlowerVariant.objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0015_arrangement_cutflowerdetails_bloom_opening_stage_and_more"),
    ]

    operations = [
        migrations.RunPython(create_initial_variants, remove_initial_variants),
    ]
