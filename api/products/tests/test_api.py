import json
from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from products.models import Category, CutFlowerDetails, PlantDetails, Product, ProductImage


class CatalogAPITests(APITestCase):
    def setUp(self):
        self.plant_category, _ = Category.objects.get_or_create(
            slug="indoor-plants",
            defaults={"name": "گیاهان آپارتمانی", "sort_order": 1},
        )
        self.flower_category, _ = Category.objects.get_or_create(
            slug="cut-flowers",
            defaults={"name": "گل شاخه‌ای", "sort_order": 2},
        )
        self.inactive_category = Category.objects.create(
            name="غیرفعال", slug="inactive", is_active=False
        )

    def make_plant(self, **overrides):
        detail_overrides = overrides.pop("details", {})
        sequence = Product.objects.count() + 1
        values = {
            "category": self.plant_category,
            "name": f"پتوس {sequence}",
            "slug": f"pothos-{sequence}",
            "product_type": Product.ProductType.PLANT,
            "price": 450_000,
            "stock_quantity": 8,
            "sale_unit": Product.SaleUnit.POT,
            "unit_size": 1,
            "minimum_order_quantity": 1,
            "is_active": True,
        }
        values.update(overrides)
        product = Product.objects.create(**values)
        detail_values = {
            "plant_type": "پتوس",
            "color": "سبز",
            "plant_size": PlantDetails.PlantSize.MEDIUM,
            "approximate_height_cm": 45,
            "quality_grade": PlantDetails.QualityGrade.PREMIUM,
            "pet_friendly": False,
            "pot_included": True,
            "pot_material": "سرامیک",
            "pot_color": "سفید",
            "has_drainage": True,
            "light_requirement": PlantDetails.LightRequirement.INDIRECT,
            "watering_requirement": PlantDetails.WateringRequirement.MEDIUM,
            "care_difficulty": PlantDetails.CareDifficulty.EASY,
        }
        detail_values.update(detail_overrides)
        PlantDetails.objects.create(product=product, **detail_values)
        return product

    def make_cut_flower(self, **overrides):
        detail_overrides = overrides.pop("details", {})
        sequence = Product.objects.count() + 1
        values = {
            "category": self.flower_category,
            "name": f"رز هلندی {sequence}",
            "slug": f"rose-{sequence}",
            "product_type": Product.ProductType.CUT_FLOWER,
            "price": 85_000,
            "stock_quantity": 50,
            "sale_unit": Product.SaleUnit.STEM,
            "unit_size": 1,
            "minimum_order_quantity": 1,
            "is_active": True,
        }
        values.update(overrides)
        product = Product.objects.create(**values)
        detail_values = {
            "flower_type": "رز",
            "variety": "هلندی",
            "color": "قرمز",
            "stem_length_cm": 70,
            "flower_grade": CutFlowerDetails.FlowerGrade.PREMIUM,
            "vase_life_days": 8,
            "fragrance_level": CutFlowerDetails.FragranceLevel.LIGHT,
            "seasonal_availability": CutFlowerDetails.SeasonalAvailability.YEAR_ROUND,
        }
        detail_values.update(detail_overrides)
        CutFlowerDetails.objects.create(product=product, **detail_values)
        return product

    def results(self, response):
        return response.data["results"]

    def related_url(self, product):
        return reverse("products:product-related-list", kwargs={"slug": product.slug})

    def test_subtype_payloads_are_discriminated_and_image_contract_is_preserved(self):
        plant = self.make_plant(cover_image="golden-pothos.webp")
        flower = self.make_cut_flower()
        ProductImage.objects.create(product=plant, image="plant-detail.jpg")

        list_response = self.client.get(reverse("products:product-list"))
        plant_payload = next(item for item in self.results(list_response) if item["id"] == plant.id)
        flower_payload = next(item for item in self.results(list_response) if item["id"] == flower.id)
        detail_response = self.client.get(
            reverse("products:product-detail", kwargs={"slug": plant.slug})
        )

        self.assertEqual(plant_payload["product_type"], "plant")
        self.assertEqual(plant_payload["details"]["plant_type"], "پتوس")
        self.assertNotIn("flower_type", plant_payload["details"])
        self.assertEqual(flower_payload["details"]["flower_type"], "رز")
        self.assertNotIn("plant_type", flower_payload["details"])
        self.assertEqual(plant_payload["cover_image"], "golden-pothos.webp")
        self.assertEqual(detail_response.data["cover_image"], "golden-pothos.webp")
        self.assertEqual(detail_response.data["images"][0]["image"], "plant-detail.jpg")

    def test_missing_or_inconsistent_details_are_returned_as_null(self):
        product = Product.objects.create(
            category=self.plant_category,
            name="بدون مشخصات",
            slug="missing-details",
            product_type=Product.ProductType.PLANT,
            price=100,
        )

        response = self.client.get(
            reverse("products:product-detail", kwargs={"slug": product.slug})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data["details"])

    def test_common_filters_and_ordering(self):
        cheap = self.make_plant(price=100, stock_quantity=2)
        self.make_cut_flower(price=500, stock_quantity=0)

        response = self.client.get(
            reverse("products:product-list"),
            {"product_type": "plant", "min_price": 50, "max_price": 200, "in_stock": "true", "sale_unit": "pot", "ordering": "price"},
        )

        self.assertEqual([item["slug"] for item in self.results(response)], [cheap.slug])

    def test_is_featured_filter_excludes_non_featured_and_hidden_products(self):
        first = self.make_plant(is_featured=True, featured_order=20)
        second = self.make_cut_flower(is_featured=True, featured_order=10)
        self.make_plant(is_featured=False, featured_order=0)
        self.make_plant(is_featured=True, featured_order=5, is_active=False)
        self.make_cut_flower(
            is_featured=True,
            featured_order=1,
            category=self.inactive_category,
        )

        response = self.client.get(
            reverse("products:product-list"),
            {"is_featured": "true", "ordering": "featured"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [item["id"] for item in self.results(response)],
            [second.id, first.id],
        )

    def test_featured_order_uses_id_as_a_deterministic_tiebreaker(self):
        first = self.make_plant(is_featured=True, featured_order=7)
        second = self.make_cut_flower(is_featured=True, featured_order=7)

        response = self.client.get(
            reverse("products:product-list"),
            {"is_featured": "true", "ordering": "featured"},
        )

        self.assertEqual(
            [item["id"] for item in self.results(response)],
            [first.id, second.id],
        )

    def test_featured_filter_combines_with_existing_filters(self):
        matching = self.make_plant(
            is_featured=True,
            details={"plant_size": PlantDetails.PlantSize.MEDIUM},
        )
        self.make_plant(
            is_featured=False,
            details={"plant_size": PlantDetails.PlantSize.MEDIUM},
        )
        self.make_cut_flower(is_featured=True)

        response = self.client.get(
            reverse("products:product-list"),
            {
                "is_featured": "true",
                "product_type": "plant",
                "plant_size": "medium",
            },
        )

        self.assertEqual(
            [item["id"] for item in self.results(response)],
            [matching.id],
        )

    def test_legacy_featured_filter_remains_supported(self):
        featured = self.make_plant(is_featured=True)
        self.make_plant(is_featured=False)

        response = self.client.get(
            reverse("products:product-list"),
            {"featured": "true"},
        )

        self.assertEqual(
            [item["id"] for item in self.results(response)],
            [featured.id],
        )

    def test_existing_ordering_values_remain_unchanged(self):
        first = self.make_plant(name="Alpha", price=300)
        second = self.make_cut_flower(name="Beta", price=100)
        now = timezone.now()
        Product.objects.filter(pk=first.pk).update(created_at=now - timedelta(days=1))
        Product.objects.filter(pk=second.pk).update(created_at=now)

        expected_ids = {
            "newest": [second.id, first.id],
            "price": [second.id, first.id],
            "-price": [first.id, second.id],
            "name": [first.id, second.id],
            "-name": [second.id, first.id],
        }
        for ordering, expected in expected_ids.items():
            with self.subTest(ordering=ordering):
                response = self.client.get(
                    reverse("products:product-list"),
                    {"ordering": ordering},
                )
                self.assertEqual(
                    [item["id"] for item in self.results(response)],
                    expected,
                )

    def test_plant_filters_can_be_combined(self):
        matching = self.make_plant()
        self.make_plant(
            details={
                "plant_size": PlantDetails.PlantSize.LARGE,
                "approximate_height_cm": 90,
                "pet_friendly": True,
            }
        )

        response = self.client.get(
            reverse("products:product-list"),
            {
                "plant_size": "medium",
                "min_height": 40,
                "max_height": 60,
                "quality_grade": "premium",
                "pet_friendly": "false",
                "pot_included": "true",
                "pot_material": "سرامیک",
                "has_drainage": "true",
                "light_requirement": "indirect",
                "watering_requirement": "medium",
                "care_difficulty": "easy",
            },
        )

        self.assertEqual([item["slug"] for item in self.results(response)], [matching.slug])

    def test_cut_flower_filters_can_be_combined(self):
        matching = self.make_cut_flower()
        self.make_cut_flower(details={"flower_type": "لیلیوم", "stem_length_cm": 40})

        response = self.client.get(
            reverse("products:product-list"),
            {
                "flower_type": "رز",
                "variety": "هلندی",
                "color": "قرمز",
                "min_stem_length": 60,
                "max_stem_length": 80,
                "flower_grade": "premium",
                "min_vase_life": 7,
                "fragrance_level": "light",
                "seasonal_availability": "year_round",
            },
        )

        self.assertEqual([item["slug"] for item in self.results(response)], [matching.slug])

    def test_search_includes_shared_and_subtype_fields(self):
        plant = self.make_plant(details={"plant_type": "زاموفیلیا"})
        self.make_cut_flower()
        response = self.client.get(reverse("products:product-list"), {"search": "زاموفیلیا"})
        self.assertEqual([item["slug"] for item in self.results(response)], [plant.slug])

    def test_invalid_ranges_booleans_choices_and_ordering_return_400(self):
        invalid_queries = (
            {"min_price": 20, "max_price": 10},
            {"in_stock": "sometimes"},
            {"product_type": "bouquet"},
            {"ordering": "popularity"},
            {"min_stem_length": 80, "max_stem_length": 40},
        )
        for query in invalid_queries:
            with self.subTest(query=query):
                response = self.client.get(reverse("products:product-list"), query)
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_inactive_products_and_categories_are_excluded(self):
        self.make_plant(is_active=False)
        self.make_cut_flower(category=self.inactive_category)
        response = self.client.get(reverse("products:product-list"))
        self.assertEqual(self.results(response), [])

    def test_list_and_detail_queries_are_optimized(self):
        product = self.make_plant()
        ProductImage.objects.create(product=product, image="one.jpg")
        with self.assertNumQueries(2):
            list_response = self.client.get(reverse("products:product-list"))
        with self.assertNumQueries(2):
            detail_response = self.client.get(
                reverse("products:product-detail", kwargs={"slug": product.slug})
            )
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)

    def test_related_products_match_category_without_requiring_matching_type(self):
        current = self.make_plant()
        plant = self.make_plant()
        flower = self.make_cut_flower(category=current.category)
        self.make_plant(category=self.flower_category)

        response = self.client.get(self.related_url(current))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertCountEqual([item["id"] for item in response.data], [plant.id, flower.id])
        self.assertTrue(all(item["category"]["id"] == current.category_id for item in response.data))

    def test_related_products_exclude_current_product(self):
        current = self.make_plant()
        related = self.make_plant()

        response = self.client.get(self.related_url(current))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item["id"] for item in response.data], [related.id])

    def test_related_products_exclude_inactive_products(self):
        current = self.make_plant()
        visible = self.make_plant()
        self.make_plant(is_active=False)
        self.make_plant(category=self.inactive_category)

        response = self.client.get(self.related_url(current))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item["id"] for item in response.data], [visible.id])

    def test_related_products_include_out_of_stock_current_and_related_products(self):
        current = self.make_plant(stock_quantity=0)
        related = self.make_plant(stock_quantity=0)

        response = self.client.get(self.related_url(current))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item["id"] for item in response.data], [related.id])
        self.assertFalse(response.data[0]["is_in_stock"])

    def test_related_products_unknown_current_product_returns_detail_404(self):
        kwargs = {"slug": "missing-product"}

        response = self.client.get(reverse("products:product-related-list", kwargs=kwargs))
        detail_response = self.client.get(reverse("products:product-detail", kwargs=kwargs))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data, detail_response.data)

    def test_related_products_inactive_current_product_returns_detail_404(self):
        current = self.make_plant(is_active=False)
        self.make_plant()

        response = self.client.get(self.related_url(current))
        detail_response = self.client.get(
            reverse("products:product-detail", kwargs={"slug": current.slug})
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data, detail_response.data)

    def test_related_products_current_product_in_inactive_category_returns_detail_404(self):
        current = self.make_plant(category=self.inactive_category)
        self.make_plant(category=self.inactive_category)

        response = self.client.get(self.related_url(current))
        detail_response = self.client.get(
            reverse("products:product-detail", kwargs={"slug": current.slug})
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data, detail_response.data)

    def test_related_products_limit_and_ordering_are_stable_even_at_timestamp_ties(self):
        current = self.make_plant()
        products = [self.make_plant() for _ in range(10)]
        now = timezone.now()
        Product.objects.filter(pk__in=[product.pk for product in products]).update(created_at=now)
        # Give the highest ID an older timestamp to verify timestamp takes priority.
        Product.objects.filter(pk=products[-1].pk).update(created_at=now - timedelta(days=1))
        expected_ids = [product.id for product in reversed(products[1:-1])]

        for _ in range(2):
            response = self.client.get(self.related_url(current))

            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(len(response.data), 8)
            self.assertEqual([item["id"] for item in response.data], expected_ids)

    def test_related_products_ignore_pagination_and_catalog_filter_parameters(self):
        current = self.make_plant()
        for _ in range(10):
            self.make_plant(stock_quantity=0)
        expected = self.client.get(self.related_url(current))

        response = self.client.get(
            self.related_url(current),
            {
                "page": 2,
                "page_size": 100,
                "limit": 100,
                "category": self.flower_category.slug,
                "in_stock": "true",
                "ordering": "price",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 8)
        self.assertEqual(response.data, expected.data)

    def test_related_products_empty_set_returns_successful_empty_array(self):
        current = self.make_plant()
        self.make_cut_flower()
        self.make_plant(is_active=False)

        response = self.client.get(self.related_url(current))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), [])

    def test_related_products_use_existing_catalog_representation(self):
        current = self.make_plant()
        self.make_plant(cover_image="golden-pothos.webp")
        self.make_cut_flower(category=current.category, cover_upload="products/covers/rose.webp")
        self.make_plant().plant_details.delete()
        catalog_response = self.client.get(reverse("products:product-list"))
        catalog_by_id = {item["id"]: item for item in self.results(catalog_response)}

        response = self.client.get(self.related_url(current))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        for item in response.data:
            with self.subTest(product=item["id"]):
                self.assertEqual(item, catalog_by_id[item["id"]])
                self.assertTrue({"category", "details", "cover_image", "price"}.issubset(item))
                self.assertTrue(
                    {"is_active", "featured_order", "cover_upload", "description", "images"}
                    .isdisjoint(item)
                )

    def test_related_products_load_category_and_both_detail_types_in_two_queries(self):
        current = self.make_plant()
        self.make_plant()

        with self.assertNumQueries(2):
            response = self.client.get(self.related_url(current))
        self.assertEqual(len(response.data), 1)

        for index in range(7):
            factory = self.make_plant if index % 2 else self.make_cut_flower
            factory(category=current.category)

        with self.assertNumQueries(2):
            response = self.client.get(self.related_url(current))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 8)
        self.assertTrue(all(item["details"] is not None for item in response.data))

    def test_related_products_endpoint_is_read_only(self):
        current = self.make_plant()

        response = self.client.post(self.related_url(current), {})

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_schema_documents_polymorphic_details_and_filters(self):
        response = self.client.get(reverse("schema"), HTTP_ACCEPT="application/vnd.oai.openapi+json")
        schema = json.loads(response.content)
        path = schema["paths"][reverse("products:product-list")]["get"]
        parameters = {parameter["name"] for parameter in path["parameters"]}
        self.assertTrue({"product_type", "min_price", "plant_size", "flower_type"}.issubset(parameters))
        self.assertIn("ProductDetails", schema["components"]["schemas"])

        related_path = schema["paths"]["/api/products/{slug}/related/"]["get"]
        related_schema = related_path["responses"]["200"]["content"]["application/json"]["schema"]
        self.assertEqual(related_schema["type"], "array")
        self.assertEqual(
            related_schema["items"]["$ref"], "#/components/schemas/ProductList"
        )
        self.assertEqual({parameter["name"] for parameter in related_path["parameters"]}, {"slug"})

        ordering_parameter = next(
            parameter
            for parameter in path["parameters"]
            if parameter["name"] == "ordering"
        )
        ordering_schema = ordering_parameter["schema"]
        if "$ref" in ordering_schema:
            ordering_schema = schema["components"]["schemas"][
                ordering_schema["$ref"].rsplit("/", 1)[-1]
            ]
        self.assertEqual(
            set(ordering_schema["enum"]),
            {"newest", "price", "-price", "name", "-name", "featured"},
        )
