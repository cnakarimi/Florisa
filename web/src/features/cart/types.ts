import type { CatalogProduct } from "@/features/catalog/types";
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
        ? product.details?.plant_type ?? ""
        : product.details?.flower_type ?? "",
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
