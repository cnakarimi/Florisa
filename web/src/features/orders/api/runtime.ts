import type { CartPreview, Order, PreviewItem, UserAddress } from "@/features/orders/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMoney(value: unknown): value is string {
  return typeof value === "string" && /^\d+$/.test(value);
}

export function isAddress(value: unknown): value is UserAddress {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.recipient_name === "string" &&
    typeof value.recipient_phone === "string" &&
    value.province === "تهران" &&
    value.city === "تهران" &&
    typeof value.title === "string" &&
    typeof value.district === "string" &&
    typeof value.address_line === "string" &&
    typeof value.plaque === "string" &&
    typeof value.unit === "string" &&
    typeof value.postal_code === "string" &&
    typeof value.delivery_note === "string" &&
    typeof value.is_default === "boolean" &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string"
  );
}

function isPreviewItem(value: unknown): value is PreviewItem {
  return (
    isRecord(value) &&
    typeof value.product_id === "number" &&
    typeof value.product_name === "string" &&
    (value.product_type === "plant" || value.product_type === "cut_flower") &&
    typeof value.sale_unit === "string" &&
    typeof value.sale_unit_display === "string" &&
    typeof value.unit_size === "number" &&
    typeof value.quantity === "number" &&
    isMoney(value.unit_price) &&
    isMoney(value.line_total) &&
    typeof value.cover_image === "string" &&
    typeof value.stock_quantity === "number" &&
    typeof value.minimum_order_quantity === "number"
  );
}

export function isCartPreview(value: unknown): value is CartPreview {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isPreviewItem) &&
    isMoney(value.subtotal) &&
    isMoney(value.delivery_fee) &&
    isMoney(value.total) &&
    value.payment_method === "cash_on_delivery" &&
    typeof value.payment_method_display === "string"
  );
}

export function isOrder(value: unknown): value is Order {
  const statuses = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "canceled"];
  return (
    isRecord(value) &&
    typeof value.public_number === "string" &&
    typeof value.status === "string" && statuses.includes(value.status) &&
    typeof value.status_display === "string" &&
    value.payment_method === "cash_on_delivery" &&
    typeof value.payment_method_display === "string" &&
    (value.payment_status === "unpaid" || value.payment_status === "paid") &&
    typeof value.payment_status_display === "string" &&
    isMoney(value.subtotal) &&
    isMoney(value.delivery_fee) &&
    isMoney(value.total) &&
    typeof value.recipient_name === "string" &&
    typeof value.recipient_phone === "string" &&
    typeof value.province === "string" &&
    typeof value.city === "string" &&
    typeof value.district === "string" &&
    typeof value.address_line === "string" &&
    typeof value.address_title === "string" &&
    typeof value.plaque === "string" &&
    typeof value.unit === "string" &&
    typeof value.postal_code === "string" &&
    typeof value.delivery_note === "string" &&
    typeof value.customer_note === "string" &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string" &&
    Array.isArray(value.items) &&
    value.items.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === "number" &&
        (typeof item.product === "number" || item.product === null) &&
        typeof item.product_name === "string" &&
        (item.product_type === "plant" || item.product_type === "cut_flower") &&
        typeof item.sale_unit === "string" &&
        typeof item.sale_unit_display === "string" &&
        typeof item.unit_size === "number" &&
        typeof item.quantity === "number" &&
        isMoney(item.unit_price) &&
        isMoney(item.line_total) &&
        typeof item.cover_image === "string",
    )
  );
}
