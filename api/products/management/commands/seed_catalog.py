from django.core.management.base import BaseCommand

from products.models import Category
from products.seeding import ensure_cut_flowers_category


class Command(BaseCommand):
    help = "Create the built-in catalog categories without overwriting data."

    def handle(self, *args, **options):
        category = ensure_cut_flowers_category(Category)
        self.stdout.write(
            self.style.SUCCESS(
                f"Catalog seed is ready: {category.slug}",
            ),
        )
