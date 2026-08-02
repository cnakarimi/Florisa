from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.db.models.deletion import ProtectedError
from django.test import TestCase

from products.models import Category, CutFlowerDetails, PlantDetails, Product, ProductImage


class ProductModelTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="محصولات", slug="products")

    def make_product(self, product_type=Product.ProductType.CUT_FLOWER, **overrides):
        sequence = Product.objects.count() + 1
        values = {
            "category": self.category,
            "name": f"محصول {sequence}",
            "slug": f"product-{sequence}",
            "product_type": product_type,
            "price": 250_000,
            "stock_quantity": 10,
            "sale_unit": Product.SaleUnit.STEM,
            "unit_size": 1,
            "minimum_order_quantity": 1,
        }
        values.update(overrides)
        return Product.objects.create(**values)

    def test_valid_plant_and_details(self):
        product = self.make_product(
            Product.ProductType.PLANT,
            sale_unit=Product.SaleUnit.POT,
        )
        details = PlantDetails.objects.create(
            product=product,
            plant_type="پتوس",
            plant_size=PlantDetails.PlantSize.MEDIUM,
            approximate_height_cm=45,
            pot_included=True,
            light_requirement=PlantDetails.LightRequirement.INDIRECT,
        )

        details.full_clean()
        product.full_clean()
        self.assertEqual(product.plant_details, details)

    def test_valid_cut_flower_and_details(self):
        product = self.make_product()
        details = CutFlowerDetails.objects.create(
            product=product,
            flower_type="رز",
            variety="هلندی",
            stem_length_cm=70,
            vase_life_days=8,
        )

        details.full_clean()
        product.full_clean()
        self.assertEqual(product.cut_flower_details, details)

    def test_mismatched_detail_type_is_rejected(self):
        product = self.make_product(Product.ProductType.PLANT)
        details = CutFlowerDetails(product=product, flower_type="رز")

        with self.assertRaises(ValidationError) as error:
            details.full_clean()

        self.assertIn("product", error.exception.message_dict)

    def test_product_requires_exact_matching_detail_after_save(self):
        product = self.make_product(Product.ProductType.PLANT)

        with self.assertRaises(ValidationError) as error:
            product.full_clean()

        self.assertIn("product_type", error.exception.message_dict)

    def test_product_type_change_is_blocked_without_deleting_details(self):
        product = self.make_product(Product.ProductType.PLANT)
        PlantDetails.objects.create(product=product, plant_type="پتوس")
        product.product_type = Product.ProductType.CUT_FLOWER

        with self.assertRaises(ValidationError):
            product.full_clean()

        self.assertTrue(PlantDetails.objects.filter(product=product).exists())

    def test_temperature_range_is_validated(self):
        product = self.make_product(Product.ProductType.PLANT)
        details = PlantDetails(
            product=product,
            plant_type="فیکوس",
            ideal_temperature_min=30,
            ideal_temperature_max=18,
        )

        with self.assertRaises(ValidationError) as error:
            details.full_clean()

        self.assertIn("ideal_temperature_max", error.exception.message_dict)

    def test_pot_fields_are_cleared_when_no_pot_is_included(self):
        product = self.make_product(Product.ProductType.PLANT)
        details = PlantDetails(
            product=product,
            plant_type="فیکوس",
            pot_included=False,
            pot_material="سرامیک",
            pot_color="سفید",
            pot_size_cm=20,
            has_drainage=True,
        )

        details.full_clean()

        self.assertEqual(details.pot_material, "")
        self.assertEqual(details.pot_color, "")
        self.assertIsNone(details.pot_size_cm)
        self.assertIsNone(details.has_drainage)

    def test_minimum_order_cannot_exceed_positive_stock(self):
        product = self.make_product(stock_quantity=2, minimum_order_quantity=3)

        with self.assertRaises(ValidationError) as error:
            product.full_clean()

        self.assertIn("minimum_order_quantity", error.exception.message_dict)

    def test_database_constraints_reject_invalid_commercial_values(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            self.make_product(unit_size=0)

    def test_is_in_stock_uses_sale_unit_stock(self):
        self.assertTrue(self.make_product(stock_quantity=2).is_in_stock)
        self.assertFalse(self.make_product(stock_quantity=0).is_in_stock)

    def test_duplicate_slug_is_rejected(self):
        self.make_product(slug="same-slug")
        with self.assertRaises(IntegrityError), transaction.atomic():
            self.make_product(slug="same-slug")

    def test_deleting_category_with_products_is_protected(self):
        self.make_product()
        with self.assertRaises(ProtectedError):
            self.category.delete()

    def test_deleting_product_cascades_to_details_and_images(self):
        product = self.make_product()
        CutFlowerDetails.objects.create(product=product, flower_type="رز")
        ProductImage.objects.create(product=product, image="rose.jpg")

        product.delete()

        self.assertFalse(CutFlowerDetails.objects.exists())
        self.assertFalse(ProductImage.objects.exists())
