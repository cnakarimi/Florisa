BASELINE_POT_NAME = "گلدان پلاستیکی پایه"


def pot_attributes(pot):
    return {"material": pot.material, "color": pot.color,
            "diameter_cm": pot.diameter_cm, "height_cm": pot.height_cm}


def uploaded_url(field, request=None):
    if not field:
        return None
    url = field.url
    return request.build_absolute_uri(url) if request else url


def plant_pot_options(product, request=None):
    minimum = product.minimum_order_quantity
    baseline = {"id": None, "pot_id": None, "name": BASELINE_POT_NAME,
                "is_baseline": True, "additional_price": 0, "unit_price": product.price,
                "image": None, "configuration_image": None, "attributes": {"material": "پلاستیک"},
                "is_available": product.stock_quantity >= minimum,
                "max_quantity": product.stock_quantity}
    options = []
    for assignment in product.pot_assignments.all():
        pot = assignment.pot
        limit = min(product.stock_quantity, pot.stock_quantity)
        if not assignment.is_active or not pot.is_active or limit < minimum:
            continue
        options.append({"id": assignment.pk, "pot_id": pot.pk, "name": pot.name,
                        "is_baseline": False, "additional_price": assignment.additional_price,
                        "unit_price": product.price + assignment.additional_price,
                        "image": uploaded_url(pot.image, request),
                        "configuration_image": uploaded_url(assignment.combination_image, request),
                        "attributes": pot_attributes(pot), "is_available": True, "max_quantity": limit})
    preferred = getattr(getattr(product, "plant_details", None), "initial_pot_assignment_id", None)
    initial = next((option["id"] for option in options if option["id"] == preferred),
                   options[0]["id"] if options else None)
    return [baseline, *options], initial
