from django.test import TestCase

from products.models import Category
from products.seeding import (
    CUT_FLOWERS_NAME,
    CUT_FLOWERS_SLUG,
    ensure_cut_flowers_category,
)


class InitialCategoryTests(TestCase):
    def test_cut_flowers_category_exists_after_migration(self):
        category = Category.objects.get(slug=CUT_FLOWERS_SLUG)

        self.assertEqual(category.name, CUT_FLOWERS_NAME)
        self.assertTrue(category.is_active)
        self.assertEqual(category.sort_order, 0)

    def test_seed_is_idempotent(self):
        first = ensure_cut_flowers_category(Category)
        second = ensure_cut_flowers_category(Category)

        self.assertEqual(first.pk, second.pk)
        self.assertEqual(
            Category.objects.filter(slug=CUT_FLOWERS_SLUG).count(),
            1,
        )
