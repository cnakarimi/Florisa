from typing import Any


CUT_FLOWERS_SLUG = "cut-flowers"
CUT_FLOWERS_NAME = "گل شاخه‌ای"
INDOOR_PLANTS_SLUG = "indoor-plants"
INDOOR_PLANTS_NAME = "گیاهان آپارتمانی"
INDOOR_PLANTS_DESCRIPTION = "انواع گیاهان طبیعی مناسب خانه و محل کار"

INDOOR_PLANT_PRODUCTS = (
    {
        "name": "زاموفیلیا سبز",
        "slug": "zamioculcas-green",
        "flower_type": "زاموفیلیا",
        "color": "سبز",
        "short_description": "گیاهی مقاوم و براق برای خانه و محیط کار",
        "description": (
            "زاموفیلیا سبز با برگ‌های ضخیم و براق، انتخابی ماندگار برای "
            "فضاهای کم‌نور است و با آبیاری محدود شاداب می‌ماند."
        ),
        "plant_size": "متوسط",
        "plant_height_cm": 55,
        "quality_grade": "premium",
        "is_pet_friendly": False,
        "pot_included": True,
        "pot_material": "سرامیک",
        "pot_color": "سفید مات",
        "pot_size_cm": 20,
        "pot_has_drainage": True,
        "light_requirement": "نور کم تا متوسط و غیرمستقیم",
        "watering_requirement": "پس از خشک شدن کامل خاک؛ حدود هر ۱۴ روز",
        "care_difficulty": "easy",
        "ideal_temperature": "۱۸ تا ۲۸ درجه سانتی‌گراد",
        "care_tips": "از آبیاری زیاد و ماندن آب در زیرگلدانی جلوگیری کنید.",
        "delivery_notes": "گیاه و گلدان با بسته‌بندی محافظ و خاک تثبیت‌شده ارسال می‌شوند.",
        "price_per_bundle": 890_000,
        "stock_bundles": 14,
        "is_featured": True,
    },
    {
        "name": "سانسوریا شمشیری",
        "slug": "sword-sansevieria",
        "flower_type": "سانسوریا",
        "color": "سبز ابلق",
        "short_description": "سانسوریای کشیده و کم‌توقع مناسب فضاهای مدرن",
        "description": (
            "سانسوریا شمشیری گیاهی مقاوم با برگ‌های ایستاده است که تغییرات "
            "نور و فاصله طولانی میان دو آبیاری را به‌خوبی تحمل می‌کند."
        ),
        "plant_size": "متوسط",
        "plant_height_cm": 65,
        "quality_grade": "premium",
        "is_pet_friendly": False,
        "pot_included": True,
        "pot_material": "فایبرگلاس",
        "pot_color": "ذغالی",
        "pot_size_cm": 18,
        "pot_has_drainage": True,
        "light_requirement": "نور کم تا زیاد و غیرمستقیم",
        "watering_requirement": "پس از خشک شدن کامل خاک؛ حدود هر ۱۲ تا ۱۵ روز",
        "care_difficulty": "easy",
        "ideal_temperature": "۱۶ تا ۳۰ درجه سانتی‌گراد",
        "care_tips": "آب را روی برگ‌ها نریزید و در زمستان فاصله آبیاری را بیشتر کنید.",
        "delivery_notes": "برگ‌های بلند با پوشش محافظ و گلدان ثابت‌شده ارسال می‌شوند.",
        "price_per_bundle": 690_000,
        "stock_bundles": 18,
        "is_featured": True,
    },
    {
        "name": "فیکوس لیراتا",
        "slug": "fiddle-leaf-fig",
        "flower_type": "فیکوس",
        "color": "سبز تیره",
        "short_description": "گیاه دکوراتیو لوکس با برگ‌های بزرگ و ویولونی",
        "description": (
            "فیکوس لیراتا با برگ‌های پهن و فرم شاخص، نقطه کانونی زیبایی برای "
            "فضاهای روشن است و به نور و برنامه آبیاری پایدار نیاز دارد."
        ),
        "plant_size": "بزرگ",
        "plant_height_cm": 105,
        "quality_grade": "luxury",
        "is_pet_friendly": False,
        "pot_included": True,
        "pot_material": "فایبرگلاس",
        "pot_color": "کرم",
        "pot_size_cm": 28,
        "pot_has_drainage": True,
        "light_requirement": "نور زیاد و غیرمستقیم کنار پنجره",
        "watering_requirement": "پس از خشک شدن ۳ تا ۴ سانتی‌متر سطح خاک",
        "care_difficulty": "hard",
        "ideal_temperature": "۱۸ تا ۲۶ درجه سانتی‌گراد",
        "care_tips": "گیاه را از باد مستقیم دور نگه دارید و جای آن را مکرر تغییر ندهید.",
        "delivery_notes": "به‌دلیل ارتفاع گیاه، ارسال با بسته‌بندی ایستاده انجام می‌شود.",
        "price_per_bundle": 1_490_000,
        "stock_bundles": 7,
        "is_featured": True,
    },
    {
        "name": "پتوس ابلق",
        "slug": "variegated-pothos",
        "flower_type": "پتوس",
        "color": "سبز و کرم",
        "short_description": "گیاه رونده و سازگار با برگ‌های ابلق روشن",
        "description": (
            "پتوس ابلق گیاهی سریع‌الرشد و آسان‌نگهدار است که روی شلف یا به "
            "صورت آویز جلوه زیبایی دارد و با نور غیرمستقیم بهتر رشد می‌کند."
        ),
        "plant_size": "کوچک",
        "plant_height_cm": 35,
        "quality_grade": "standard",
        "is_pet_friendly": False,
        "pot_included": True,
        "pot_material": "پلاستیک فشرده",
        "pot_color": "سفید",
        "pot_size_cm": 16,
        "pot_has_drainage": True,
        "light_requirement": "نور متوسط و غیرمستقیم",
        "watering_requirement": "پس از خشک شدن ۲ تا ۳ سانتی‌متر سطح خاک",
        "care_difficulty": "easy",
        "ideal_temperature": "۱۸ تا ۲۹ درجه سانتی‌گراد",
        "care_tips": "برای پرپشت شدن، نوک ساقه‌ها را هرس کنید و از آفتاب مستقیم دور نگه دارید.",
        "delivery_notes": "ساقه‌های رونده برای جلوگیری از شکستگی جمع و محافظت می‌شوند.",
        "price_per_bundle": 490_000,
        "stock_bundles": 22,
        "is_featured": False,
    },
    {
        "name": "برگ انجیری",
        "slug": "monstera-deliciosa",
        "flower_type": "مونسترا",
        "color": "سبز",
        "short_description": "مونسترای چشمگیر با برگ‌های شکاف‌دار استوایی",
        "description": (
            "برگ انجیری با برگ‌های بزرگ و شکاف‌های طبیعی، حس‌وحال استوایی "
            "به محیط می‌دهد و در نور روشن غیرمستقیم رشد متعادلی دارد."
        ),
        "plant_size": "بزرگ",
        "plant_height_cm": 85,
        "quality_grade": "luxury",
        "is_pet_friendly": False,
        "pot_included": True,
        "pot_material": "سرامیک",
        "pot_color": "سبز زیتونی",
        "pot_size_cm": 26,
        "pot_has_drainage": True,
        "light_requirement": "نور روشن و غیرمستقیم",
        "watering_requirement": "پس از خشک شدن ۳ سانتی‌متر سطح خاک",
        "care_difficulty": "medium",
        "ideal_temperature": "۱۸ تا ۲۸ درجه سانتی‌گراد",
        "care_tips": "رطوبت متوسط فراهم کنید و برگ‌ها را ماهانه با دستمال مرطوب تمیز کنید.",
        "delivery_notes": "برگ‌ها و قیم گیاه جداگانه محافظت و گلدان ثابت می‌شود.",
        "price_per_bundle": 1_190_000,
        "stock_bundles": 9,
        "is_featured": True,
    },
)


