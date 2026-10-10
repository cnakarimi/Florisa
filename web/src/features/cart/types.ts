import type { ProductType, SaleUnit } from "@/features/catalog/types";

export const CART_STORAGE_KEY = "florisa_cart_v3";
export const PREVIOUS_CART_STORAGE_KEY = "florisa_cart_v2";
export const LEGACY_CART_STORAGE_KEY = "florisa_cart_v1";

export const CART_STORAGE_VERSION = 3;

export type CartLineId = string;

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
  variant_id: number | null;
  pot_option_id?: number | null;
  pot_id?: number | null;
  pot_name?: string;
  pot_surcharge?: number;
  configuration_image?: string | null;
  requires_pot_selection?: boolean;
  requires_variant_selection: boolean;
  validation_message: string;

  is_in_stock: boolean;
  is_available: boolean;
}

export interface CartItem {
  line_id: CartLineId;
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
