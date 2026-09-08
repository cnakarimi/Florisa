from datetime import timedelta

from django.utils import timezone

from magazine.models import Article, MagazineCategory
from products.models import Category, Product


def make_article(**overrides):
    category = overrides.pop("category", None)
    if category is None:
        category, _ = MagazineCategory.objects.get_or_create(
            slug="plant-care", defaults={"name": "نگهداری گیاهان"},
        )
    sequence = Article.objects.count() + 1
    values = {
        "category": category,
        "title": f"مقاله {sequence}",
        "slug": f"article-{sequence}",
        "excerpt": "خلاصه مقاله",
        "content": [{"type": "paragraph", "text": "متن مقاله"}],
        "reading_time": 4,
        "is_published": True,
        "published_at": timezone.now() - timedelta(hours=1),
    }
    values.update(overrides)
    return Article.objects.create(**values)


def make_product(**overrides):
    category = overrides.pop("category", None)
    if category is None:
        category, _ = Category.objects.get_or_create(
            slug="magazine-test-products", defaults={"name": "محصولات تست مجله"},
        )
    sequence = Product.objects.count() + 1
    values = {
        "category": category,
        "name": f"پتوس {sequence}",
        "slug": f"magazine-test-pothos-{sequence}",
        "product_type": Product.ProductType.PLANT,
        "price": 450_000,
        "stock_quantity": 8,
        "sale_unit": Product.SaleUnit.POT,
        "cover_image": "golden-pothos.webp",
    }
    values.update(overrides)
    return Product.objects.create(**values)
