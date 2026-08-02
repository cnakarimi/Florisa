import type { CatalogProduct } from "@/features/catalog/types";
import {
  getProductColor,
  getProductIdentity,
} from "@/features/catalog/utils/product";

export const CART_STORAGE_KEY = "florisa_cart_v1";
export const CART_STORAGE_VERSION = 1;

export interface CartProductSnapshot {
  id: number;
  slug: string;
  name: string;
  cover_image: string | null;
  price_per_bundle: number;
  stems_per_bundle: number;
  stock_bundles: number;
  minimum_order_bundles: number;
  flower_type: string;
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

export function productToCartSnapshot(
  product: CatalogProduct,
): CartProductSnapshot {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    cover_image: product.cover_image,
    price_per_bundle: product.price,
    stems_per_bundle: product.unit_size,
    stock_bundles: product.stock_quantity,
    minimum_order_bundles: product.minimum_order_quantity,
    flower_type: getProductIdentity(product),
    color: getProductColor(product),
    is_in_stock: product.is_in_stock,
    is_available: true,
  };
}

export function isCartItemValid(item: CartItem): boolean {
  const minimum = Math.max(1, Math.trunc(item.product.minimum_order_bundles));
  const stock = Math.max(0, Math.trunc(item.product.stock_bundles));

  return (
    item.product.is_available &&
    item.product.is_in_stock &&
    Number.isInteger(item.quantity) &&
    item.quantity >= minimum &&
    item.quantity <= stock
  );
}
