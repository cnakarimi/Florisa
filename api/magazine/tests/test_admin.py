import base64
import json
from unittest.mock import patch

from django.contrib import admin
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse

from magazine.admin import ArticleAdmin
from magazine.models import Article, ArticleProduct, ArticleRelation
from magazine.tests.helpers import make_article, make_product


@override_settings(STORAGES={
    "default": {"BACKEND": "django.core.files.storage.InMemoryStorage"},
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
})
class MagazineAdminTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin_user = get_user_model().objects.create_superuser(
            phone="09120000099", password="test-admin-password",
        )
        cls.related = make_article()
        cls.product = make_product()

    def setUp(self):
        self.client.force_login(self.admin_user)

    def article_data(self, **overrides):
        data = {
            "title": "نگهداری پتوس",
            "slug": "pothos-care",
            "category": self.related.category_id,
            "excerpt": "راهنمای نگهداری",
            "content": json.dumps([{"type": "paragraph", "text": "متن مقاله"}]),
            "reading_time": 4,
            "is_published": "on",
            "is_featured": "on",
            "published_at_0": "2026-09-01",
            "published_at_1": "12:00:00",
            "product_links-TOTAL_FORMS": 1,
            "product_links-INITIAL_FORMS": 0,
            "product_links-0-product": self.product.pk,
            "product_links-0-sort_order": 2,
            "article_links-TOTAL_FORMS": 1,
            "article_links-INITIAL_FORMS": 0,
            "article_links-0-related_article": self.related.pk,
            "article_links-0-sort_order": 3,
            "_save": "Save",
        }
        data.update(overrides)
        return data

    def test_admin_add_change_and_list_pages_render(self):
        for name, kwargs in (
            ("admin:magazine_article_add", {}),
            ("admin:magazine_article_change", {"object_id": self.related.pk}),
            ("admin:magazine_article_changelist", {}),
            ("admin:magazine_magazinecategory_add", {}),
            ("admin:magazine_magazinecategory_changelist", {}),
        ):
            with self.subTest(name=name):
                response = self.client.get(reverse(name, kwargs=kwargs))
                self.assertEqual(response.status_code, 200)

    def test_admin_can_publish_article_with_uploaded_cover_and_ordered_links(self):
        image = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
        )
        response = self.client.post(
            reverse("admin:magazine_article_add"),
            self.article_data(cover_image=SimpleUploadedFile("cover.png", image, content_type="image/png")),
        )
        self.assertEqual(response.status_code, 302)
        article = Article.objects.get(slug="pothos-care")
        self.assertTrue(article.is_published)
        self.assertTrue(article.is_featured)
        self.assertEqual(article.content, [{"type": "paragraph", "text": "متن مقاله"}])
        self.assertTrue(article.cover_image.name.startswith("magazine/covers/"))
        self.assertTrue(article.cover_image.storage.exists(article.cover_image.name))
        product_link = article.product_links.get()
        self.assertEqual((product_link.product_id, product_link.sort_order), (self.product.id, 2))
        article_link = article.article_links.get()
        self.assertEqual((article_link.related_article_id, article_link.sort_order), (self.related.id, 3))

    def test_admin_can_save_empty_draft(self):
        response = self.client.post(
            reverse("admin:magazine_article_add"),
            self.article_data(
                is_published="", published_at_0="", published_at_1="", content="[]",
                **{"product_links-TOTAL_FORMS": 0, "article_links-TOTAL_FORMS": 0},
            ),
        )
        self.assertEqual(response.status_code, 302)
        article = Article.objects.get(slug="pothos-care")
        self.assertEqual(article.content, [])
        self.assertIsNone(article.published_at)
        self.assertFalse(article.is_published)

    def test_admin_rejects_invalid_content_reading_time_publication_date_and_image(self):
        for overrides, field in (
            ({"content": "{}"}, "content"),
            ({"content": "not-json"}, "content"),
            ({"reading_time": 0}, "reading_time"),
            ({"published_at_0": "", "published_at_1": ""}, "published_at"),
            ({"cover_image": SimpleUploadedFile("bad.png", b"not an image")}, "cover_image"),
        ):
            with self.subTest(field=field, overrides=overrides):
                response = self.client.post(reverse("admin:magazine_article_add"), self.article_data(**overrides))
                self.assertEqual(response.status_code, 200)
                self.assertIn(field, response.context["adminform"].form.errors)
                self.assertFalse(Article.objects.filter(slug="pothos-care").exists())
        self.assertFalse(ArticleProduct.objects.exists())
        self.assertFalse(ArticleRelation.objects.exists())

    def test_admin_rejects_duplicate_product_and_article_inlines_without_partial_saves(self):
        for prefix, field, related_id in (
            ("product_links", "product", self.product.id),
            ("article_links", "related_article", self.related.id),
        ):
            with self.subTest(prefix=prefix):
                response = self.client.post(
                    reverse("admin:magazine_article_add"),
                    self.article_data(**{
                        f"{prefix}-TOTAL_FORMS": 2,
                        f"{prefix}-1-{field}": related_id,
                        f"{prefix}-1-sort_order": 5,
                    }),
                )
                self.assertEqual(response.status_code, 200)
                formset = next(
                    inline.formset for inline in response.context["inline_admin_formsets"]
                    if inline.formset.prefix == prefix
                )
                self.assertTrue(formset.non_form_errors())
                self.assertFalse(Article.objects.filter(slug="pothos-care").exists())

    def test_admin_rejects_self_relation_with_field_error(self):
        response = self.client.post(
            reverse("admin:magazine_article_change", args=[self.related.pk]),
            self.article_data(slug=self.related.slug),
        )
        self.assertEqual(response.status_code, 200)
        formset = next(
            inline.formset for inline in response.context["inline_admin_formsets"]
            if inline.formset.prefix == "article_links"
        )
        self.assertIn("related_article", formset.errors[0])
        self.assertFalse(ArticleRelation.objects.exists())
        self.assertFalse(ArticleProduct.objects.exists())

    def test_product_and_article_autocomplete_support_editorial_selection(self):
        for model_name, field_name, term, expected_id in (
            ("articleproduct", "product", self.product.slug, self.product.id),
            ("articlerelation", "related_article", self.related.slug, self.related.id),
        ):
            with self.subTest(model=model_name):
                response = self.client.get(reverse("admin:autocomplete"), {
                    "app_label": "magazine", "model_name": model_name,
                    "field_name": field_name, "term": term,
                })
                self.assertEqual(response.status_code, 200)
                self.assertIn(str(expected_id), [item["id"] for item in response.json()["results"]])

    def test_cover_preview_handles_missing_images_and_escapes_urls(self):
        article_admin = ArticleAdmin(Article, admin.site)
        self.assertEqual(article_admin.cover_preview(None), "—")
        self.assertEqual(article_admin.cover_preview(self.related), "—")
        self.related.cover_image = "magazine/covers/cover.png"
        with patch("django.core.files.storage.InMemoryStorage.url", return_value='/media/cover" onerror="alert(1)'):
            preview = article_admin.cover_preview(self.related)
        self.assertIn("&quot;", preview)
        self.assertNotIn('" onerror="', preview)
