from dataclasses import dataclass
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework.exceptions import ValidationError

from orders.models import Order, OrderItem, UserAddress
from products.models import CutFlowerVariant, Product


@dataclass(frozen=True)
class ValidatedLine:
    product: Product
    variant: CutFlowerVariant | None
    quantity: int
    unit_price: Decimal
    line_total: Decimal


def delivery_fee_for(*, address: UserAddress, subtotal: Decimal) -> Decimal:
    del address, subtotal
    return Decimal("0")


def validate_products(items: list[dict], *, lock: bool) -> list[ValidatedLine]:
    product_ids = sorted({item["product_id"] for item in items})
    queryset = Product.objects.filter(pk__in=product_ids).select_related("category").order_by("pk")
    if lock:
        queryset = queryset.select_for_update()
    products = {product.pk: product for product in queryset}
    requested_variant_ids = sorted(
        {item["variant_id"] for item in items if item.get("variant_id") is not None}
    )
    variant_queryset = CutFlowerVariant.objects.filter(pk__in=requested_variant_ids).order_by("pk")
    if lock:
        variant_queryset = variant_queryset.select_for_update()
    variants = {variant.pk: variant for variant in variant_queryset}

    legacy_product_ids = sorted(
        {
            item["product_id"]
            for item in items
            if item.get("variant_id") is None
            and products.get(item["product_id"])
            and products[item["product_id"]].product_type == Product.ProductType.CUT_FLOWER
        }
    )
    legacy_queryset = CutFlowerVariant.objects.filter(
        product_id__in=legacy_product_ids, is_active=True
    ).order_by("product_id", "pk")
    if lock:
        legacy_queryset = legacy_queryset.select_for_update()
    legacy_variants: dict[int, list[CutFlowerVariant]] = {}
    for variant in legacy_queryset:
        legacy_variants.setdefault(variant.product_id, []).append(variant)
    errors = []
    lines = []
    resolved_identities = set()
    for item in items:
        product_id = item["product_id"]
        quantity = item["quantity"]
        requested_variant_id = item.get("variant_id")
        product = products.get(product_id)
        variant = variants.get(requested_variant_id) if requested_variant_id is not None else None
        message = None
        if product is None:
            message = "محصول پیدا نشد."
        elif not product.is_active or not product.category.is_active:
            message = "این محصول در حال حاضر قابل سفارش نیست."
        elif product.product_type == Product.ProductType.CUT_FLOWER:
            if requested_variant_id is None:
                candidates = legacy_variants.get(product_id, [])
                if len(candidates) == 1:
                    variant = candidates[0]
                elif not candidates:
                    message = "این محصول تنوع رنگ فعال ندارد."
                else:
                    message = "انتخاب رنگ برای این محصول الزامی است."
            elif variant is None or variant.product_id != product_id:
                message = "تنوع رنگ انتخاب‌شده متعلق به این محصول نیست."
            elif not variant.is_active:
                message = "تنوع رنگ انتخاب‌شده غیرفعال است."
        elif requested_variant_id is not None:
            message = "تنوع رنگ برای این نوع محصول مجاز نیست."

        stock_quantity = variant.stock_quantity if variant is not None else product.stock_quantity
        resolved_identity = (product_id, variant.pk if variant else None)
        if message is None and resolved_identity in resolved_identities:
            message = "هر محصول و تنوع رنگ باید فقط یک‌بار در سبد ارسال شود."
        if message is None and stock_quantity <= 0:
            message = "این محصول ناموجود است."
        elif message is None and quantity < product.minimum_order_quantity:
            message = f"حداقل تعداد سفارش {product.minimum_order_quantity} {product.get_sale_unit_display()} است."
        elif message is None and quantity > stock_quantity:
            message = f"تنها {stock_quantity} {product.get_sale_unit_display()} موجود است."
        if message:
            errors.append(
                {"product_id": product_id, "variant_id": requested_variant_id, "message": message}
            )
            continue
        resolved_identities.add(resolved_identity)
        unit_price = Decimal(variant.price if variant is not None else product.price)
        lines.append(
            ValidatedLine(
                product=product,
                variant=variant,
                quantity=quantity,
                unit_price=unit_price,
                line_total=unit_price * quantity,
            )
        )
    if errors:
        raise ValidationError({"detail": "برخی اقلام سبد خرید معتبر نیستند.", "item_errors": errors})
    return lines


