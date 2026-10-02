import type { CartItem, CartLineId, CartProductSnapshot } from "./types.ts";
import type { CatalogProduct, CutFlowerVariant } from "@/features/catalog/types";

export function makeCartLineId(productId: number, variantId: number | null): CartLineId {
  return `${productId}:${variantId ?? "base"}`;
}

export function resolveCutFlowerVariant(
  product: CatalogProduct,
  variantId: number | null,
): { variant: CutFlowerVariant | null; message: string } {
  if (product.product_type !== "cut_flower") {
    return { variant: null, message: "" };
  }
  const activeVariants = product.details?.variants.filter(
    (variant) => variant.is_active,
  ) ?? [];
  if (variantId !== null) {
    return {
      variant: activeVariants.find((variant) => variant.id === variantId) ?? null,
      message: activeVariants.some((variant) => variant.id === variantId)
        ? ""
        : "رنگ انتخاب‌شده حذف یا غیرفعال شده است؛ رنگ را دوباره انتخاب کنید.",
    };
  }
  if (activeVariants.length === 1) {
    return { variant: activeVariants[0], message: "" };
  }
  return {
    variant: null,
    message: activeVariants.length > 1
      ? "این گل چند رنگ دارد؛ لطفاً رنگ را دوباره انتخاب کنید."
      : "این گل در حال حاضر رنگ فعالی ندارد.",
  };
}

export function normalizeCartQuantity(
  product: CartProductSnapshot,
  quantity: number,
): number | null {
  if (
    !product.is_available ||
    !product.is_in_stock ||
    product.requires_variant_selection ||
    Boolean(product.validation_message)
  ) return null;
  const minimum = Math.max(1, Math.trunc(product.minimum_order_quantity));
  const stock = Math.max(0, Math.trunc(product.stock_quantity));
  if (stock < minimum) return null;
  return Math.min(stock, Math.max(minimum, Math.trunc(quantity)));
}

export function addCartSnapshot(
  items: CartItem[],
  snapshot: CartProductSnapshot,
  requestedQuantity?: number,
): CartItem[] {
  const increment = Math.max(
    snapshot.minimum_order_quantity,
    Math.trunc(requestedQuantity ?? snapshot.minimum_order_quantity),
  );
  const lineId = makeCartLineId(snapshot.id, snapshot.variant_id);
  const existing = items.find((item) => item.line_id === lineId);
  const quantity = normalizeCartQuantity(
    snapshot,
    (existing?.quantity ?? 0) + increment,
  );
  if (!quantity) return items;
  if (!existing) return [...items, { line_id: lineId, product: snapshot, quantity }];
  return items.map((item) =>
    item.line_id === lineId ? { line_id: lineId, product: snapshot, quantity } : item,
  );
}

export function calculateCartTotals(items: CartItem[]): {
  totalQuantity: number;
  subtotal: number;
} {
  return items.reduce(
    (summary, item) => ({
      totalQuantity: summary.totalQuantity + item.quantity,
      subtotal: summary.subtotal + item.quantity * item.product.price,
    }),
    { totalQuantity: 0, subtotal: 0 },
  );
}
export function setCartItemQuantity(
  items: CartItem[],
  lineId: CartLineId,
  requestedQuantity: number,
): CartItem[] {
  if (!Number.isFinite(requestedQuantity)) {
    return items;
  }

  return items.flatMap((item) => {
    if (item.line_id !== lineId) {
      return [item];
    }

    const minimum = Math.max(
      1,
      Math.trunc(item.product.minimum_order_quantity),
    );

    const requested = Math.trunc(requestedQuantity);

    if (requested < minimum) {
      return [];
    }

    const correctedProduct = {
      ...item.product,
      validation_message: "",
    };
    const quantity = normalizeCartQuantity(correctedProduct, requested);

    return quantity ? [{ ...item, product: correctedProduct, quantity }] : [item];
  });
}

export function productToCartSnapshot(
  product: CatalogProduct,
  variant: CutFlowerVariant | null = null,
): CartProductSnapshot {
  const isCutFlower = product.product_type === "cut_flower";
  const selectedVariant = isCutFlower ? variant : null;
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    cover_image: product.cover_image,
    price: selectedVariant?.price ?? product.price,
    unit_size: product.unit_size,
    stock_quantity: selectedVariant?.stock_quantity ?? product.stock_quantity,
    minimum_order_quantity: product.minimum_order_quantity,
    sale_unit: product.sale_unit,
    sale_unit_display: product.sale_unit_display,
    product_type: product.product_type,
    product_identity:
      product.product_type === "plant"
        ? (product.details?.plant_type ?? "")
        : product.product_type === "cut_flower"
          ? (product.details?.flower_type ?? "")
          : (product.details?.arrangement_type_display ?? ""),
    color:
      selectedVariant?.color ??
      (product.product_type === "plant" ? (product.details?.color ?? "") : ""),
    variant_id: selectedVariant?.id ?? null,
    requires_variant_selection: isCutFlower && !selectedVariant,
    validation_message:
      isCutFlower && !selectedVariant ? "لطفاً رنگ گل را دوباره انتخاب کنید." : "",
    is_in_stock: selectedVariant?.is_in_stock ?? product.is_in_stock,
    is_available: true,
  };
}

export function isCartItemValid(item: CartItem): boolean {
  const minimum = Math.max(1, Math.trunc(item.product.minimum_order_quantity));

  const stock = Math.max(0, Math.trunc(item.product.stock_quantity));

  return (
    item.product.is_available &&
    item.product.is_in_stock &&
    !item.product.requires_variant_selection &&
    !item.product.validation_message &&
    Number.isInteger(item.quantity) &&
    item.quantity >= minimum &&
    item.quantity <= stock
  );
}
