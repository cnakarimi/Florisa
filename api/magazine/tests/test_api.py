from datetime import timedelta
from unittest.mock import patch

from django.conf import settings
from django.db import connection
from django.test import override_settings
from django.test.utils import CaptureQueriesContext
from django.urls import reverse
from django.utils import timezone
from drf_spectacular.generators import SchemaGenerator
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory, APITestCase

from magazine.models import ArticleProduct, ArticleRelation, MagazineCategory
from magazine.pagination import ArticlePagination
from magazine.tests.helpers import make_article, make_product
from products.models import Category


class MagazineAPITests(APITestCase):
    def setUp(self):
        self.categories_url = reverse("magazine:category-list")
        self.list_url = reverse("magazine:article-list")

    def detail_url(self, article):
        return reverse("magazine:article-detail", kwargs={"slug": article.slug})

    def test_active_categories_are_public_and_ordered_by_sort_order_then_id(self):
        last = MagazineCategory.objects.create(name="آخر", slug="last", sort_order=2)
        first = MagazineCategory.objects.create(name="اول", slug="first", sort_order=1)
        second = MagazineCategory.objects.create(name="دوم", slug="second", sort_order=1)
        MagazineCategory.objects.create(name="مخفی", slug="hidden", is_active=False)
        response = self.client.get(self.categories_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.data], [first.id, second.id, last.id])
        self.assertEqual(
            set(response.data[0]), {"id", "name", "slug", "description", "sort_order"},
        )

    def test_empty_lists(self):
        self.assertEqual(self.client.get(self.categories_url).data, [])
        self.assertEqual(
            self.client.get(self.list_url).data,
            {"count": 0, "next": None, "previous": None, "results": []},
        )

    def test_only_published_articles_in_active_categories_are_public(self):
        public = make_article()
        hidden_category = MagazineCategory.objects.create(
            name="مخفی", slug="hidden", is_active=False,
        )
        make_article(is_published=False)
        make_article(is_published=False, published_at=None)
        make_article(published_at=timezone.now() + timedelta(days=1))
        make_article(category=hidden_category)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual([item["id"] for item in response.data["results"]], [public.id])

    def test_newest_publication_first_with_deterministic_ties(self):
        date = timezone.now() - timedelta(days=1)
        older = make_article(published_at=date - timedelta(days=1))
        same_date_first = make_article(published_at=date)
        same_date_second = make_article(published_at=date)
        response = self.client.get(self.list_url)
        self.assertEqual(
            [item["id"] for item in response.data["results"]],
            [same_date_second.id, same_date_first.id, older.id],
        )

    def test_category_filter(self):
        wanted = make_article()
        other_category = MagazineCategory.objects.create(name="گل", slug="flowers")
        make_article(category=other_category)
        response = self.client.get(self.list_url, {"category": wanted.category.slug})
        self.assertEqual([item["id"] for item in response.data["results"]], [wanted.id])
        self.assertEqual(self.client.get(self.list_url, {"category": "missing"}).data["count"], 0)

    def test_featured_true_false_and_omitted(self):
        featured = make_article(is_featured=True)
        regular = make_article(is_featured=False)
        for query, expected in (
            ({"featured": "true"}, {featured.id}),
            ({"featured": "false"}, {regular.id}),
            ({}, {featured.id, regular.id}),
        ):
            with self.subTest(query=query):
                response = self.client.get(self.list_url, query)
                self.assertEqual(response.status_code, 200)
                self.assertEqual({item["id"] for item in response.data["results"]}, expected)

    def test_combined_filters_cannot_bypass_publishing_rules(self):
        wanted = make_article(is_featured=True)
        make_article(is_featured=True, is_published=False)
        make_article(is_featured=True, published_at=timezone.now() + timedelta(days=1))
        inactive = MagazineCategory.objects.create(name="مخفی", slug="hidden", is_active=False)
        make_article(category=inactive, is_featured=True)
        query = {"category": wanted.category.slug, "featured": "true", "is_published": "false"}
        response = self.client.get(self.list_url, query)
        self.assertEqual([item["id"] for item in response.data["results"]], [wanted.id])
        response = self.client.get(self.list_url, {"category": "hidden", "featured": "true"})
        self.assertEqual(response.data["count"], 0)

    def test_malformed_filters_return_400(self):
        for query in ({"featured": "maybe"}, {"category": "invalid/slug"}, {"category": ""}):
            with self.subTest(query=query):
                self.assertEqual(self.client.get(self.list_url, query).status_code, 400)

    def test_list_contains_card_fields_without_content_or_admin_data(self):
        article = make_article()
        with CaptureQueriesContext(connection) as queries:
            response = self.client.get(self.list_url)
        item = response.data["results"][0]
        self.assertEqual(
            set(item),
            {"id", "title", "slug", "excerpt", "cover_image", "category",
             "published_at", "reading_time", "is_featured"},
        )
        self.assertEqual(
            item["category"],
            {"id": article.category_id, "name": article.category.name, "slug": article.category.slug},
        )
        self.assertIsNone(item["cover_image"])
        self.assertTrue(all('"content"' not in query["sql"] for query in queries))

    def test_detail_resolves_by_slug_with_content_and_empty_relationships(self):
        article = make_article(slug="why-leaves-turn-yellow")
        response = self.client.get(self.detail_url(article))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], article.id)
        self.assertEqual(response.data["content"], article.content)
        self.assertEqual(response.data["related_products"], [])
        self.assertEqual(response.data["related_articles"], [])
        self.assertNotIn("is_published", response.data)
        self.assertNotIn("created_at", response.data)

    def test_nonpublic_and_missing_details_return_404(self):
        inactive = MagazineCategory.objects.create(name="مخفی", slug="hidden", is_active=False)
        articles = (
            make_article(is_published=False),
            make_article(is_published=False, published_at=None),
            make_article(published_at=timezone.now() + timedelta(days=1)),
            make_article(category=inactive),
        )
        for article in articles:
            with self.subTest(article=article.slug):
                self.assertEqual(self.client.get(self.detail_url(article)).status_code, 404)
        self.assertEqual(self.client.get(self.list_url + "does-not-exist/").status_code, 404)

    def test_scheduled_article_becomes_public_at_the_publication_time(self):
        release = timezone.now() + timedelta(hours=1)
        article = make_article(published_at=release)
        with patch("magazine.models.timezone.now", return_value=release - timedelta(seconds=1)):
            self.assertEqual(self.client.get(self.list_url).data["count"], 0)
            self.assertEqual(self.client.get(self.detail_url(article)).status_code, 404)
        with patch("magazine.models.timezone.now", return_value=release):
            self.assertEqual(self.client.get(self.list_url).data["count"], 1)
            self.assertEqual(self.client.get(self.detail_url(article)).status_code, 200)

    def test_related_products_are_ordered_and_use_current_catalog_card_data(self):
        article = make_article()
        late, first, tied = make_product(), make_product(), make_product(stock_quantity=0)
        ArticleProduct.objects.create(article=article, product=late, sort_order=9)
        ArticleProduct.objects.create(article=article, product=first, sort_order=1)
        ArticleProduct.objects.create(article=article, product=tied, sort_order=1)
        first.price = 500_000
        first.save(update_fields=("price",))
        payload = self.client.get(self.detail_url(article)).data["related_products"]
        self.assertEqual([item["id"] for item in payload], [first.id, tied.id, late.id])
        self.assertEqual(payload[0]["price"], 500_000)
        self.assertEqual(payload[0]["cover_image"], "golden-pothos.webp")
        self.assertTrue(payload[0]["is_in_stock"])
        self.assertFalse(payload[1]["is_in_stock"])
        self.assertNotIn("details", payload[0])
        self.assertNotIn("description", payload[0])

    def test_inactive_products_and_product_categories_are_not_recommended(self):
        article = make_article()
        inactive_category = Category.objects.create(name="مخفی", slug="hidden", is_active=False)
        for product in (make_product(is_active=False), make_product(category=inactive_category)):
            ArticleProduct.objects.create(article=article, product=product)
        self.assertEqual(self.client.get(self.detail_url(article)).data["related_products"], [])

    def test_related_articles_are_ordered_public_cards_without_recursion(self):
        article, late, first, tied = make_article(), make_article(), make_article(), make_article()
        ArticleRelation.objects.create(article=article, related_article=late, sort_order=9)
        ArticleRelation.objects.create(article=article, related_article=first, sort_order=1)
        ArticleRelation.objects.create(article=article, related_article=tied, sort_order=1)
        ArticleRelation.objects.create(article=first, related_article=article)
        ArticleRelation.objects.create(article=late, related_article=first)
        inactive = MagazineCategory.objects.create(name="مخفی", slug="hidden", is_active=False)
        for hidden in (
            make_article(is_published=False),
            make_article(is_published=False, published_at=None),
            make_article(published_at=timezone.now() + timedelta(days=1)),
            make_article(category=inactive),
        ):
            ArticleRelation.objects.create(article=article, related_article=hidden)
        payload = self.client.get(self.detail_url(article)).data["related_articles"]
        self.assertEqual([item["id"] for item in payload], [first.id, tied.id, late.id])
        for item in payload:
            self.assertNotIn("content", item)
            self.assertNotIn("related_articles", item)
            self.assertNotIn("related_products", item)
            self.assertNotIn("is_published", item)

    def test_pagination_uses_catalog_envelope_and_limits_page_size(self):
        for _ in range(21):
            make_article()
        first = self.client.get(self.list_url)
        self.assertEqual(first.data["count"], 21)
        self.assertEqual(len(first.data["results"]), 20)
        self.assertIsNotNone(first.data["next"])
        self.assertIsNone(first.data["previous"])
        second = self.client.get(self.list_url, {"page": 2})
        self.assertEqual(len(second.data["results"]), 1)
        self.assertIsNotNone(second.data["previous"])
        self.assertEqual(len(self.client.get(self.list_url, {"page_size": 2}).data["results"]), 2)
        # Check the maximum without creating 100+ fixture rows.
        request = Request(APIRequestFactory().get(self.list_url, {"page_size": 1000}))
        self.assertEqual(ArticlePagination().get_page_size(request), 100)

    def test_list_and_detail_query_counts_do_not_grow_with_relationships(self):
        article = make_article()
        for count in (1, 8):
            for _ in range(count):
                related = make_article()
                ArticleRelation.objects.create(article=article, related_article=related)
                ArticleProduct.objects.create(article=article, product=make_product())
            with self.subTest(added_relations=count):
                with self.assertNumQueries(2):
                    response = self.client.get(self.list_url)
                self.assertEqual(response.status_code, 200)
                with self.assertNumQueries(3):
                    response = self.client.get(self.detail_url(article))
                self.assertEqual(response.status_code, 200)

    def test_public_endpoints_reject_all_mutations(self):
        article = make_article()
        for url in (self.categories_url, self.list_url, self.detail_url(article)):
            for method in ("post", "put", "patch", "delete"):
                with self.subTest(url=url, method=method):
                    self.assertEqual(getattr(self.client, method)(url, {}, format="json").status_code, 405)
        article.refresh_from_db()
        self.assertTrue(article.is_published)

    @override_settings(STORAGES={
        **settings.STORAGES,
        "default": {"BACKEND": "django.core.files.storage.InMemoryStorage"},
    })
    def test_article_cover_uses_storage_url_and_request_context(self):
        article = make_article(cover_image="magazine/covers/plant.webp")
        for url in (self.list_url, self.detail_url(article)):
            response = self.client.get(url)
            item = response.data["results"][0] if url == self.list_url else response.data
            self.assertEqual(item["cover_image"], "http://testserver/media/magazine/covers/plant.webp")
        with patch("django.core.files.storage.InMemoryStorage.url", return_value="https://cdn.example.com/cover.webp"):
            response = self.client.get(self.detail_url(article))
            self.assertEqual(response.data["cover_image"], "https://cdn.example.com/cover.webp")

    def test_schema_documents_read_only_endpoints_filters_and_card_relations(self):
        schema = SchemaGenerator().get_schema(request=None, public=True)
        paths = schema["paths"]
        for path in (self.categories_url, self.list_url, self.list_url + "{slug}/"):
            self.assertEqual(set(paths[path]), {"get"})
            self.assertEqual(paths[path]["get"]["security"], [{}])
        params = {parameter["name"] for parameter in paths[self.list_url]["get"]["parameters"]}
        self.assertTrue({"category", "featured", "page", "page_size"}.issubset(params))
        schemas = schema["components"]["schemas"]
        self.assertNotIn("content", schemas["ArticleList"]["properties"])
        self.assertEqual(
            schemas["ArticleDetail"]["properties"]["related_articles"]["items"]["$ref"],
            "#/components/schemas/ArticleList",
        )
