from io import BytesIO
import os
from pathlib import Path
import runpy
import tempfile
from unittest.mock import patch

from django.contrib import admin
from django.contrib.auth import get_user_model
from django.core.exceptions import ImproperlyConfigured, RequestDataTooBig, ValidationError
from django.core.files.base import ContentFile
from django.core.files.storage import InMemoryStorage, default_storage
from django.core.files.uploadedfile import SimpleUploadedFile
from django.forms import modelform_factory
from django.test import RequestFactory, TestCase, override_settings
from django.urls import reverse
from PIL import Image

from magazine.models import Article
from magazine.serializers import MagazineProductSerializer
from media_store.models import MediaFile
from media_store.storage import DatabaseMediaStorage
from media_store.uploads import LimitedUploadHandler
from media_store.validation import MAX_IMAGE_BYTES, validate_image_upload
from products.admin import HomeSlideAdmin
from products.models import Category, HomeSlide, PlantDetails, Product, ProductImage
from products.serializers import HomeSlideSerializer, ProductDetailSerializer


def upload(extension="png", image_format=None, size=(16, 16)):
    buffer = BytesIO()
    image_format = image_format or {"jpg": "JPEG", "jpeg": "JPEG"}.get(extension, extension.upper())
    Image.new("RGB", size, "green").save(buffer, format=image_format)
    return SimpleUploadedFile(f"flower.{extension}", buffer.getvalue())


DATABASE_STORAGES = {
    "default": {"BACKEND": "media_store.storage.DatabaseMediaStorage"},
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
}


class ValidationTests(TestCase):
    def test_development_still_saves_to_local_media_root(self):
        with tempfile.TemporaryDirectory() as directory:
            with override_settings(MEDIA_ROOT=directory, STORAGES={
                "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
            }):
                name = default_storage.save("local.png", upload())
                self.assertTrue((Path(directory) / name).is_file())
                self.assertEqual(default_storage.url(name), "/media/local.png")

    def test_production_configuration_selects_database_and_rejects_ephemeral_storage(self):
        environment = {
            "DEBUG": "false", "SECRET_KEY": "test-only",
            "DATABASE_URL": "postgresql://test:test@localhost/test",
        }
        settings_path = Path(__file__).resolve().parents[1] / "config" / "settings.py"
        with patch.dict(os.environ, environment, clear=True), patch("dotenv.load_dotenv"):
            configured = runpy.run_path(str(settings_path))
            self.assertEqual(configured["STORAGES"]["default"]["BACKEND"],
                             "media_store.storage.DatabaseMediaStorage")
            with patch.dict(os.environ, {"MEDIA_STORAGE_BACKEND": "filesystem"}):
                with self.assertRaises(ImproperlyConfigured):
                    runpy.run_path(str(settings_path))
            with patch.dict(os.environ, {"DATABASE_URL": ""}):
                with self.assertRaises(ImproperlyConfigured):
                    runpy.run_path(str(settings_path))

    def test_all_upload_fields_accept_supported_formats(self):
        for model, name in ((HomeSlide, "mobile_image"), (HomeSlide, "desktop_image"),
                            (Product, "cover_upload"), (ProductImage, "image_upload"),
                            (Article, "cover_image")):
            field = model._meta.get_field(name)
            for extension in ("jpg", "jpeg", "png", "webp"):
                with self.subTest(model=model, field=name, extension=extension):
                    field.clean(upload(extension), model())
                    field.formfield().clean(upload(extension))

    def test_invalid_uploads_are_rejected_by_model_and_admin_fields(self):
        for make_file in (
            lambda: upload("gif"), lambda: upload("png", "GIF"),
            lambda: SimpleUploadedFile("fake.jpg", b"not an image"),
            lambda: SimpleUploadedFile("big.png", b"x" * (MAX_IMAGE_BYTES + 1)),
            lambda: upload(size=(8193, 1)),
        ):
            for model, name in ((HomeSlide, "mobile_image"), (HomeSlide, "desktop_image"),
                                (Product, "cover_upload"), (ProductImage, "image_upload"),
                                (Article, "cover_image")):
                field = model._meta.get_field(name)
                with self.subTest(field=name):
                    with self.assertRaises(ValidationError):
                        field.clean(make_file(), model())
                    with self.assertRaises(ValidationError):
                        field.formfield().clean(make_file())

    def test_size_limit_runs_before_pillow(self):
        with patch("media_store.validation.Image.open") as image_open:
            with self.assertRaises(ValidationError):
                validate_image_upload(SimpleUploadedFile("big.png", b"x" * (MAX_IMAGE_BYTES + 1)))
            image_open.assert_not_called()

    def test_pixel_limit_rejects_compressed_large_image(self):
        with self.assertRaises(ValidationError):
            validate_image_upload(upload(size=(4001, 4000)))

    def test_upload_handler_counts_bytes(self):
        handler = LimitedUploadHandler()
        self.assertEqual(handler.receive_data_chunk(b"abc", 0), b"abc")
        with self.assertRaises(RequestDataTooBig):
            handler.receive_data_chunk(b"abc", MAX_IMAGE_BYTES)

    def test_large_request_rejected_before_admin_parsing(self):
        response = self.client.post("/admin/login/", CONTENT_LENGTH=str(21 * 1024 * 1024))
        self.assertEqual(response.status_code, 413)


