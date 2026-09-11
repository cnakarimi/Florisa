import type { CartItem, CartProductSnapshot } from "./types.ts";
import type { CatalogProduct } from "@/features/catalog/types";

export function normalizeCartQuantity(
  product: CartProductSnapshot,
  quantity: number,
): number | null {
  if (!product.is_available || !product.is_in_stock) return null;
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
  const existing = items.find((item) => item.product.id === snapshot.id);
  const quantity = normalizeCartQuantity(
    snapshot,
    (existing?.quantity ?? 0) + increment,
  );
  if (!quantity) return items;
  if (!existing) return [...items, { product: snapshot, quantity }];
  return items.map((item) =>
    item.product.id === snapshot.id ? { product: snapshot, quantity } : item,
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
  productId: number,
  requestedQuantity: number,
): CartItem[] {
  if (!Number.isFinite(requestedQuantity)) {
    return items;
  }

  return items.flatMap((item) => {
    if (item.product.id !== productId) {
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

    const quantity = normalizeCartQuantity(item.product, requested);

    return quantity ? [{ ...item, quantity }] : [item];
  });
}

export function productToCartSnapshot(
  product: CatalogProduct,
): CartProductSnapshot {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    cover_image: product.cover_image,
    price: product.price,
    unit_size: product.unit_size,
    stock_quantity: product.stock_quantity,
    minimum_order_quantity: product.minimum_order_quantity,
    sale_unit: product.sale_unit,
    sale_unit_display: product.sale_unit_display,
    product_type: product.product_type,
    product_identity:
      product.product_type === "plant"
        ? (product.details?.plant_type ?? "")
        : (product.details?.flower_type ?? ""),
    color: product.details?.color ?? "",
    is_in_stock: product.is_in_stock,
    is_available: true,
  };
}

export function isCartItemValid(item: CartItem): boolean {
  const minimum = Math.max(1, Math.trunc(item.product.minimum_order_quantity));

  const stock = Math.max(0, Math.trunc(item.product.stock_quantity));

  return (
    item.product.is_available &&
    item.product.is_in_stock &&
    Number.isInteger(item.quantity) &&
    item.quantity >= minimum &&
    item.quantity <= stock
  );
}
