import type { CheckoutItemInput } from "@/features/orders/types";

interface CartItemLike {
  product: {
    id: number;
  };
  quantity: number;
}

export function mapCartToCheckoutItems(
  items: CartItemLike[],
): CheckoutItemInput[] {
  return items.map((item) => ({
    product_id: item.product.id,
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
