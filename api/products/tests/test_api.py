import json

from django.urls import reverse
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

    def test_schema_documents_polymorphic_details_and_filters(self):
        response = self.client.get(reverse("schema"), HTTP_ACCEPT="application/vnd.oai.openapi+json")
        schema = json.loads(response.content)
        path = schema["paths"][reverse("products:product-list")]["get"]
        parameters = {parameter["name"] for parameter in path["parameters"]}
        self.assertTrue({"product_type", "min_price", "plant_size", "flower_type"}.issubset(parameters))
        self.assertIn("ProductDetails", schema["components"]["schemas"])
