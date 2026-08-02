from django.contrib import admin
from django.test import RequestFactory, TestCase

from products.admin import CutFlowerAdmin, PlantAdmin
from products.models import Category, CutFlower, CutFlowerDetails, Plant, PlantDetails, Product


class TypedProductAdminTests(TestCase):
    def setUp(self):
        self.request = RequestFactory().get("/admin/")
        self.category = Category.objects.create(name="فروشگاه", slug="shop")
        self.plant = Product.objects.create(
            category=self.category,
            name="پتوس",
            slug="pothos",
            product_type="plant",
            price=100,
        )
        PlantDetails.objects.create(product=self.plant, plant_type="پتوس")
        self.flower = Product.objects.create(
            category=self.category,
            name="رز",
            slug="rose",
            product_type="cut_flower",
            price=100,
        )
        CutFlowerDetails.objects.create(product=self.flower, flower_type="رز")

    def test_admin_querysets_are_separated(self):
        plant_admin = PlantAdmin(Plant, admin.site)
        flower_admin = CutFlowerAdmin(CutFlower, admin.site)
        self.assertQuerySetEqual(plant_admin.get_queryset(self.request), [self.plant])
        self.assertQuerySetEqual(flower_admin.get_queryset(self.request), [self.flower])

    def test_typed_admin_assigns_product_type(self):
        plant_admin = PlantAdmin(Plant, admin.site)
        flower_admin = CutFlowerAdmin(CutFlower, admin.site)
        plant = Plant(category=self.category, name="گیاه جدید", slug="new-plant", price=100)
        flower = CutFlower(category=self.category, name="گل جدید", slug="new-flower", price=100)

        plant_admin.save_model(self.request, plant, form=None, change=False)
        flower_admin.save_model(self.request, flower, form=None, change=False)

        self.assertEqual(plant.product_type, Product.ProductType.PLANT)
        self.assertEqual(flower.product_type, Product.ProductType.CUT_FLOWER)
