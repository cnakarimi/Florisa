import type { CartItem, CartProductSnapshot } from "./types.ts";

export function normalizeCartQuantity(product: CartProductSnapshot, quantity: number): number | null {
  if (!product.is_available || !product.is_in_stock) return null;
  const minimum = Math.max(1, Math.trunc(product.minimum_order_quantity));
  const stock = Math.max(0, Math.trunc(product.stock_quantity));
  if (stock < minimum) return null;
  return Math.min(stock, Math.max(minimum, Math.trunc(quantity)));
}

export function addCartSnapshot(items: CartItem[], snapshot: CartProductSnapshot, requestedQuantity?: number): CartItem[] {
  const increment = Math.max(snapshot.minimum_order_quantity, Math.trunc(requestedQuantity ?? snapshot.minimum_order_quantity));
  const existing = items.find((item) => item.product.id === snapshot.id);
  const quantity = normalizeCartQuantity(snapshot, (existing?.quantity ?? 0) + increment);
  if (!quantity) return items;
  if (!existing) return [...items, { product: snapshot, quantity }];
  return items.map((item) => item.product.id === snapshot.id ? { product: snapshot, quantity } : item);
}

export function calculateCartTotals(items: CartItem[]): { totalQuantity: number; subtotal: number } {
  return items.reduce(
    (summary, item) => ({
      totalQuantity: summary.totalQuantity + item.quantity,
      subtotal: summary.subtotal + item.quantity * item.product.price,
    }),
    { totalQuantity: 0, subtotal: 0 },
  );
}
