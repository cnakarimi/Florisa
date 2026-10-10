import uuid
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
from unittest import skipUnless

from django.contrib.auth import get_user_model
from django.db import close_old_connections, connection
from django.test import TransactionTestCase
from rest_framework.exceptions import ValidationError

from orders.models import Order, UserAddress
from orders.services import create_order
from products.models import Category, Product, PlantDetails, Pot, PlantPotAssignment


@skipUnless(connection.vendor == "postgresql", "Requires an isolated PostgreSQL test database; SQLite cannot verify row locks.")
class SharedPotConcurrencyTests(TransactionTestCase):
    def test_two_customers_cannot_consume_the_same_last_pot(self):
        category = Category.objects.create(name="آزمایش", slug="concurrent-pots")
        pot = Pot.objects.create(name="آخرین گلدان", stock_quantity=1)
        inputs = []
        for index in range(2):
            user = get_user_model().objects.create_user(phone=f"0912000000{index}")
            address = UserAddress.objects.create(user=user, recipient_name="آزمایش", recipient_phone=user.phone, province="تهران", city="تهران", address_line="آزمایشی")
            plant = Product.objects.create(category=category, name="گیاه", slug=f"concurrent-{index}", product_type="plant", price=1000, stock_quantity=3, sale_unit="pot")
            PlantDetails.objects.create(product=plant, plant_type="آزمایش")
            option = PlantPotAssignment.objects.create(product=plant, pot=pot, additional_price=100)
            inputs.append((user.pk, address.pk, plant.pk, option.pk))
        barrier = Barrier(2)
        def purchase(values):
            close_old_connections()
            try:
                user_id, address_id, product_id, option_id = values
                user = get_user_model().objects.get(pk=user_id)
                barrier.wait(timeout=10)
                create_order(user=user, address_id=address_id, items=[{"product_id": product_id, "pot_option_id": option_id, "quantity": 1}], idempotency_key=uuid.uuid4())
                return "ordered"
            except ValidationError:
                return "unavailable"
            finally:
                close_old_connections()
        with ThreadPoolExecutor(max_workers=2) as pool:
            outcomes = list(pool.map(purchase, inputs))
        self.assertCountEqual(outcomes, ["ordered", "unavailable"])
        self.assertEqual(Order.objects.count(), 1)
        pot.refresh_from_db()
        self.assertEqual(pot.stock_quantity, 0)
        self.assertEqual(sum(Product.objects.get(pk=data[2]).stock_quantity for data in inputs), 5)
