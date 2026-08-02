from django.core.management.base import BaseCommand

from products.models import Category, Product
from products.seeding import (
    ensure_cut_flowers_category,
    ensure_indoor_plant_products,
    ensure_indoor_plants_category,
)


class Command(BaseCommand):
    help = "Create the built-in catalog categories without overwriting data."

    def handle(self, *args, **options):
        cut_flowers = ensure_cut_flowers_category(Category)
        indoor_plants = ensure_indoor_plants_category(Category)
        products = ensure_indoor_plant_products(Product, indoor_plants)
        self.stdout.write(
            self.style.SUCCESS(
                "Catalog seed is ready: "
                f"{cut_flowers.slug}, {indoor_plants.slug} "
                f"({len(products)} indoor plants)",
            ),
        )