def ensure_cut_flowers_category(category_model: Any):
    category, _ = category_model.objects.get_or_create(
        slug=CUT_FLOWERS_SLUG,
        defaults={
            "name": CUT_FLOWERS_NAME,
            "is_active": True,
            "sort_order": 0,
        },
    )
    return category


def ensure_indoor_plants_category(category_model: Any):
    category, _ = category_model.objects.get_or_create(
        slug=INDOOR_PLANTS_SLUG,
        defaults={
            "name": INDOOR_PLANTS_NAME,
            "description": INDOOR_PLANTS_DESCRIPTION,
            "is_active": True,
            "sort_order": 1,
        },
    )
    return category


def ensure_indoor_plant_products(product_model: Any, category: Any):
    plant_details_model = product_model._meta.apps.get_model(
        "products",
        "PlantDetails",
    )
    size_map = {
        "کوچک": "small",
        "متوسط": "medium",
        "بزرگ": "large",
    }
    products = []
    for seed in INDOOR_PLANT_PRODUCTS:
        plant_defaults = {
            "plant_type": seed["flower_type"],
            "color": seed["color"],
            "plant_size": size_map.get(seed["plant_size"], seed["plant_size"]),
            "approximate_height_cm": seed["plant_height_cm"],
            "quality_grade": seed["quality_grade"],
            "pet_friendly": seed["is_pet_friendly"],
            "pot_included": seed["pot_included"],
            "pot_material": seed["pot_material"],
            "pot_color": seed["pot_color"],
            "pot_size_cm": seed["pot_size_cm"],
            "has_drainage": seed["pot_has_drainage"],
            "light_requirement": "indirect",
            "watering_requirement": "low",
            "care_difficulty": seed["care_difficulty"],
            "ideal_temperature_min": 16,
            "ideal_temperature_max": 30,
            "care_notes": "\n".join(
                (
                    seed["care_tips"],
                    f"نیاز نوری: {seed['light_requirement']}",
                    f"نیاز آبیاری: {seed['watering_requirement']}",
                    f"دمای ایده‌آل: {seed['ideal_temperature']}",
                )
            ),
            "shipping_notes": seed["delivery_notes"],
        }
        defaults = {
            "name": seed["name"],
            "category": category,
            "product_type": "plant",
            "short_description": seed["short_description"],
            "description": seed["description"],
            "price": seed["price_per_bundle"],
            "stock_quantity": seed["stock_bundles"],
            "sale_unit": "pot",
            "unit_size": 1,
            "minimum_order_quantity": 1,
            "cover_image": None,
            "is_active": True,
            "is_featured": seed["is_featured"],
        }
        slug = seed["slug"]
        product, _ = product_model.objects.get_or_create(
            slug=slug,
            defaults=defaults,
        )
        plant_details_model.objects.get_or_create(
            product=product,
            defaults=plant_defaults,
        )
        products.append(product)
    return products
