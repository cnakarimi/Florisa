from typing import Any


CUT_FLOWERS_SLUG = "cut-flowers"
CUT_FLOWERS_NAME = "گل شاخه‌بریده"


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
