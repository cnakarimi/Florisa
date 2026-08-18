import base64
import shutil
import tempfile

from django.contrib import admin
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from drf_spectacular.generators import SchemaGenerator

from products.admin import HomeSlideAdmin
from products.models import HomeSlide


ONE_PIXEL_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
)


def uploaded_image(name: str) -> SimpleUploadedFile:
    return SimpleUploadedFile(name, ONE_PIXEL_PNG, content_type="image/png")


class HomeSlideTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.media_root = tempfile.mkdtemp(prefix="florisa-home-slides-")
        cls.settings_override = override_settings(MEDIA_ROOT=cls.media_root)
        cls.settings_override.enable()

    @classmethod
    def tearDownClass(cls):
        cls.settings_override.disable()
        shutil.rmtree(cls.media_root, ignore_errors=True)
        super().tearDownClass()

    def create_slide(self, *, name: str, sort_order: int = 0, is_active: bool = True):
        return HomeSlide.objects.create(
            admin_title=name,
            eyebrow="تازه",
            title=f"عنوان {name}",
            description="توضیح کوتاه",
            mobile_image=uploaded_image(f"{name}-mobile.png"),
            desktop_image=uploaded_image(f"{name}-desktop.png"),
            image_alt="گلدان سبز در خانه",
            cta_label="مشاهده محصولات",
            cta_url="/shop?category=plants",
            sort_order=sort_order,
            is_active=is_active,
        )

    def test_public_list_only_returns_active_slides_in_deterministic_order(self):
        second = self.create_slide(name="second", sort_order=1)
        first = self.create_slide(name="first", sort_order=1)
        self.create_slide(name="inactive", sort_order=0, is_active=False)

        response = self.client.get(reverse("products:home-slide-list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.json()], [second.id, first.id])

    def test_public_list_serializes_absolute_image_urls_and_no_admin_fields(self):
        slide = self.create_slide(name="public")

        response = self.client.get(reverse("products:home-slide-list"))

        self.assertEqual(response.status_code, 200)
        payload = response.json()[0]
        self.assertEqual(
            set(payload),
            {
                "id",
                "eyebrow",
                "title",
                "description",
                "mobile_image_url",
                "desktop_image_url",
                "image_alt",
                "cta_label",
                "cta_url",
            },
        )
        self.assertTrue(payload["mobile_image_url"].startswith("http://testserver/media/"))
        self.assertTrue(payload["desktop_image_url"].startswith("http://testserver/media/"))
        self.assertNotIn("admin_title", payload)
        self.assertNotIn("is_active", payload)
        self.assertNotIn("created_at", payload)
        self.assertEqual(payload["id"], slide.id)

    def test_public_endpoint_does_not_allow_mutations(self):
        response = self.client.post(
            reverse("products:home-slide-list"),
            data={"title": "نباید ساخته شود"},
        )

        self.assertEqual(response.status_code, 405)
        self.assertEqual(HomeSlide.objects.count(), 0)

    def test_empty_public_list(self):
        response = self.client.get(reverse("products:home-slide-list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_cta_label_and_destination_must_be_consistent(self):
        slide = HomeSlide(
            admin_title="cta",
            title="عنوان",
            mobile_image=uploaded_image("cta-mobile.png"),
            desktop_image=uploaded_image("cta-desktop.png"),
            image_alt="تصویر گل",
            cta_label="مشاهده",
        )

        with self.assertRaises(ValidationError) as context:
            slide.full_clean()

        self.assertIn("cta_label", context.exception.message_dict)
        self.assertIn("cta_url", context.exception.message_dict)

    def test_unsafe_or_external_cta_destination_is_rejected(self):
        for destination in (
            "javascript:alert(1)",
            "//attacker.example/path",
            "https://attacker.example/path",
            "/shop\\redirect",
        ):
            with self.subTest(destination=destination):
                slide = HomeSlide(
                    admin_title="unsafe",
                    title="عنوان",
                    mobile_image=uploaded_image("unsafe-mobile.png"),
                    desktop_image=uploaded_image("unsafe-desktop.png"),
                    image_alt="تصویر گل",
                    cta_label="مشاهده",
                    cta_url=destination,
                )

                with self.assertRaises(ValidationError) as context:
                    slide.full_clean()

                self.assertIn("cta_url", context.exception.message_dict)

    def test_required_images_are_validated(self):
        slide = HomeSlide(admin_title="missing", title="عنوان", image_alt="تصویر گل")

        with self.assertRaises(ValidationError) as context:
            slide.full_clean()

        self.assertIn("mobile_image", context.exception.message_dict)
        self.assertIn("desktop_image", context.exception.message_dict)

    def test_text_is_trimmed_and_string_representation_uses_admin_title(self):
        slide = HomeSlide(
            admin_title="  اسلاید تابستان  ",
            eyebrow="  جدید  ",
            title="  گل‌های تازه  ",
            mobile_image=uploaded_image("trim-mobile.png"),
            desktop_image=uploaded_image("trim-desktop.png"),
            image_alt="  گل تازه  ",
        )

        slide.full_clean()

        self.assertEqual(str(slide), "اسلاید تابستان")
        self.assertEqual(slide.eyebrow, "جدید")
        self.assertEqual(slide.title, "گل‌های تازه")
        self.assertEqual(slide.image_alt, "گل تازه")

    def test_schema_documents_public_home_slide_endpoint(self):
        schema = SchemaGenerator().get_schema(request=None, public=True)

        self.assertIn("/api/home/slides/", schema["paths"])
        self.assertEqual(set(schema["paths"]["/api/home/slides/"]), {"get"})

    def test_admin_configuration_supports_ordering_status_and_safe_empty_previews(self):
        slide_admin = HomeSlideAdmin(HomeSlide, admin.site)

        self.assertEqual(slide_admin.list_editable, ("sort_order", "is_active"))
        self.assertEqual(slide_admin.ordering, ("sort_order", "id"))
        self.assertEqual(slide_admin.mobile_preview(None), "—")
        self.assertEqual(slide_admin.desktop_preview(None), "—")

    def test_admin_add_and_list_pages_render(self):
        admin_user = get_user_model().objects.create_superuser(
            phone="09120000099",
            password="test-admin-password",
        )
        self.client.force_login(admin_user)

        add_response = self.client.get(reverse("admin:products_homeslide_add"))
        list_response = self.client.get(reverse("admin:products_homeslide_changelist"))

        self.assertEqual(add_response.status_code, 200)
        self.assertContains(add_response, "تصاویر واکنش‌گرا")
        self.assertContains(add_response, "۹۰۰×۱۲۰۰")
        self.assertEqual(list_response.status_code, 200)
