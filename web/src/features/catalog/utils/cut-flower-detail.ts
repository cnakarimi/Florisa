import type { CutFlowerProduct, CutFlowerQuantity, CutFlowerVariant } from "../types.ts";

export function stepBundleQuantity(quantity: number, direction: 1 | -1, minimum: number, stock: number): number {
  const min = Math.max(1, Math.trunc(minimum));
  if (direction === -1) return quantity <= min ? 0 : quantity - 1;
  const next = quantity === 0 ? min : quantity + 1;
  return next <= stock ? next : quantity;
}

export function cutFlowerLineError(product: CutFlowerProduct, variant: CutFlowerVariant | undefined, quantity: number): string {
  if (!variant || !variant.is_active) return "رنگ انتخاب‌شده حذف یا غیرفعال شده است؛ انتخاب آن را پاک کنید.";
  if (!product.is_in_stock || !variant.is_in_stock || variant.stock_quantity < product.minimum_order_quantity) return "این رنگ در حال حاضر ناموجود است.";
  if (!Number.isInteger(quantity) || quantity < product.minimum_order_quantity) return `حداقل سفارش این رنگ ${product.minimum_order_quantity} دسته است.`;
  if (quantity > variant.stock_quantity) return `موجودی این رنگ ${variant.stock_quantity} دسته است؛ تعداد را کاهش دهید.`;
  return "";
}

export function getCutFlowerPurchase(product: CutFlowerProduct, quantities: Record<number, number>) {
  const selection: CutFlowerQuantity[] = Object.entries(quantities)
    .filter(([, quantity]) => quantity !== 0)
    .map(([id, quantity]) => ({ variantId: Number(id), quantity }));
  const lines = selection.map(line => {
    const variant = product.details?.variants.find(variant => variant.id === line.variantId);
    return { ...line, variant, error: cutFlowerLineError(product, variant, line.quantity), total: line.quantity * (variant?.price ?? 0) };
  });
  const bundles = selection.reduce((sum, line) => sum + line.quantity, 0);
  return {
    selection, lines, bundles,
    stems: bundles * product.unit_size,
    total: lines.reduce((sum, line) => sum + line.total, 0),
    canAdd: lines.length > 0 && lines.every(line => !line.error),
  };
}

export function cutFlowerAttributes(product: CutFlowerProduct) {
  const details = product.details;
  return [
    { label: "طول ساقه", value: details?.stem_length_cm != null ? `${details.stem_length_cm} سانت` : "" },
    { label: "میزان بازشدگی", value: details?.bloom_opening_stage_display ?? "" },
    { label: "بسته‌بندی", value: `${product.unit_size} شاخه` },
    { label: "کیفیت", value: details?.flower_grade_display ?? "", emphasized: true },
  ].filter(row => row.value);
}
