from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.db.models.deletion import ProtectedError
from django.test import TestCase

from magazine.models import Article, ArticleProduct, ArticleRelation, MagazineCategory
from magazine.tests.helpers import make_article, make_product


class MagazineModelTests(TestCase):
    def test_category_slugs_are_unique(self):
        MagazineCategory.objects.create(name="نگهداری", slug="care")
        with self.assertRaises(IntegrityError), transaction.atomic():
            MagazineCategory.objects.create(name="گل", slug="care")

    def test_article_slugs_are_unique(self):
        make_article(slug="unique-slug")
        with self.assertRaises(IntegrityError), transaction.atomic():
            make_article(slug="unique-slug")

    def test_titles_and_url_safe_slugs_are_required(self):
        article = make_article()
        for field, value in (("title", ""), ("slug", ""), ("slug", "unsafe/path")):
            with self.subTest(field=field, value=value):
                original = getattr(article, field)
                setattr(article, field, value)
                with self.assertRaises(ValidationError) as error:
                    article.full_clean()
                self.assertIn(field, error.exception.message_dict)
                setattr(article, field, original)

    def test_saving_titles_and_names_does_not_change_existing_slugs(self):
        article = make_article(slug="stable-article")
        article.title = "عنوان جدید"
        article.save()
        article.category.name = "نام جدید"
        category_slug = article.category.slug
        article.category.save()
        article.refresh_from_db()
        article.category.refresh_from_db()
        self.assertEqual(article.slug, "stable-article")
        self.assertEqual(article.category.slug, category_slug)

    def test_reading_time_must_be_at_least_one(self):
        article = make_article()
        for value in (0, -1):
            with self.subTest(value=value):
                article.reading_time = value
                with self.assertRaises(ValidationError) as error:
                    article.full_clean()
                self.assertIn("reading_time", error.exception.message_dict)
                with self.assertRaises(IntegrityError), transaction.atomic():
                    Article.objects.filter(pk=article.pk).update(reading_time=value)

    def test_draft_can_have_no_publication_date_or_cover(self):
        article = make_article(is_published=False, published_at=None, content=[])
        article.full_clean()
        self.assertFalse(article.cover_image)

    def test_publishing_requires_a_date_in_validation_and_database(self):
        article = make_article(is_published=False, published_at=None)
        article.is_published = True
        with self.assertRaises(ValidationError) as error:
            article.full_clean()
        self.assertIn("published_at", error.exception.message_dict)
        with self.assertRaises(IntegrityError), transaction.atomic():
            Article.objects.filter(pk=article.pk).update(is_published=True)

    def test_content_accepts_blocks_and_future_types(self):
        article = make_article()
        for content in (
            [],
            [{"type": "paragraph", "text": "متن ساده"}],
            [{"type": "heading", "text": "عنوان", "level": 2}],
            [{"type": "future-block", "data": {"items": ["one"]}}],
        ):
            with self.subTest(content=content):
                article.content = content
                article.full_clean()

    def test_content_rejects_malformed_envelopes_including_empty_objects(self):
        article = make_article()
        for content in (
            {}, "", None, "plain text", 1, ["text"], [{}],
            [{"type": ""}], [{"type": "  "}], [{"type": 1}],
            [{"type": "paragraph", "text": 123}],
        ):
            with self.subTest(content=content):
                article.content = content
                with self.assertRaises(ValidationError) as error:
                    article.full_clean()
                self.assertIn("content", error.exception.message_dict)

    def test_content_default_is_not_shared(self):
        first = Article()
        second = Article()
        first.content.append({"type": "paragraph", "text": "text"})
        self.assertEqual(second.content, [])

    def test_duplicate_article_products_are_rejected(self):
        article, product = make_article(), make_product()
        ArticleProduct.objects.create(article=article, product=product)
        with self.assertRaises(IntegrityError), transaction.atomic():
            ArticleProduct.objects.create(article=article, product=product, sort_order=1)

    def test_duplicate_article_relations_are_rejected(self):
        article, related = make_article(), make_article()
        ArticleRelation.objects.create(article=article, related_article=related)
        with self.assertRaises(IntegrityError), transaction.atomic():
            ArticleRelation.objects.create(article=article, related_article=related)

    def test_self_relation_is_rejected_by_validation_and_database(self):
        article = make_article()
        relation = ArticleRelation(article=article, related_article=article)
        with self.assertRaises(ValidationError) as error:
            relation.full_clean()
        self.assertIn("related_article", error.exception.message_dict)
        with self.assertRaises(IntegrityError), transaction.atomic():
            relation.save()

    def test_relations_are_directional(self):
        article, related = make_article(), make_article()
        ArticleRelation.objects.create(article=article, related_article=related)
        self.assertQuerySetEqual(article.related_articles.all(), [related])
        self.assertFalse(related.related_articles.exists())

    def test_category_with_articles_is_protected_from_deletion(self):
        article = make_article()
        with self.assertRaises(ProtectedError):
            article.category.delete()

    def test_deleting_article_removes_links_but_keeps_related_objects(self):
        article, related, product = make_article(), make_article(), make_product()
        ArticleProduct.objects.create(article=article, product=product)
        ArticleRelation.objects.create(article=article, related_article=related)
        ArticleRelation.objects.create(article=related, related_article=article)
        article.delete()
        self.assertFalse(ArticleProduct.objects.exists())
        self.assertFalse(ArticleRelation.objects.exists())
        self.assertTrue(Article.objects.filter(pk=related.pk).exists())
        self.assertTrue(type(product).objects.filter(pk=product.pk).exists())

    def test_deleting_related_product_removes_only_its_link(self):
        article, product = make_article(), make_product()
        ArticleProduct.objects.create(article=article, product=product)
        product.delete()
        self.assertFalse(ArticleProduct.objects.exists())
        self.assertTrue(Article.objects.filter(pk=article.pk).exists())
