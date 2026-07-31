import json
from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from products.models import Category, Product, ProductImage


class CatalogAPITests(APITestCase):
    def setUp(self) -> None:
        self.active_category = Category.objects.create(
            name="گل تازه",
            slug="fresh-flowers",
            sort_order=1,
        )
        self.inactive_category = Category.objects.create(
            name="غیرفعال",
            slug="inactive-flowers",
            is_active=False,
        )

    def make_product(self, **overrides) -> Product:
        sequence = Product.objects.count() + 1
        values = {
            "category": self.active_category,
            "name": f"داوودی سفید {sequence}",
            "slug": f"white-chrysanthemum-{sequence}",
            "flower_type": "داوودی",
            "color": "سفید",
            "short_description": "گل تازه شاخه‌بریده",
            "description": "توضیحات کامل محصول",
            "stems_per_bundle": 20,
            "price_per_bundle": 250_000,
            "stock_bundles": 10,
            "minimum_order_bundles": 1,
            "is_active": True,
            "is_featured": False,
        }
        values.update(overrides)
        return Product.objects.create(**values)

    def product_results(self, response):
        return response.data["results"]

    def test_categories_endpoint_returns_only_active_categories(self):
        response = self.client.get(reverse("products:category-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_slugs = {item["slug"] for item in response.data}
        self.assertIn("fresh-flowers", returned_slugs)
        self.assertIn("cut-flowers", returned_slugs)
        self.assertNotIn("inactive-flowers", returned_slugs)

    def test_product_list_returns_active_products(self):
        product = self.make_product(cover_image="dawoodi-white.jpg")

        response = self.client.get(reverse("products:product-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [item["slug"] for item in self.product_results(response)],
            [product.slug],
        )
        self.assertEqual(
            self.product_results(response)[0]["cover_image"],
            "dawoodi-white.jpg",
        )

    def test_inactive_products_are_excluded(self):
        self.make_product(is_active=False)

        response = self.client.get(reverse("products:product-list"))

        self.assertEqual(self.product_results(response), [])

    def test_products_from_inactive_categories_are_excluded(self):
        self.make_product(category=self.inactive_category)

        response = self.client.get(reverse("products:product-list"))

        self.assertEqual(self.product_results(response), [])

    def test_product_detail_works_by_slug(self):
        product = self.make_product()

        response = self.client.get(
            reverse(
                "products:product-detail",
                kwargs={"slug": product.slug},
            ),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["slug"], product.slug)
        self.assertEqual(response.data["category"]["slug"], "fresh-flowers")
        self.assertIn("description", response.data)
        self.assertIn("created_at", response.data)

    def test_inactive_product_detail_returns_not_found(self):
        product = self.make_product(is_active=False)

        response = self.client.get(
            reverse(
                "products:product-detail",
                kwargs={"slug": product.slug},
            ),
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_product_in_inactive_category_detail_returns_not_found(self):
        product = self.make_product(category=self.inactive_category)

        response = self.client.get(
            reverse(
                "products:product-detail",
                kwargs={"slug": product.slug},
            ),
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_missing_product_returns_not_found(self):
        response = self.client.get(
            reverse(
                "products:product-detail",
                kwargs={"slug": "missing-product"},
            ),
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_category_filter_works(self):
        other_category = Category.objects.create(
            name="دسته دیگر",
            slug="other-category",
        )
        matching = self.make_product()
        self.make_product(category=other_category)

        response = self.client.get(
            reverse("products:product-list"),
            {"category": self.active_category.slug},
        )

        self.assertEqual(
            [item["slug"] for item in self.product_results(response)],
            [matching.slug],
        )

    def test_search_by_product_name_works(self):
        matching = self.make_product(name="رز هلندی ویژه")
        self.make_product(name="لیلیوم سفید")

        response = self.client.get(
            reverse("products:product-list"),
            {"search": "هلندی"},
        )

        self.assertEqual(
            [item["slug"] for item in self.product_results(response)],
            [matching.slug],
        )

    def test_search_by_flower_type_works(self):
        matching = self.make_product(flower_type="لیلیوم")
        self.make_product(flower_type="رز")

        response = self.client.get(
            reverse("products:product-list"),
            {"search": "لیلیوم"},
        )

        self.assertEqual(
            [item["slug"] for item in self.product_results(response)],
            [matching.slug],
        )

    def test_featured_filter_works(self):
        matching = self.make_product(is_featured=True)
        self.make_product(is_featured=False)

        response = self.client.get(
            reverse("products:product-list"),
            {"featured": "true"},
        )

        self.assertEqual(
            [item["slug"] for item in self.product_results(response)],
            [matching.slug],
        )

    def test_ordering_by_price_works(self):
        expensive = self.make_product(price_per_bundle=400_000)
        cheap = self.make_product(price_per_bundle=100_000)

        ascending = self.client.get(
            reverse("products:product-list"),
            {"ordering": "price"},
        )
        descending = self.client.get(
            reverse("products:product-list"),
            {"ordering": "-price"},
        )

        self.assertEqual(
            [item["slug"] for item in self.product_results(ascending)],
            [cheap.slug, expensive.slug],
        )
        self.assertEqual(
            [item["slug"] for item in self.product_results(descending)],
            [expensive.slug, cheap.slug],
        )

    def test_ordering_by_newest_works(self):
        older = self.make_product()
        Product.objects.filter(pk=older.pk).update(
            created_at=timezone.now() - timedelta(days=1),
        )
        newer = self.make_product()

        response = self.client.get(
            reverse("products:product-list"),
            {"ordering": "newest"},
        )

        self.assertEqual(
            [item["slug"] for item in self.product_results(response)],
            [newer.slug, older.slug],
        )

    def test_product_list_uses_page_number_pagination(self):
        for index in range(21):
            self.make_product(
                name=f"محصول {index}",
                slug=f"paginated-product-{index}",
            )

        response = self.client.get(reverse("products:product-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 21)
        self.assertEqual(len(response.data["results"]), 20)
        self.assertIsNotNone(response.data["next"])

    def test_product_list_avoids_category_n_plus_one_queries(self):
        for index in range(3):
            self.make_product(
                name=f"محصول بهینه {index}",
                slug=f"optimized-product-{index}",
            )

        with self.assertNumQueries(2):
            response = self.client.get(reverse("products:product-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 3)

    def test_product_images_appear_in_detail_response(self):
        product = self.make_product()
        image = ProductImage.objects.create(
            product=product,
            image="products/gallery/detail.jpg",
            alt_text="نمای نزدیک گل",
            sort_order=1,
        )

        response = self.client.get(
            reverse(
                "products:product-detail",
                kwargs={"slug": product.slug},
            ),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["images"][0]["id"], image.id)
        self.assertEqual(
            response.data["images"][0]["image"],
            "products/gallery/detail.jpg",
        )
        self.assertEqual(
            response.data["images"][0]["alt_text"],
            "نمای نزدیک گل",
        )

    def test_product_detail_prefetches_images(self):
        product = self.make_product()
        for index in range(3):
            ProductImage.objects.create(
                product=product,
                image=f"products/gallery/detail-{index}.jpg",
                sort_order=index,
            )

        with self.assertNumQueries(2):
            response = self.client.get(
                reverse(
                    "products:product-detail",
                    kwargs={"slug": product.slug},
                ),
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["images"]), 3)

    def test_catalog_endpoints_are_public(self):
        product = self.make_product()

        categories = self.client.get(reverse("products:category-list"))
        products = self.client.get(reverse("products:product-list"))
        detail = self.client.get(
            reverse(
                "products:product-detail",
                kwargs={"slug": product.slug},
            ),
        )

        self.assertEqual(categories.status_code, status.HTTP_200_OK)
        self.assertEqual(products.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.status_code, status.HTTP_200_OK)

    def test_catalog_request_does_not_break_authenticated_session(self):
        user = User.objects.create_user(
            phone="09123456789",
            full_name="کاربر آزمایشی",
        )
        self.client.force_login(user)

        catalog_response = self.client.get(
            reverse("products:product-list"),
        )
        me_response = self.client.get(reverse("accounts:me"))

        self.assertEqual(catalog_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data["user"]["id"], user.id)

    def test_schema_documents_catalog_and_filters(self):
        response = self.client.get(
            reverse("schema"),
            HTTP_ACCEPT="application/vnd.oai.openapi+json",
        )
        schema = json.loads(response.content)
        list_path = reverse("products:product-list")
        detail_path = "/api/products/{slug}/"

        self.assertIn(reverse("products:category-list"), schema["paths"])
        self.assertIn(list_path, schema["paths"])
        self.assertIn(detail_path, schema["paths"])
        self.assertEqual(
            schema["paths"][reverse("products:category-list")]["get"][
                "security"
            ],
            [{}],
        )
        self.assertEqual(
            schema["paths"][list_path]["get"]["security"],
            [{}],
        )
        self.assertEqual(
            schema["paths"][detail_path]["get"]["security"],
            [{}],
        )

        parameter_names = {
            parameter["name"]
            for parameter in schema["paths"][list_path]["get"]["parameters"]
        }
        self.assertTrue(
            {
                "category",
                "search",
                "featured",
                "ordering",
                "page",
                "page_size",
            }.issubset(parameter_names),
        )
        detail_parameters = schema["paths"][detail_path]["get"][
            "parameters"
        ]
        self.assertIn(
            "slug",
            {parameter["name"] for parameter in detail_parameters},
        )