def preview_cart(*, user, items: list[dict], address: UserAddress | None = None) -> dict:
    del user
    lines = validate_products(items, lock=False)
    subtotal = sum((line.line_total for line in lines), Decimal("0"))
    fee = delivery_fee_for(address=address, subtotal=subtotal) if address else Decimal("0")
    return {
        "items": [
            {
                "product_id": line.product.pk,
                "variant_id": line.variant.pk if line.variant else None,
                "variant_color": line.variant.color if line.variant else "",
                "product_name": line.product.name,
                "product_type": line.product.product_type,
                "sale_unit": line.product.sale_unit,
                "sale_unit_display": line.product.get_sale_unit_display(),
                "unit_size": line.product.unit_size,
                "quantity": line.quantity,
                "unit_price": str(line.unit_price.quantize(Decimal("1"))),
                "line_total": str(line.line_total.quantize(Decimal("1"))),
                "cover_image": line.product.cover_image or "",
                "stock_quantity": (
                    line.variant.stock_quantity if line.variant else line.product.stock_quantity
                ),
                "minimum_order_quantity": line.product.minimum_order_quantity,
            }
            for line in lines
        ],
        "subtotal": str(subtotal.quantize(Decimal("1"))),
        "delivery_fee": str(fee.quantize(Decimal("1"))),
        "total": str((subtotal + fee).quantize(Decimal("1"))),
        "payment_method": Order.PaymentMethod.CASH_ON_DELIVERY,
        "payment_method_display": Order.PaymentMethod.CASH_ON_DELIVERY.label,
    }


@transaction.atomic
def create_order(*, user, address_id: int, items: list[dict], idempotency_key, customer_note: str = ""):
    get_user_model().objects.select_for_update().get(pk=user.pk)
    existing = (
        Order.objects.filter(user=user, idempotency_key=idempotency_key)
        .prefetch_related("items")
        .first()
    )
    if existing:
        return existing, False
    try:
        address = UserAddress.objects.select_for_update().get(pk=address_id, user=user)
    except UserAddress.DoesNotExist as exc:
        raise ValidationError({"address_id": "نشانی انتخاب‌شده معتبر نیست."}) from exc
    lines = validate_products(items, lock=True)
    subtotal = sum((line.line_total for line in lines), Decimal("0"))
    fee = delivery_fee_for(address=address, subtotal=subtotal)
    order = Order.objects.create(
        user=user,
        idempotency_key=idempotency_key,
        subtotal=subtotal,
        delivery_fee=fee,
        total=subtotal + fee,
        address_title=address.title,
        recipient_name=address.recipient_name,
        recipient_phone=address.recipient_phone,
        province=address.province,
        city=address.city,
        district=address.district,
        address_line=address.address_line,
        plaque=address.plaque,
        unit=address.unit,
        postal_code=address.postal_code,
        delivery_note=address.delivery_note,
        customer_note=customer_note.strip(),
    )
    OrderItem.objects.bulk_create(
        [
            OrderItem(
                order=order,
                product=line.product,
                variant=line.variant,
                variant_id_snapshot=line.variant.pk if line.variant else None,
                variant_color=line.variant.color if line.variant else "",
                product_name=line.product.name,
                product_type=line.product.product_type,
                sale_unit=line.product.sale_unit,
                sale_unit_display=line.product.get_sale_unit_display(),
                unit_size=line.product.unit_size,
                quantity=line.quantity,
                unit_price=line.unit_price,
                line_total=line.line_total,
                cover_image=line.product.cover_image or "",
            )
            for line in lines
        ]
    )
    for line in lines:
        if line.variant is not None:
            line.variant.stock_quantity -= line.quantity
            line.variant.save(update_fields=("stock_quantity", "updated_at"))
        else:
            line.product.stock_quantity -= line.quantity
            line.product.save(update_fields=("stock_quantity", "updated_at"))
    return order, True
