from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.db.models.deletion import ProtectedError
from django.test import TestCase

from products.models import Category, Product, ProductImage


class CatalogModelTests(TestCase):
    def setUp(self) -> None:
        self.category = Category.objects.create(
            name="گل‌های آزمایشی",
            slug="test-flowers",
        )

    def make_product(self, **overrides) -> Product:
        values = {
            "category": self.category,
            "name": "داوودی سفید",
            "slug": "white-chrysanthemum",
            "flower_type": "داوودی",
            "color": "سفید",
            "stems_per_bundle": 20,
            "price_per_bundle": 250_000,
            "stock_bundles": 10,
            "minimum_order_bundles": 1,
        }
        values.update(overrides)
        return Product.objects.create(**values)

    def test_category_can_be_created(self):
        category = Category.objects.create(
            name="دسته‌بندی دوم",
            slug="second-category",
        )

        self.assertEqual(str(category), "دسته‌بندی دوم")

    def test_product_can_be_created(self):
        product = self.make_product()

        self.assertEqual(product.category, self.category)
        self.assertEqual(product.stems_per_bundle, 20)
        self.assertEqual(product.price_per_bundle, 250_000)

    def test_product_image_can_be_created(self):
        product = self.make_product()
        image = ProductImage.objects.create(
            product=product,
            image="chrysanthemum.jpg",
            alt_text="گل داوودی سفید",
        )

        self.assertEqual(image.product, product)
        self.assertEqual(image.image, "chrysanthemum.jpg")
        self.assertIn(str(product), str(image))

    def test_product_string_is_meaningful(self):
        product = self.make_product()

        label = str(product)
        self.assertIn("داوودی", label)
        self.assertIn("سفید", label)
        self.assertIn("20", label)

    def test_is_in_stock_is_true_with_available_bundles(self):
        product = self.make_product(stock_bundles=2)

        self.assertTrue(product.is_in_stock)

    def test_is_in_stock_is_false_without_available_bundles(self):
        product = self.make_product(stock_bundles=0)

        self.assertFalse(product.is_in_stock)

    def test_zero_stems_per_bundle_is_rejected(self):
        product = self.make_product(stems_per_bundle=0)

        with self.assertRaises(ValidationError):
            product.full_clean()

    def test_zero_price_per_bundle_is_rejected(self):
        product = self.make_product(price_per_bundle=0)

        with self.assertRaises(ValidationError):
            product.full_clean()

    def test_zero_minimum_order_bundles_is_rejected(self):
        product = self.make_product(minimum_order_bundles=0)

        with self.assertRaises(ValidationError):
            product.full_clean()

    def test_negative_stock_is_rejected(self):
        product = Product(
            category=self.category,
            name="رز قرمز",
            slug="red-rose",
            flower_type="رز",
            price_per_bundle=200_000,
            stock_bundles=-1,
        )

        with self.assertRaises(ValidationError):
            product.full_clean()

    def test_minimum_order_cannot_exceed_positive_stock(self):
        product = self.make_product(
            stock_bundles=2,
            minimum_order_bundles=3,
        )

        with self.assertRaises(ValidationError) as error:
            product.full_clean()

        self.assertIn("minimum_order_bundles", error.exception.message_dict)

    def test_duplicate_product_slug_is_rejected(self):
        self.make_product()
        duplicate = Product(
            category=self.category,
            name="داوودی دیگر",
            slug="white-chrysanthemum",
            flower_type="داوودی",
            price_per_bundle=200_000,
        )

        with self.assertRaises(ValidationError):
            duplicate.full_clean()

        with self.assertRaises(IntegrityError), transaction.atomic():
            Product.objects.create(
                category=self.category,
                name="داوودی سوم",
                slug="white-chrysanthemum",
                flower_type="داوودی",
                price_per_bundle=200_000,
            )

    def test_deleting_category_with_products_is_protected(self):
        self.make_product()

        with self.assertRaises(ProtectedError):
            self.category.delete()

    def test_deleting_product_cascades_to_images(self):
        product = self.make_product()
        ProductImage.objects.create(
            product=product,
            image="products/gallery/chrysanthemum.jpg",
        )

        product.delete()

        self.assertFalse(ProductImage.objects.exists())
