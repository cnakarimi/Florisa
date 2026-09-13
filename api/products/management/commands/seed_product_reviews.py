from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from products.models import Product, ProductReview


PLANT_REVIEWS = (
    ("علی رضایی", 5, "گیاه خیلی سالم رسید. بسته‌بندی عالی بود و برگ‌ها آسیبی ندیده بودند."),
    ("سارا محمدی", 5, "دقیقاً شبیه عکس بود و برگ‌های شادابش فضای خانه را قشنگ‌تر کرد."),
    ("محمد احمدی", 4, "ارسال به‌موقع بود و گلدان با دقت بسته‌بندی شده بود."),
    ("نگار حسینی", 5, "ریشه و برگ‌ها سالم بودند و راهنمای نگهداری هم خیلی کمک کرد."),
    ("مریم کریمی", 4, "اندازه گیاه مناسب بود و بعد از چند روز هنوز کاملاً سرحال است."),
    ("امیر صادقی", 3, "گیاه سالم بود، ولی اندازه‌اش کمی کوچک‌تر از انتظارم بود."),
    ("پریسا نوری", 5, "برای هدیه خریدم؛ ظاهر مرتب و بسته‌بندی تمیزش خیلی پسندیده شد."),
    ("رضا موسوی", 4, "کیفیت گیاه خوب است و در نور آپارتمان هم به‌خوبی جا افتاده."),
)

FLOWER_REVIEWS = (
    ("لیلا مرادی", 5, "گل‌ها تازه و خوش‌رنگ بودند و برای هدیه خیلی زیبا شدند."),
    ("حسین جعفری", 4, "دسته‌گل مرتب رسید و رنگ گل‌ها با عکس هماهنگ بود."),
    ("الهام رستمی", 5, "تازگی شاخه‌ها عالی بود و چند روز هم خوب دوام آوردند."),
    ("آرمان کاظمی", 5, "برای مناسبت خانوادگی سفارش دادم و همه از چیدمان گل‌ها تعریف کردند."),
    ("فاطمه عباسی", 4, "گل‌ها سالم رسیدند و بسته‌بندی‌شان برای حمل مناسب بود."),
    ("نازنین شریفی", 3, "گل‌ها زیبا بودند، اما چند شاخه زودتر از بقیه پژمرده شدند."),
    ("پویا حیدری", 5, "رنگ و عطر گل‌ها دلنشین بود و تحویل هم به‌موقع انجام شد."),
    ("مهسا اکبری", 4, "ظاهر دسته‌گل طبیعی و تمیز بود؛ برای هدیه انتخاب خوبی است."),
)

REVIEWS_PER_PRODUCT = 3


class Command(BaseCommand):
    help = "Add three approved, idempotent Persian demo reviews for every product."

    def handle(self, *args, **options):
        products_checked = 0
        reviews_created = 0
        reviews_skipped = 0
        now = timezone.now()

        for product in Product.objects.order_by("pk").iterator():
            products_checked += 1
            pool = (
                PLANT_REVIEWS
                if product.product_type == Product.ProductType.PLANT
                else FLOWER_REVIEWS
            )

            with transaction.atomic():
                for slot in range(REVIEWS_PER_PRODUCT):
                    reviewer_name, rating, comment = pool[
                        (product.pk + slot * 3) % len(pool)
                    ]
                    review, created = ProductReview.objects.get_or_create(
                        demo_key=f"florisa-demo-v1:{product.pk}:{slot}",
                        defaults={
                            "product": product,
                            "reviewer_name": reviewer_name,
                            "rating": rating,
                            "comment": comment,
                            "is_approved": True,
                        },
                    )

                    if created:
                        age = timedelta(
                            days=2 + (product.pk * 7 + slot * 9) % 35,
                            hours=slot * 4 + product.pk % 6,
                        )
                        ProductReview.objects.filter(pk=review.pk).update(
                            created_at=now - age,
                            updated_at=now - age,
                        )
                        reviews_created += 1
                    else:
                        reviews_skipped += 1

        self.stdout.write(
            self.style.SUCCESS(
                "Product review seed complete: "
                f"products checked={products_checked}, "
                f"reviews created={reviews_created}, "
                f"reviews skipped/already existing={reviews_skipped}"
            )
        )
