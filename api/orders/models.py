import uuid

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Q


class UserAddress(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="addresses",
        verbose_name="کاربر",
    )
    title = models.CharField("عنوان", max_length=80, blank=True)
    recipient_name = models.CharField("نام تحویل‌گیرنده", max_length=150)
    recipient_phone = models.CharField("شماره تحویل‌گیرنده", max_length=11)
    province = models.CharField("استان", max_length=80, default="تهران")
    city = models.CharField("شهر", max_length=80, default="تهران")
    district = models.CharField("منطقه یا محله", max_length=120, blank=True)
    address_line = models.CharField("نشانی", max_length=500)
    plaque = models.CharField("پلاک", max_length=20, blank=True)
    unit = models.CharField("واحد", max_length=20, blank=True)
    postal_code = models.CharField("کد پستی", max_length=10, blank=True)
    delivery_note = models.CharField("توضیحات تحویل", max_length=500, blank=True)
    is_default = models.BooleanField("نشانی پیش‌فرض", default=False)
    created_at = models.DateTimeField("زمان ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("زمان به‌روزرسانی", auto_now=True)

    class Meta:
        ordering = ("-is_default", "-updated_at")
        verbose_name = "نشانی کاربر"
        verbose_name_plural = "نشانی‌های کاربران"
        constraints = (
            models.UniqueConstraint(
                fields=("user",),
                condition=Q(is_default=True),
                name="one_default_address_per_user",
            ),
        )

    def __str__(self) -> str:
        return self.title or f"{self.recipient_name} - {self.address_line[:40]}"


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "در انتظار تأیید"
        CONFIRMED = "confirmed", "تأیید شده"
        PREPARING = "preparing", "در حال آماده‌سازی"
        OUT_FOR_DELIVERY = "out_for_delivery", "در مسیر ارسال"
        DELIVERED = "delivered", "تحویل شده"
        CANCELED = "canceled", "لغو شده"

    class PaymentMethod(models.TextChoices):
        CASH_ON_DELIVERY = "cash_on_delivery", "پرداخت در محل"

    class PaymentStatus(models.TextChoices):
        UNPAID = "unpaid", "پرداخت نشده"
        PAID = "paid", "پرداخت شده"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="orders",
        verbose_name="کاربر",
    )
    public_number = models.UUIDField(
        "شماره سفارش",
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
    )
    status = models.CharField(
        "وضعیت سفارش",
        max_length=24,
        choices=Status.choices,
        default=Status.PENDING,
    )
    payment_method = models.CharField(
        "روش پرداخت",
        max_length=24,
        choices=PaymentMethod.choices,
        default=PaymentMethod.CASH_ON_DELIVERY,
        editable=False,
    )
    payment_status = models.CharField(
        "وضعیت پرداخت",
        max_length=16,
        choices=PaymentStatus.choices,
        default=PaymentStatus.UNPAID,
    )
    subtotal = models.DecimalField(
        "جمع کالاها",
        max_digits=16,
        decimal_places=0,
        validators=[MinValueValidator(0)],
        editable=False,
    )
    delivery_fee = models.DecimalField(
        "هزینه ارسال",
        max_digits=16,
        decimal_places=0,
        validators=[MinValueValidator(0)],
        editable=False,
    )
    total = models.DecimalField(
        "مبلغ نهایی",
        max_digits=16,
        decimal_places=0,
        validators=[MinValueValidator(0)],
        editable=False,
    )
    address_title = models.CharField("عنوان نشانی", max_length=80, blank=True, editable=False)
    recipient_name = models.CharField("نام تحویل‌گیرنده", max_length=150, editable=False)
    recipient_phone = models.CharField("شماره تحویل‌گیرنده", max_length=11, editable=False)
    province = models.CharField("استان", max_length=80, editable=False)
    city = models.CharField("شهر", max_length=80, editable=False)
    district = models.CharField("منطقه یا محله", max_length=120, blank=True, editable=False)
    address_line = models.CharField("نشانی", max_length=500, editable=False)
    plaque = models.CharField("پلاک", max_length=20, blank=True, editable=False)
    unit = models.CharField("واحد", max_length=20, blank=True, editable=False)
    postal_code = models.CharField("کد پستی", max_length=10, blank=True, editable=False)
    delivery_note = models.CharField("توضیحات تحویل", max_length=500, blank=True, editable=False)
    customer_note = models.CharField("یادداشت مشتری", max_length=500, blank=True, editable=False)
    idempotency_key = models.UUIDField("شناسه درخواست", editable=False)
    created_at = models.DateTimeField("زمان ثبت", auto_now_add=True)
    updated_at = models.DateTimeField("زمان به‌روزرسانی", auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        verbose_name = "سفارش"
        verbose_name_plural = "سفارش‌ها"
        constraints = (
            models.UniqueConstraint(
                fields=("user", "idempotency_key"),
                name="unique_checkout_request_per_user",
            ),
            models.CheckConstraint(
                condition=Q(subtotal__gte=0) & Q(delivery_fee__gte=0) & Q(total__gte=0),
                name="order_totals_nonnegative",
            ),
        )

    def __str__(self) -> str:
        return str(self.public_number)


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name="سفارش",
    )
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.SET_NULL,
        related_name="order_items",
        null=True,
        blank=True,
        verbose_name="محصول",
    )
    product_name = models.CharField("نام محصول", max_length=180, editable=False)
    product_type = models.CharField("نوع محصول", max_length=20, editable=False)
    sale_unit = models.CharField("واحد فروش", max_length=20, editable=False)
    sale_unit_display = models.CharField("عنوان واحد فروش", max_length=40, editable=False)
    unit_size = models.PositiveIntegerField("تعداد در واحد", editable=False)
    quantity = models.PositiveIntegerField("تعداد", validators=[MinValueValidator(1)], editable=False)
    unit_price = models.DecimalField(
        "قیمت واحد",
        max_digits=16,
        decimal_places=0,
        validators=[MinValueValidator(0)],
        editable=False,
    )
    line_total = models.DecimalField(
        "جمع ردیف",
        max_digits=16,
        decimal_places=0,
        validators=[MinValueValidator(0)],
        editable=False,
    )
    cover_image = models.CharField("تصویر محصول", max_length=255, blank=True, editable=False)

    class Meta:
        ordering = ("id",)
        verbose_name = "قلم سفارش"
        verbose_name_plural = "اقلام سفارش"
        constraints = (
            models.UniqueConstraint(fields=("order", "product"), name="unique_product_per_order"),
            models.CheckConstraint(condition=Q(quantity__gte=1), name="order_item_quantity_positive"),
            models.CheckConstraint(
                condition=Q(unit_price__gte=0) & Q(line_total__gte=0),
                name="order_item_totals_nonnegative",
            ),
        )

    def __str__(self) -> str:
        return f"{self.product_name} × {self.quantity}"