@override_settings(STORAGES=DATABASE_STORAGES, MEDIA_STORAGE_BACKEND="database")
class DatabaseMediaTests(TestCase):
    def make_slide(self):
        return HomeSlide.objects.create(
            admin_title="Banner", title="Flowers", image_alt="Flowers",
            mobile_image=upload(), desktop_image=upload("webp"),
        )

    def test_storage_round_trip_new_instance_collision_delete_and_no_disk_path(self):
        storage = DatabaseMediaStorage()
        source = upload()
        data = source.read()
        name = storage.save("home/banner.png", ContentFile(data))
        second = storage.save(name, ContentFile(data))
        self.assertNotEqual(name, second)
        self.assertEqual(DatabaseMediaStorage().open(name).read(), data)
        self.assertEqual(storage.size(name), len(data))
        with self.assertRaises(NotImplementedError):
            storage.path(name)
        storage.delete(name)
        self.assertFalse(storage.exists(name))
        with self.assertRaises(FileNotFoundError):
            storage.open(name)

    @override_settings(DEBUG=False, SECURE_SSL_REDIRECT=False)
    def test_production_media_get_head_cache_and_missing(self):
        slide = self.make_slide()
        url = slide.mobile_image.url
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, slide.mobile_image.read())
        self.assertEqual(response["Content-Type"], "image/png")
        self.assertEqual(response["X-Content-Type-Options"], "nosniff")
        self.assertEqual(self.client.head(url).content, b"")
        self.assertEqual(self.client.get(url, HTTP_IF_MODIFIED_SINCE=response["Last-Modified"]).status_code, 304)
        self.assertEqual(self.client.get("/media/missing.png").status_code, 404)
        self.assertEqual(self.client.get("/media/../config/settings.py").status_code, 404)
        self.assertEqual(self.client.post(url).status_code, 405)

    def test_home_slide_api_urls_and_admin_preview(self):
        slide = self.make_slide()
        data = self.client.get(reverse("products:home-slide-list")).json()[0]
        for name in ("mobile", "desktop"):
            url = data[f"{name}_image_url"]
            self.assertTrue(url.startswith("http://testserver/media/"))
            self.assertEqual(self.client.get(url).status_code, 200)
        self.assertIn(slide.mobile_image.url, HomeSlideAdmin(HomeSlide, admin.site).mobile_preview(slide))

    def test_product_upload_and_legacy_urls(self):
        category = Category.objects.create(name="Test", slug="media-test")
        product = Product.objects.create(category=category, name="Plant", slug="media-plant",
                                         product_type="plant", price=1, cover_image="legacy.webp",
                                         cover_upload=upload())
        PlantDetails.objects.create(product=product, plant_type="Plant")
        form_class = modelform_factory(ProductImage, fields=("product", "image", "image_upload"))
        form = form_class({"product": product.pk}, {"image_upload": upload("jpg")})
        self.assertTrue(form.is_valid(), form.errors)
        form.save()
        response = self.client.get(reverse("products:product-detail", args=[product.slug]))
        self.assertEqual(response.status_code, 200)
        for url in (response.json()["cover_image"], response.json()["images"][0]["image"]):
            self.assertTrue(url.startswith("http://testserver/media/"))
            self.assertEqual(self.client.get(url).status_code, 200)
        request = RequestFactory().get("/", HTTP_X_FORWARDED_PROTO="https")
        external = InMemoryStorage(base_url="https://cdn.example.com/")
        product.cover_upload.storage = external
        data = ProductDetailSerializer(product, context={"request": request}).data
        self.assertTrue(data["cover_image"].startswith("https://cdn.example.com/"))
        self.assertEqual(MagazineProductSerializer(product, context={"request": request}).data["cover_image"],
                         data["cover_image"])
        product.cover_upload = ""
        self.assertEqual(ProductDetailSerializer(product).data["cover_image"], "legacy.webp")

    def test_admin_creates_slide_and_can_edit_missing_old_reference(self):
        user = get_user_model().objects.create_superuser(phone="09121112233", password="test-password")
        self.client.force_login(user)
        data = dict(admin_title="Banner", title="Flowers", image_alt="Flowers",
                    mobile_image=upload(), desktop_image=upload("webp"), sort_order=0,
                    button_background_color="#d4af37", button_text_color="#121212",
                    title_text_color="#ffffff", is_active="on")
        response = self.client.post(reverse("admin:products_homeslide_add"), data)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(MediaFile.objects.count(), 2)
        slide = HomeSlide.objects.get()
        MediaFile.objects.all().delete()
        slide.full_clean()  # Existing references don't cause storage reads.

    def test_external_storage_urls_are_not_prefixed_with_backend_host(self):
        slide = self.make_slide()
        storage = InMemoryStorage(base_url="https://cdn.example.com/")
        slide.mobile_image.storage = storage
        slide.desktop_image.storage = storage
        data = HomeSlideSerializer(slide, context={"request": RequestFactory().get("/")}).data
        self.assertTrue(data["mobile_image_url"].startswith("https://cdn.example.com/"))
        self.assertTrue(data["desktop_image_url"].startswith("https://cdn.example.com/"))
