from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.test import TransactionTestCase


class CutFlowerVariantDataMigrationTests(TransactionTestCase):
    migrate_from = ("products", "0015_arrangement_cutflowerdetails_bloom_opening_stage_and_more")
    migrate_to = ("products", "0016_seed_cut_flower_variants")

    def setUp(self):
        super().setUp()
        executor = MigrationExecutor(connection)
        executor.migrate([self.migrate_from])
        old_apps = executor.loader.project_state([self.migrate_from]).apps
        Category = old_apps.get_model("products", "Category")
        Product = old_apps.get_model("products", "Product")
        CutFlowerDetails = old_apps.get_model("products", "CutFlowerDetails")

        category = Category.objects.create(name="گل شاخه‌ای", slug="migration-cut-flowers")
        self.product_id = Product.objects.create(
            category=category,
            name="رز مهاجرت",
            slug="migration-rose",
            product_type="cut_flower",
            price=321_000,
            stock_quantity=17,
            sale_unit="bunch",
            unit_size=12,
            minimum_order_quantity=1,
        ).pk
        CutFlowerDetails.objects.create(
            product_id=self.product_id,
            flower_type="رز",
            color="زرشکی",
        )

        executor = MigrationExecutor(connection)
        executor.migrate([self.migrate_to])
        self.apps = executor.loader.project_state([self.migrate_to]).apps

    def tearDown(self):
        executor = MigrationExecutor(connection)
        executor.migrate(executor.loader.graph.leaf_nodes())
        super().tearDown()

    def test_preserves_product_and_creates_variant_from_existing_values(self):
        Product = self.apps.get_model("products", "Product")
        CutFlowerVariant = self.apps.get_model("products", "CutFlowerVariant")

        product = Product.objects.get(pk=self.product_id)
        variant = CutFlowerVariant.objects.get(product_id=self.product_id)
        self.assertEqual(product.slug, "migration-rose")
        self.assertEqual(product.price, 321_000)
        self.assertEqual(product.stock_quantity, 17)
        self.assertEqual(variant.color, "زرشکی")
        self.assertEqual(variant.price, 321_000)
        self.assertEqual(variant.stock_quantity, 17)
        self.assertTrue(variant.is_active)
