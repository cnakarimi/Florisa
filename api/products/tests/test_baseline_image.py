from django.test import TestCase
from products.models import Category, Product, PlantDetails, Pot, PlantPotAssignment
from products.pot_options import plant_pot_options
from orders.services import ValidatedLine, configuration_image, pot_snapshot
from decimal import Decimal


class BaselineImageTests(TestCase):
    def setUp(self):
        self.product = Product.objects.create(category=Category.objects.create(name="plants", slug="baseline-test"), name="plant", slug="baseline-test", product_type="plant", price=1000, stock_quantity=5, cover_image="variegated-spider-plant.webp", cover_upload="plants/decorative.webp")
        self.details = PlantDetails.objects.create(product=self.product, plant_type="plant")

    def test_legacy_original_is_baseline_even_if_uploaded_cover_is_decorative(self):
        baseline = plant_pot_options(self.product)[0][0]
        self.assertEqual(baseline["configuration_image"], "variegated-spider-plant.webp")
        self.assertEqual(baseline["additional_price"], 0)
        line = ValidatedLine(self.product, None, 1, Decimal(1000), Decimal(1000))
        self.assertEqual(configuration_image(line), baseline["configuration_image"])
        self.assertEqual(pot_snapshot(line)["pot_attributes"]["configuration_image"], baseline["configuration_image"])

    def test_explicit_baseline_and_initial_decorative_are_independent(self):
        self.details.baseline_image = "plants/baseline/nursery.webp"
        option = PlantPotAssignment.objects.create(product=self.product, pot=Pot.objects.create(name="pot", stock_quantity=5), additional_price=200, combination_image="plants/decorative.webp")
        self.details.initial_pot_assignment = option
        self.details.save()
        options, initial = plant_pot_options(self.product)
        self.assertEqual(initial, option.pk)
        self.assertIn("plants/baseline/nursery.webp", options[0]["configuration_image"])
        self.assertIn("plants/decorative.webp", options[1]["configuration_image"])
        self.assertEqual(options[1]["unit_price"], 1200)
