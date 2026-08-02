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

    def test_category_image_filename_is_optional(self):
        category = Category(
            name="بدون تصویر",
            slug="without-image",
            image=None,
        )

        category.full_clean()

    def test_category_accepts_repository_image_filename(self):
        category = Category(
            name="گیاهان آپارتمانی",
            slug="valid-category-image",
            image="florisa-indoor-plants-category.png",
        )

        category.full_clean()

        self.assertEqual(
            category.image,
            "florisa-indoor-plants-category.png",
        )

    def test_category_rejects_unsafe_or_unsupported_image_paths(self):
        invalid_values = (
            "../secret.png",
            "/absolute/category.png",
            "C:\\images\\category.png",
            "nested\\category.png",
            "https://example.com/category.png",
            "category.exe",
        )

        for index, value in enumerate(invalid_values):
            with self.subTest(value=value):
                category = Category(
                    name=f"تصویر نامعتبر {index}",
                    slug=f"invalid-category-image-{index}",
                    image=value,
                )

                with self.assertRaises(ValidationError) as error:
                    category.full_clean()

                self.assertIn("image", error.exception.message_dict)

    def test_product_can_be_created(self):
        product = self.make_product()

        self.assertEqual(product.category, self.category)
        self.assertEqual(product.stems_per_bundle, 20)
        self.assertEqual(product.price_per_bundle, 250_000)

    def test_plant_fields_are_optional_for_existing_products(self):
        product = self.make_product()

        product.full_clean()

        self.assertEqual(product.quality_grade, "")
        self.assertIsNone(product.plant_height_cm)
        self.assertIsNone(product.is_pet_friendly)
        self.assertTrue(product.pot_included)

    def test_plant_choice_values_and_labels_are_stable(self):
        product = self.make_product(
            quality_grade=Product.QualityGrade.PREMIUM,
            care_difficulty=Product.CareDifficulty.EASY,
        )

        product.full_clean()

        self.assertEqual(product.quality_grade, "premium")
        self.assertEqual(product.get_quality_grade_display(), "ممتاز")
        self.assertEqual(product.care_difficulty, "easy")
        self.assertEqual(product.get_care_difficulty_display(), "آسان")

    def test_plant_dimensions_must_be_positive_when_provided(self):
        product = self.make_product(plant_height_cm=0, pot_size_cm=0)

        with self.assertRaises(ValidationError) as error:
            product.full_clean()

        self.assertIn("plant_height_cm", error.exception.message_dict)
        self.assertIn("pot_size_cm", error.exception.message_dict)

    def test_pot_details_are_optional_when_pot_is_not_included(self):
        product = self.make_product(
            pot_included=False,
            pot_material="",
            pot_color="",
            pot_size_cm=None,
            pot_has_drainage=None,
        )

        product.full_clean()

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
