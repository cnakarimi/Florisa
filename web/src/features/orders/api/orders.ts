import { apiRequest, ApiError } from "@/lib/api/client";
import type {
  AddressInput,
  CartPreview,
  CheckoutItemInput,
  Order,
  UserAddress,
} from "@/features/orders/types";
import { isAddress, isCartPreview, isOrder } from "./runtime";
export { mapCartToCheckoutItems } from "@/features/orders/utils/request";

const INVALID_RESPONSE = "پاسخ دریافتی از سرور معتبر نیست.";

export async function listAddresses(): Promise<UserAddress[]> {
  const data = await apiRequest<unknown>("/api/addresses/");
  if (!Array.isArray(data) || !data.every(isAddress)) throw new ApiError(INVALID_RESPONSE, 502);
  return data;
}

export async function createAddress(input: AddressInput): Promise<UserAddress> {
  const data = await apiRequest<unknown>("/api/addresses/", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!isAddress(data)) throw new ApiError(INVALID_RESPONSE, 502);
  return data;
}

export async function previewCart(items: CheckoutItemInput[]): Promise<CartPreview> {
  const data = await apiRequest<unknown>("/api/orders/preview/", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
  if (!isCartPreview(data)) throw new ApiError(INVALID_RESPONSE, 502);
  return data;
}

export async function submitOrder(input: {
  address_id: number;
  items: CheckoutItemInput[];
  idempotency_key: string;
  customer_note?: string;
}): Promise<Order> {
  const data = await apiRequest<unknown>("/api/orders/", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!isOrder(data)) throw new ApiError(INVALID_RESPONSE, 502);
  return data;
}

export async function listOrders(): Promise<Order[]> {
  const data = await apiRequest<unknown>("/api/orders/");
  if (!Array.isArray(data) || !data.every(isOrder)) throw new ApiError(INVALID_RESPONSE, 502);
  return data;
}

export async function getOrder(publicNumber: string): Promise<Order> {
  const data = await apiRequest<unknown>(`/api/orders/${encodeURIComponent(publicNumber)}/`);
  if (!isOrder(data)) throw new ApiError(INVALID_RESPONSE, 502);
  return data;
}
