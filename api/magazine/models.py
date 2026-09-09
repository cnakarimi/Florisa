from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Q
from django.utils import timezone

from magazine.validators import validate_article_content
from media_store.fields import UploadImageField


class MagazineCategory(models.Model):
    name = models.CharField("نام", max_length=120)
    slug = models.SlugField("نامک", max_length=140, unique=True)
    description = models.TextField("توضیحات", blank=True)
    sort_order = models.PositiveIntegerField("ترتیب نمایش", default=0)
    is_active = models.BooleanField("فعال", default=True)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("زمان به‌روزرسانی", auto_now=True)

    class Meta:
        ordering = ("sort_order", "id")
        verbose_name = "دسته‌بندی مجله"
        verbose_name_plural = "دسته‌بندی‌های مجله"

    def __str__(self) -> str:
        return self.name


class ArticleQuerySet(models.QuerySet):
    def public(self):
        # Evaluate the clock per request, including for scheduled articles.
        return self.filter(
            is_published=True,
            category__is_active=True,
            published_at__lte=timezone.now(),
        )


class Article(models.Model):
    title = models.CharField("عنوان", max_length=200)
    slug = models.SlugField("نامک", max_length=220, unique=True)
    excerpt = models.CharField("خلاصه", max_length=300, blank=True)
    cover_image = UploadImageField(
        "تصویر اصلی",
        upload_to="magazine/covers/%Y/%m/",
        blank=True,
    )
    content = models.JSONField(
        "محتوا",
        default=list,
        blank=True,
        help_text=(
            'آرایه‌ای از بلوک‌ها؛ مانند [{"type": "paragraph", "text": "متن مقاله"}]. '
            "متن ساده وارد کنید؛ HTML لازم نیست."
        ),
    )
    category = models.ForeignKey(
        MagazineCategory,
        on_delete=models.PROTECT,
        related_name="articles",
        verbose_name="دسته‌بندی",
    )
    published_at = models.DateTimeField("زمان انتشار", blank=True, null=True)
    reading_time = models.PositiveIntegerField(
        "زمان مطالعه (دقیقه)",
        default=1,
        validators=[MinValueValidator(1)],
    )
    is_featured = models.BooleanField("ویژه", default=False)
    is_published = models.BooleanField("منتشر شود", default=False)
    related_products = models.ManyToManyField(
        "products.Product",
        through="ArticleProduct",
        related_name="magazine_articles",
        blank=True,
        verbose_name="محصولات مرتبط",
    )
    related_articles = models.ManyToManyField(
        "self",
        through="ArticleRelation",
        through_fields=("article", "related_article"),
        symmetrical=False,
        related_name="recommended_by_articles",
        blank=True,
        verbose_name="مقالات مرتبط",
    )
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("زمان به‌روزرسانی", auto_now=True)

    objects = ArticleQuerySet.as_manager()

    class Meta:
        ordering = ("-published_at", "-id")
        verbose_name = "مقاله"
        verbose_name_plural = "مقالات"
        indexes = (
            models.Index(
                fields=("is_published", "-published_at", "-id"),
                name="magazine_article_public_idx",
            ),
        )
        constraints = (
            models.CheckConstraint(
                condition=Q(reading_time__gte=1),
                name="magazine_reading_time_positive",
            ),
            models.CheckConstraint(
                condition=Q(is_published=False) | Q(published_at__isnull=False),
                name="magazine_published_date_required",
            ),
        )

    def clean(self) -> None:
        super().clean()
        errors = {}
        # JSONField(blank=True) skips validators for empty dicts/strings;
        # validate in clean() so [] is the only accepted empty shape.
        try:
            validate_article_content(self.content)
        except ValidationError as error:
            errors["content"] = error.messages
        if self.is_published and self.published_at is None:
            errors["published_at"] = "برای انتشار مقاله، زمان انتشار را مشخص کنید."
        if errors:
            raise ValidationError(errors)

    def __str__(self) -> str:
        return self.title


class ArticleProduct(models.Model):
    article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,
        related_name="product_links",
        verbose_name="مقاله",
    )
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.CASCADE,
        related_name="magazine_links",
        verbose_name="محصول",
    )
    sort_order = models.PositiveIntegerField("ترتیب نمایش", default=0)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("زمان به‌روزرسانی", auto_now=True)

    class Meta:
        ordering = ("sort_order", "id")
        verbose_name = "محصول مرتبط"
        verbose_name_plural = "محصولات مرتبط"
        constraints = (
            models.UniqueConstraint(
                fields=("article", "product"),
                name="magazine_unique_article_product",
            ),
        )

    def __str__(self) -> str:
        return f"{self.article} — {self.product}"


class ArticleRelation(models.Model):
    article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,
        related_name="article_links",
        verbose_name="مقاله",
    )
    related_article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,
        related_name="incoming_article_links",
        verbose_name="مقاله مرتبط",
    )
    sort_order = models.PositiveIntegerField("ترتیب نمایش", default=0)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("زمان به‌روزرسانی", auto_now=True)

    class Meta:
        ordering = ("sort_order", "id")
        verbose_name = "مقاله مرتبط"
        verbose_name_plural = "مقالات مرتبط"
        constraints = (
            models.UniqueConstraint(
                fields=("article", "related_article"),
                name="magazine_unique_article_relation",
            ),
            models.CheckConstraint(
                condition=~Q(article=models.F("related_article")),
                name="magazine_article_not_self_related",
            ),
        )

    def clean(self) -> None:
        super().clean()
        if self.article_id is not None and self.article_id == self.related_article_id:
            raise ValidationError(
                {"related_article": "مقاله نمی‌تواند به خودش مرتبط شود."},
            )

    def __str__(self) -> str:
        return f"{self.article} — {self.related_article}"
