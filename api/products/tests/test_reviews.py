from datetime import timedelta
from io import StringIO

from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.db import IntegrityError, transaction
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from products.models import Category, Product, ProductReview


class ProductReviewTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="دسته دیدگاه", slug="review-category")
        self.product = self.make_product("reviewed-plant")
        self.other_product = self.make_product("other-plant")

    def make_product(self, slug, **overrides):
        values = {
            "category": self.category,
            "name": slug,
            "slug": slug,
            "product_type": Product.ProductType.PLANT,
            "price": 100_000,
        }
        values.update(overrides)
        return Product.objects.create(**values)

    def make_review(self, product=None, **overrides):
        values = {
            "product": product or self.product,
            "reviewer_name": "سارا محمدی",
            "rating": 5,
            "comment": "بسته‌بندی عالی بود و گیاه سالم رسید.",
            "is_approved": True,
        }
        values.update(overrides)
        return ProductReview.objects.create(**values)

    def review_url(self, product=None):
        return reverse(
            "products:product-review-list",
            kwargs={"slug": (product or self.product).slug},
        )

    def detail_url(self, product=None):
        return reverse(
            "products:product-detail",
            kwargs={"slug": (product or self.product).slug},
        )

    def test_rating_validation_rejects_values_outside_one_to_five(self):
        for rating in (0, 6):
            with self.subTest(rating=rating):
                review = ProductReview(
                    product=self.product,
                    reviewer_name="علی رضایی",
                    rating=rating,
                    comment="دیدگاه آزمایشی",
                )
                with self.assertRaises(ValidationError) as error:
                    review.full_clean()
                self.assertIn("rating", error.exception.message_dict)

        with self.assertRaises(IntegrityError), transaction.atomic():
            self.make_review(rating=6)

    def test_anonymous_reviewer_name_is_required(self):
        review = ProductReview(
            product=self.product,
            rating=4,
            comment="دیدگاه آزمایشی",
        )

        with self.assertRaises(ValidationError) as error:
            review.full_clean()

        self.assertIn("reviewer_name", error.exception.message_dict)

    def test_reviews_endpoint_filters_product_and_approval_and_orders_newest(self):
        older = self.make_review(reviewer_name="قدیمی")
        newer = self.make_review(reviewer_name="جدید", rating=4)
        hidden = self.make_review(is_approved=False, rating=1)
        other = self.make_review(product=self.other_product)
        now = timezone.now()
        ProductReview.objects.filter(pk=older.pk).update(created_at=now - timedelta(days=3))
        ProductReview.objects.filter(pk=newer.pk).update(created_at=now - timedelta(days=1))

        response = self.client.get(self.review_url())

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
        self.assertEqual(
            [item["id"] for item in response.data["results"]],
            [newer.id, older.id],
        )
        self.assertNotIn(hidden.id, [item["id"] for item in response.data["results"]])
        self.assertNotIn(other.id, [item["id"] for item in response.data["results"]])
        self.assertEqual(
            set(response.data["results"][0]),
            {"id", "reviewer_name", "rating", "comment", "created_at", "updated_at"},
        )

    def test_reviews_endpoint_is_read_only_and_missing_or_inactive_product_is_404(self):
        self.assertEqual(self.client.post(self.review_url()).status_code, 405)
        self.assertEqual(
            self.client.get(
                reverse("products:product-review-list", kwargs={"slug": "missing-product"})
            ).status_code,
            404,
        )
        self.product.is_active = False
        self.product.save(update_fields=["is_active"])
        self.assertEqual(self.client.get(self.review_url()).status_code, 404)

    def test_detail_rating_uses_only_approved_reviews_and_keeps_two_queries(self):
        self.make_review(rating=5)
        self.make_review(rating=4)
        self.make_review(rating=1, is_approved=False)
        self.make_review(product=self.other_product, rating=1)

        with self.assertNumQueries(2):
            response = self.client.get(self.detail_url())

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["rating_average"], 4.5)
        self.assertEqual(response.data["review_count"], 2)
        self.assertNotIn(
            "rating_average",
            self.client.get(reverse("products:product-list")).data["results"][0],
        )

    def test_detail_without_approved_reviews_returns_null_average_and_zero_count(self):
        self.make_review(rating=1, is_approved=False)

        response = self.client.get(self.detail_url())

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data["rating_average"])
        self.assertEqual(response.data["review_count"], 0)

    def test_detail_with_no_reviews_returns_null_average_and_zero_count(self):
        response = self.client.get(self.detail_url())

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data["rating_average"])
        self.assertEqual(response.data["review_count"], 0)
        self.assertEqual(self.client.get(self.review_url()).data["count"], 0)

    def test_reviews_endpoint_uses_catalog_page_number_pagination(self):
        for index in range(3):
            self.make_review(reviewer_name=f"نویسنده {index}")

        response = self.client.get(self.review_url(), {"page_size": 2, "page": 2})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 3)
        self.assertEqual(len(response.data["results"]), 1)

    def test_deleting_product_cascades_to_reviews(self):
        review = self.make_review()

        self.product.delete()

        self.assertFalse(ProductReview.objects.filter(pk=review.pk).exists())

    def test_seed_command_is_idempotent_and_covers_every_existing_product(self):
        self.make_product("reviewed-flower", product_type=Product.ProductType.CUT_FLOWER)
        manual = self.make_review(is_approved=False)
        product_ids = list(Product.objects.values_list("id", flat=True))
        output = StringIO()

        call_command("seed_product_reviews", stdout=output)
        first_count = ProductReview.objects.filter(demo_key__isnull=False).count()

        self.assertEqual(first_count, len(product_ids) * 3)
        for product_id in product_ids:
            self.assertEqual(
                ProductReview.objects.filter(
                    product_id=product_id,
                    demo_key__isnull=False,
                    is_approved=True,
                    user__isnull=True,
                ).count(),
                3,
            )
        self.assertGreater(
            ProductReview.objects.filter(demo_key__isnull=False)
            .values("comment")
            .distinct()
            .count(),
            3,
        )
        self.assertEqual(
            ProductReview.objects.filter(demo_key__isnull=False)
            .values("created_at")
            .distinct()
            .count(),
            first_count,
        )

        call_command("seed_product_reviews", stdout=output)

        self.assertEqual(ProductReview.objects.filter(demo_key__isnull=False).count(), first_count)
        manual.refresh_from_db()
        self.assertFalse(manual.is_approved)
        self.assertIn("reviews created=0", output.getvalue())
        self.assertIn(f"reviews skipped/already existing={first_count}", output.getvalue())
