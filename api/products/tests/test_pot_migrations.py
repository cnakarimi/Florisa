import uuid
from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.test import TransactionTestCase


class PotMigrationPreservationTests(TransactionTestCase):
    def test_existing_plant_and_order_are_preserved_without_inventory_inference(self):
        executor = MigrationExecutor(connection)
        old_targets = [("products", "0016_seed_cut_flower_variants"), ("orders", "0002_remove_orderitem_unique_product_per_order_and_more")]
        executor.migrate(old_targets)
        apps = executor.loader.project_state(old_targets).apps
        category = apps.get_model("products", "Category").objects.create(name="قدیمی", slug="legacy-pot")
        product = apps.get_model("products", "Product").objects.create(category=category, name="گیاه قدیمی", slug="legacy-plant", product_type="plant", price=1700, stock_quantity=9, sale_unit="pot")
        details = apps.get_model("products", "PlantDetails").objects.create(product=product, plant_type="قدیمی", pot_included=True, pot_material="سرامیک", pot_color="آبی", pot_size_cm=17, has_drainage=True)
        user = apps.get_model("accounts", "User").objects.create(phone="09120000999")
        order = apps.get_model("orders", "Order").objects.create(user=user, subtotal=3400, delivery_fee=0, total=3400, recipient_name="آزمایش", recipient_phone="09120000999", province="تهران", city="تهران", address_line="آزمایشی", idempotency_key=uuid.uuid4())
        item = apps.get_model("orders", "OrderItem").objects.create(order=order, product=product, product_name="گیاه قدیمی", product_type="plant", sale_unit="pot", sale_unit_display="گلدان", unit_size=1, quantity=2, unit_price=1700, line_total=3400, cover_image="old.webp")
        executor = MigrationExecutor(connection)
        executor.migrate(executor.loader.graph.leaf_nodes())
        from products.models import Product, PlantDetails, Pot, PlantPotAssignment
        from orders.models import OrderItem
        new_product = Product.objects.get(pk=product.pk)
        new_details = PlantDetails.objects.get(pk=details.pk)
        new_item = OrderItem.objects.get(pk=item.pk)
        self.assertEqual((new_product.price, new_product.stock_quantity), (1700, 9))
        self.assertEqual((new_details.pot_material, new_details.pot_color, new_details.pot_size_cm, new_details.has_drainage), ("سرامیک", "آبی", 17, True))
        self.assertIsNone(new_details.initial_pot_assignment_id)
        self.assertEqual((Pot.objects.count(), PlantPotAssignment.objects.count()), (0, 0))
        self.assertEqual((new_item.unit_price, new_item.line_total, new_item.cover_image), (1700, 3400, "old.webp"))
        self.assertIsNone(new_item.pot_option_id_snapshot)
        self.assertEqual(new_item.pot_attributes, {})

    def tearDown(self):
        executor = MigrationExecutor(connection)
        executor.migrate(executor.loader.graph.leaf_nodes())
        super().tearDown()
