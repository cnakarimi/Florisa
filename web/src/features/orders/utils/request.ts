import type { CheckoutItemInput } from "@/features/orders/types";

interface CartItemLike {
  product: {
    id: number;
    variant_id: number | null;
    pot_option_id?: number | null;
    product_type?: string;
  };
  quantity: number;
}

export function mapCartToCheckoutItems(
  items: CartItemLike[],
): CheckoutItemInput[] {
  return items.map((item) => ({
    product_id: item.product.id,
    ...(item.product.product_type === "plant" || item.product.pot_option_id != null ? { pot_option_id: item.product.pot_option_id ?? null } : {}),
    ...(item.product.variant_id !== null
      ? { variant_id: item.product.variant_id }
      : {}),
    quantity: item.quantity,
  }));
}

export async function completeCheckout<T>(
  request: () => Promise<T>,
  clearCart: () => void,
): Promise<T> {
  const result = await request();

  clearCart();

  return result;
}
