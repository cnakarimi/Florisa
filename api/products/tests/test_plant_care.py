from django.contrib import admin
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.test import TestCase
from django.urls import reverse

from products.admin import PlantCareItemInline, PlantDetailsInline
from products.models import Category, PlantCareItem, PlantDetails, Product


class PlantCareTests(TestCase):
    def setUp(self):
        category = Category.objects.create(name="Plants", slug="care-plants")
        product = Product.objects.create(
            category=category, name="Plant", slug="care-plant",
            product_type=Product.ProductType.PLANT, price=100,
        )
        self.details = PlantDetails.objects.create(
            product=product, plant_type="Plant", care_notes="Existing notes",
            light_requirement="indirect", watering_requirement="low",
            ideal_temperature_min=18, ideal_temperature_max=25,
        )

    def test_choices_blank_drafts_and_stable_order(self):
        self.assertFalse(self.details.care_items.exists())
        keys = ["light", "watering", "temperature", "humidity", "soil"]
        for key in reversed(keys):
            item = PlantCareItem(plant_details=self.details, key=key, value="Draft")
            item.full_clean()
            item.save()
        self.assertEqual(list(self.details.care_items.values_list("key", flat=True)), keys)
        with self.assertRaises(ValidationError):
            PlantCareItem(plant_details=self.details, key="unknown", value="Draft").full_clean()
        self.details.refresh_from_db()
        self.assertEqual(self.details.care_notes, "Existing notes")
        self.assertEqual(self.details.light_requirement, "indirect")
        self.assertEqual(self.details.watering_requirement, "low")
        self.assertEqual(self.details.ideal_temperature_min, 18)
        self.assertEqual(self.details.ideal_temperature_max, 25)

    def test_database_uniqueness_is_per_plant_and_delete_cascades(self):
        PlantCareItem.objects.create(plant_details=self.details, key="light", value="Draft")
        with self.assertRaises(IntegrityError), transaction.atomic():
            PlantCareItem.objects.create(plant_details=self.details, key="light", value="Other")
        product = Product.objects.create(
            category=self.details.product.category, name="Other", slug="other-care-plant",
            product_type="plant", price=100,
        )
        other = PlantDetails.objects.create(product=product, plant_type="Other")
        PlantCareItem.objects.create(plant_details=other, key="light", value="Draft")
        self.details.delete()
        self.assertEqual(PlantCareItem.objects.count(), 1)

    def test_admin_link_inline_save_and_duplicate_validation(self):
        user = get_user_model().objects.create_superuser(
            phone="09123456789", password="test-password",
        )
        self.client.force_login(user)
        plant_url = reverse("admin:products_plant_change", args=[self.details.product_id])
        details_url = reverse("admin:products_plantdetails_change", args=[self.details.pk])
        self.assertTrue(PlantDetailsInline.show_change_link)
        self.assertContains(self.client.get(plant_url), details_url)
        response = self.client.get(details_url)
        self.assertEqual(response.status_code, 200)
        inline = response.context["inline_admin_formsets"][0]
        self.assertIsInstance(inline.opts, PlantCareItemInline)
        formset_class = type(inline.formset)
        data = {
            "care_items-TOTAL_FORMS": "1", "care_items-INITIAL_FORMS": "0",
            "care_items-0-key": "humidity", "care_items-0-value": "Draft",
            "care_items-0-summary": "", "care_items-0-explanation": "",
        }
        formset = formset_class(data, instance=self.details, prefix="care_items")
        self.assertTrue(formset.is_valid(), formset.errors)
        formset.save()
        self.assertEqual(self.details.care_items.get().key, "humidity")
        data.update({
            "care_items-TOTAL_FORMS": "2", "care_items-0-key": "soil",
            "care_items-1-key": "soil", "care_items-1-value": "Draft",
        })
        formset = formset_class(data, instance=self.details, prefix="care_items")
        self.assertFalse(formset.is_valid())
        details_admin = admin.site._registry[PlantDetails]
        self.assertFalse(details_admin.has_add_permission(response.wsgi_request))
        self.assertFalse(details_admin.has_delete_permission(response.wsgi_request, self.details))
