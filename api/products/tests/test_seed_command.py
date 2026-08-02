from io import StringIO

from django.core.management import call_command
from django.test import TestCase

from products.models import Category, Product
from products.seeding import CUT_FLOWERS_SLUG, INDOOR_PLANTS_SLUG


class SeedCatalogCommandTests(TestCase):
    def test_command_is_idempotent(self):
        output = StringIO()

        call_command("seed_catalog", stdout=output)
        call_command("seed_catalog", stdout=output)

        self.assertEqual(
            Category.objects.filter(slug=CUT_FLOWERS_SLUG).count(),
            1,
        )
        self.assertEqual(
            Category.objects.filter(slug=INDOOR_PLANTS_SLUG).count(),
            1,
        )
        self.assertEqual(
            Product.objects.filter(category__slug=INDOOR_PLANTS_SLUG).count(),
            5,
        )
        self.assertIn(CUT_FLOWERS_SLUG, output.getvalue())
        self.assertIn(INDOOR_PLANTS_SLUG, output.getvalue())
