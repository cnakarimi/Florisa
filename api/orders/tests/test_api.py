import uuid
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db import connection
from django.test import TestCase
from django.test.utils import CaptureQueriesContext
from rest_framework.test import APIClient

from orders.models import Order, UserAddress
from products.models import Category, Product


class OrderAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            phone="09120000001", full_name="کاربر اول"
        )
        self.other_user = get_user_model().objects.create_user(
            phone="09120000002", full_name="کاربر دوم"
        )
        self.category = Category.objects.create(name="گل", slug="flowers")
        self.product = Product.objects.create(
            category=self.category,
            name="رز قرمز",
            slug="red-rose-order-test",
            product_type=Product.ProductType.CUT_FLOWER,
            price=125_000,
            stock_quantity=20,
            sale_unit=Product.SaleUnit.BUNCH,
            unit_size=10,
            minimum_order_quantity=2,
        )
        self.address = UserAddress.objects.create(
            user=self.user,
            title="خانه",
            recipient_name="گیرنده",
            recipient_phone="09121111111",
            province="تهران",
            city="تهران",
            address_line="خیابان نمونه",
            is_default=True,
        )
        self.other_address = UserAddress.objects.create(
            user=self.other_user,
            recipient_name="دیگری",
            recipient_phone="09122222222",
            province="تهران",
            city="تهران",
            address_line="نشانی دیگر",
            is_default=True,
        )

    def login(self, user=None):
        self.client.force_login(user or self.user)

    def payload(self, **overrides):
        data = {
            "address_id": self.address.pk,
            "idempotency_key": str(uuid.uuid4()),
            "items": [{"product_id": self.product.pk, "quantity": 2}],
        }
        data.update(overrides)
        return data

    def test_anonymous_checkout_is_rejected(self):
        response = self.client.post("/api/orders/", self.payload(), format="json")
        self.assertIn(response.status_code, (401, 403))
        self.assertEqual(Order.objects.count(), 0)

    def test_authenticated_checkout_remains_csrf_protected(self):
        csrf_client = APIClient(enforce_csrf_checks=True)
        csrf_client.force_login(self.user)
        response = csrf_client.post("/api/orders/", self.payload(), format="json")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(Order.objects.count(), 0)

    def test_addresses_are_owned_and_tehran_is_validated(self):
        self.login()
        response = self.client.get("/api/addresses/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.data], [self.address.pk])
        self.assertEqual(self.client.get(f"/api/addresses/{self.other_address.pk}/").status_code, 404)
        invalid = self.client.post(
            "/api/addresses/",
            {
                "recipient_name": "الف",
                "recipient_phone": "۰۹۱۲۳۴۵۶۷۸۹",
                "province": "البرز",
                "city": "کرج",
                "address_line": "نشانی",
                "postal_code": "123",
            },
            format="json",
        )
        self.assertEqual(invalid.status_code, 400)
        self.assertIn("province", invalid.data)
        self.assertIn("city", invalid.data)
        self.assertIn("postal_code", invalid.data)

    def test_only_one_default_address_is_retained(self):
        self.login()
        response = self.client.post(
            "/api/addresses/",
            {
                "recipient_name": "گیرنده تازه",
                "recipient_phone": "09123333333",
                "province": "تهران",
                "city": "تهران",
                "address_line": "نشانی تازه",
                "is_default": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(UserAddress.objects.filter(user=self.user, is_default=True).count(), 1)
        self.address.refresh_from_db()
        self.assertFalse(self.address.is_default)

    def test_preview_uses_current_price_and_exact_totals(self):
        self.login()
        response = self.client.post(
            "/api/orders/preview/",
            {"items": [{"product_id": self.product.pk, "quantity": 3}], "total": 1},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["items"][0]["unit_price"], "125000")
        self.assertEqual(response.data["items"][0]["sale_unit"], Product.SaleUnit.BUNCH)
        self.assertEqual(response.data["items"][0]["unit_size"], 10)
        self.assertEqual(response.data["subtotal"], "375000")
        self.assertEqual(response.data["delivery_fee"], "0")
        self.assertEqual(response.data["total"], "375000")

    def test_duplicate_product_ids_and_minimum_are_rejected(self):
        self.login()
        duplicate = self.client.post(
            "/api/orders/preview/",
            {"items": [
                {"product_id": self.product.pk, "quantity": 2},
                {"product_id": self.product.pk, "quantity": 2},
            ]},
            format="json",
        )
        self.assertEqual(duplicate.status_code, 400)
        minimum = self.client.post(
            "/api/orders/preview/",
            {"items": [{"product_id": self.product.pk, "quantity": 1}]},
            format="json",
        )
        self.assertEqual(minimum.status_code, 400)
        self.assertEqual(int(minimum.data["item_errors"][0]["product_id"]), self.product.pk)

    def test_unpublished_and_out_of_stock_products_are_rejected(self):
        self.login()
        self.product.is_active = False
        self.product.save(update_fields=("is_active",))
        self.assertEqual(
            self.client.post("/api/orders/preview/", {"items": [{"product_id": self.product.pk, "quantity": 2}]}, format="json").status_code,
            400,
        )
        self.product.is_active = True
        self.product.stock_quantity = 0
        self.product.save(update_fields=("is_active", "stock_quantity"))
        self.assertEqual(
            self.client.post("/api/orders/preview/", {"items": [{"product_id": self.product.pk, "quantity": 2}]}, format="json").status_code,
            400,
        )

    def test_valid_order_snapshots_and_decrements_stock(self):
        self.login()
        response = self.client.post(
            "/api/orders/",
            self.payload(subtotal="1", total="1", payment_method="online"),
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        order = Order.objects.get()
        item = order.items.get()
        self.assertEqual(order.subtotal, Decimal("250000"))
        self.assertEqual(order.delivery_fee, Decimal("0"))
        self.assertEqual(order.total, Decimal("250000"))
        self.assertEqual(order.payment_method, Order.PaymentMethod.CASH_ON_DELIVERY)
        self.assertEqual(order.payment_status, Order.PaymentStatus.UNPAID)
        self.assertEqual(item.product_name, "رز قرمز")
        self.assertEqual(item.sale_unit_display, self.product.get_sale_unit_display())
        self.assertEqual(item.unit_price, Decimal("125000"))
        self.assertEqual(item.line_total, Decimal("250000"))
        self.assertEqual(item.unit_size, 10)
        self.assertEqual(order.address_line, self.address.address_line)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, 18)

    def test_failed_multi_item_order_rolls_back_completely(self):
        second = Product.objects.create(
            category=self.category,
            name="محصول دوم",
            slug="second-order-product",
            product_type=Product.ProductType.PLANT,
            price=50_000,
            stock_quantity=1,
            minimum_order_quantity=1,
        )
        self.login()
        response = self.client.post(
            "/api/orders/",
            self.payload(items=[
                {"product_id": self.product.pk, "quantity": 2},
                {"product_id": second.pk, "quantity": 2},
            ]),
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Order.objects.count(), 0)
        self.product.refresh_from_db()
        second.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, 20)
        self.assertEqual(second.stock_quantity, 1)

    def test_idempotency_returns_same_order_without_second_decrement(self):
        self.login()
        payload = self.payload()
        first = self.client.post("/api/orders/", payload, format="json")
        second = self.client.post("/api/orders/", payload, format="json")
        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(first.data["public_number"], second.data["public_number"])
        self.assertEqual(Order.objects.count(), 1)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, 18)

    def test_order_access_is_owned_and_queries_are_prefetched(self):
        self.login()
        created = self.client.post("/api/orders/", self.payload(), format="json")
        public_number = created.data["public_number"]
        self.client.force_login(self.other_user)
        self.assertEqual(self.client.get(f"/api/orders/{public_number}/").status_code, 404)
        self.assertEqual(self.client.get("/api/orders/").data, [])
        self.client.force_login(self.user)
        with CaptureQueriesContext(connection) as queries:
            response = self.client.get("/api/orders/")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(response.data), 1)
        self.assertLessEqual(len(queries), 4)

    def test_quantity_above_stock_never_makes_stock_negative(self):
        self.login()
        response = self.client.post(
            "/api/orders/",
            self.payload(items=[{"product_id": self.product.pk, "quantity": 21}]),
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, 20)
