from django.test import TestCase

from products.models import Category, PlantDetails, Product
from products.seeding import (
    CUT_FLOWERS_NAME,
    CUT_FLOWERS_SLUG,
    INDOOR_PLANTS_DESCRIPTION,
    INDOOR_PLANTS_NAME,
    INDOOR_PLANTS_SLUG,
    ensure_cut_flowers_category,
    ensure_indoor_plant_products,
    ensure_indoor_plants_category,
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

    def test_indoor_plants_category_exists_after_migration(self):
        category = Category.objects.get(slug=INDOOR_PLANTS_SLUG)

        self.assertEqual(category.name, INDOOR_PLANTS_NAME)
        self.assertEqual(category.description, INDOOR_PLANTS_DESCRIPTION)
        self.assertTrue(category.is_active)

    def test_indoor_plant_product_seed_is_idempotent(self):
        category = ensure_indoor_plants_category(Category)

        first = ensure_indoor_plant_products(Product, category)
        second = ensure_indoor_plant_products(Product, category)

        self.assertEqual(len(first), 5)
        self.assertEqual([product.pk for product in first], [product.pk for product in second])
        self.assertEqual(
            Product.objects.filter(category__slug=INDOOR_PLANTS_SLUG).count(),
            5,
        )
        expected_prices = {
            "zamioculcas-green": 890_000,
            "sword-sansevieria": 690_000,
            "fiddle-leaf-fig": 1_490_000,
            "variegated-pothos": 490_000,
            "monstera-deliciosa": 1_190_000,
        }
        self.assertEqual(
            dict(
                Product.objects.filter(
                    category__slug=INDOOR_PLANTS_SLUG,
                ).values_list("slug", "price"),
            ),
            expected_prices,
        )
        self.assertEqual(
            Product.objects.get(slug="fiddle-leaf-fig").plant_details.quality_grade,
            PlantDetails.QualityGrade.LUXURY,
        )
