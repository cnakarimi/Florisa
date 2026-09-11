import type { ProductType, SaleUnit } from "@/features/catalog/types";

export const CART_STORAGE_KEY = "florisa_cart_v1";

export const CART_STORAGE_VERSION = 1;

export interface CartProductSnapshot {
  id: number;
  slug: string;
  name: string;
  cover_image: string | null;

  price: number;
  unit_size: number;

  stock_quantity: number;
  minimum_order_quantity: number;

  sale_unit: SaleUnit;
  sale_unit_display: string;

  product_type: ProductType;
  product_identity: string;
  color: string;

  is_in_stock: boolean;
  is_available: boolean;
}

export interface CartItem {
  product: CartProductSnapshot;
  quantity: number;
}

export interface StoredCart {
  version: typeof CART_STORAGE_VERSION;
  items: CartItem[];
}

export interface CartRefreshResult {
  items: CartItem[];
  isValid: boolean;
  error: string | null;
}
