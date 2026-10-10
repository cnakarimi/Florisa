import uuid
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError as ModelValidationError
from django.db import IntegrityError, transaction
from django.test import TestCase
from rest_framework.exceptions import ValidationError
from rest_framework.test import APIClient

from orders.models import Order, UserAddress
from orders.services import create_order, preview_cart
from products.models import Category, Product, PlantDetails, PlantPotAssignment, Pot
from products.views import public_product_queryset
from products.serializers import ProductListSerializer


class PlantPotPurchasingTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="گیاه", slug="pot-tests")
        self.user = get_user_model().objects.create_user(phone="09120000001")
        self.address = UserAddress.objects.create(user=self.user, recipient_name="آزمایش", recipient_phone="09120000001", province="تهران", city="تهران", address_line="نشانی آزمایشی")
        self.plant = self.make_plant("plant-one", stock=8)
        self.other = self.make_plant("plant-two", stock=8)
        self.pot = Pot.objects.create(name="سرامیکی", material="سرامیک", color="سفید", diameter_cm=20, height_cm=22, stock_quantity=5)
        self.option = PlantPotAssignment.objects.create(product=self.plant, pot=self.pot, additional_price=200, combination_image="plants/pot-combinations/test.webp", display_order=2)
        self.shared = PlantPotAssignment.objects.create(product=self.other, pot=self.pot, additional_price=300)

    def make_plant(self, slug, stock):
        product = Product.objects.create(category=self.category, name=slug, slug=slug, product_type="plant", price=1000, stock_quantity=stock, sale_unit="pot")
        PlantDetails.objects.create(product=product, plant_type="گیاه", pot_material="قدیمی", pot_color="سبز", pot_size_cm=13)
        return product

    def line(self, product=None, option=None, quantity=1):
        return {"product_id": (product or self.plant).pk, "pot_option_id": option.pk if option else None, "quantity": quantity}

    def order(self, lines):
        return create_order(user=self.user, address_id=self.address.pk, items=lines, idempotency_key=uuid.uuid4())[0]

    def test_baseline_and_legacy_requests_use_base_price_without_pot_inventory(self):
        order = self.order([{"product_id": self.plant.pk, "quantity": 2}])
        item = order.items.get()
        self.assertEqual(item.unit_price, 1000)
        self.assertEqual(item.pot_surcharge, 0)
        self.assertEqual(item.pot_name, "گلدان پلاستیکی پایه")
        self.assertIsNone(item.pot_option_id_snapshot)
        self.plant.refresh_from_db(); self.pot.refresh_from_db()
        self.assertEqual(self.plant.stock_quantity, 6)
        self.assertEqual(self.pot.stock_quantity, 5)

    def test_paid_prices_are_current_and_snapshot_survives_edits_and_deletion(self):
        self.option.additional_price = 400
        self.option.save()
        order = self.order([self.line(option=self.option, quantity=2), self.line()])
        paid = order.items.get(pot_option_id_snapshot=self.option.pk)
        self.assertEqual(paid.unit_price, 1400)
        self.assertEqual(paid.pot_surcharge, 400)
        self.assertEqual(paid.pot_attributes["color"], "سفید")
        self.assertIn("pot-combinations/test.webp", paid.cover_image)
        self.pot.name = "تغییر یافته"; self.pot.save()
        self.pot.delete(); paid.refresh_from_db()
        self.assertIsNone(paid.pot_assignment)
        self.assertEqual(paid.pot_name, "سرامیکی")
        self.assertEqual(paid.unit_price, 1400)
        self.assertEqual(order.items.count(), 2)

    def test_same_plant_with_multiple_pots_has_distinct_order_lines(self):
        second = Pot.objects.create(name="دوم", stock_quantity=10)
        option = PlantPotAssignment.objects.create(product=self.plant, pot=second, additional_price=50)
        order = self.order([self.line(option=self.option), self.line(option=option), self.line()])
        self.assertEqual(order.items.count(), 3)
        self.plant.refresh_from_db(); self.pot.refresh_from_db(); second.refresh_from_db()
        self.assertEqual((self.plant.stock_quantity, self.pot.stock_quantity, second.stock_quantity), (5, 4, 9))

    def test_shared_pot_demand_across_plants_is_aggregated_and_atomic(self):
        with self.assertRaises(ValidationError) as error:
            self.order([self.line(option=self.option, quantity=3), self.line(product=self.other, option=self.shared, quantity=3)])
        self.assertEqual(len(error.exception.detail["item_errors"]), 2)
        self.assertEqual(Order.objects.count(), 0)
        self.pot.refresh_from_db(); self.plant.refresh_from_db()
        self.assertEqual((self.pot.stock_quantity, self.plant.stock_quantity), (5, 8))

    def test_plant_demand_across_baseline_and_paid_is_aggregated(self):
        with self.assertRaises(ValidationError):
            self.order([self.line(quantity=5), self.line(option=self.option, quantity=4)])
        self.assertEqual(Order.objects.count(), 0)

    def test_successful_shared_pot_order_decrements_shared_inventory_once(self):
        self.order([self.line(option=self.option, quantity=2), self.line(product=self.other, option=self.shared, quantity=2)])
        self.pot.refresh_from_db(); self.plant.refresh_from_db(); self.other.refresh_from_db()
        self.assertEqual((self.pot.stock_quantity, self.plant.stock_quantity, self.other.stock_quantity), (1, 6, 6))

    def test_invalid_inactive_and_out_of_stock_selection_are_not_replaced(self):
        for lines in ([self.line(option=self.shared)], [dict(self.line(), variant_id=99)]):
            with self.assertRaises(ValidationError): self.order(lines)
        self.pot.stock_quantity = 0; self.pot.save()
        with self.assertRaises(ValidationError): self.order([self.line(option=self.option)])
        self.order([self.line()])
        self.pot.stock_quantity = 5; self.pot.is_active = False; self.pot.save()
        with self.assertRaises(ValidationError): self.order([self.line(option=self.option)])
        self.pot.is_active = True; self.pot.save()
        self.option.is_active = False; self.option.save()
        with self.assertRaises(ValidationError): self.order([self.line(option=self.option)])

    def test_inventory_failure_rolls_back_order_and_both_inventories(self):
        with patch.object(Pot, "save", side_effect=RuntimeError("inventory failure")):
            with self.assertRaises(RuntimeError): self.order([self.line(option=self.option)])
        self.assertEqual(Order.objects.count(), 0)
        self.plant.refresh_from_db(); self.pot.refresh_from_db()
        self.assertEqual((self.plant.stock_quantity, self.pot.stock_quantity), (8, 5))

    def test_initial_option_fallback_and_api_do_not_expose_pot_stock(self):
        second = PlantPotAssignment.objects.create(product=self.plant, pot=Pot.objects.create(name="اول", stock_quantity=3), display_order=1)
        details = self.plant.plant_details
        details.initial_pot_assignment = self.option; details.save()
        def data(): return ProductListSerializer(public_product_queryset().get(pk=self.plant.pk)).data
        self.assertEqual(data()["initial_pot_option_id"], self.option.pk)
        self.pot.stock_quantity = 0; self.pot.save()
        result = data()
        self.assertEqual(result["initial_pot_option_id"], second.pk)
        self.assertNotIn(self.option.pk, [o["id"] for o in result["pot_options"]])
        self.assertNotIn("stock_quantity", result["pot_options"][1])
        second.is_active = False; second.save()
        self.assertIsNone(data()["initial_pot_option_id"])
        self.assertEqual(len(data()["pot_options"]), 1)
        details.initial_pot_assignment = self.shared
        with self.assertRaises(ModelValidationError): details.full_clean()

    def test_unique_assignments_and_api_errors_keep_option_identity(self):
        with transaction.atomic():
            with self.assertRaises(IntegrityError): PlantPotAssignment.objects.create(product=self.plant, pot=self.pot)
        client = APIClient(); client.force_login(self.user)
        response = client.post("/api/orders/preview/", {"items": [self.line(option=self.shared)]}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(int(response.data["item_errors"][0]["pot_option_id"]), self.shared.pk)
        preview = preview_cart(user=self.user, items=[self.line(option=self.option)])
        self.assertEqual(preview["items"][0]["pot_name"], self.pot.name)
        self.assertEqual(preview["items"][0]["unit_price"], "1200")
