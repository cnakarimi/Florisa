import {
  CART_STORAGE_KEY,
  CART_STORAGE_VERSION,
  type CartItem,
  type CartProductSnapshot,
  type StoredCart,
} from "./types.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isCartProductSnapshot(value: unknown): value is CartProductSnapshot {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isFiniteNumber(value.id) &&
    value.id > 0 &&
    typeof value.slug === "string" &&
    Boolean(value.slug) &&
    typeof value.name === "string" &&
    (typeof value.cover_image === "string" || value.cover_image === null) &&
    (isFiniteNumber(value.price) || isFiniteNumber(value.price_per_bundle)) &&
    (isFiniteNumber(value.unit_size) || isFiniteNumber(value.stems_per_bundle)) &&
    (isFiniteNumber(value.stock_quantity) || isFiniteNumber(value.stock_bundles)) &&
    (isFiniteNumber(value.minimum_order_quantity) || isFiniteNumber(value.minimum_order_bundles)) &&
    (typeof value.product_identity === "string" || typeof value.flower_type === "string") &&
    typeof value.color === "string" &&
    typeof value.is_in_stock === "boolean" &&
    typeof value.is_available === "boolean"
  );
}

function isCartItem(value: unknown): value is CartItem {
  return (
    isRecord(value) &&
    isCartProductSnapshot(value.product) &&
    isFiniteNumber(value.quantity) &&
    value.quantity >= 1
  );
}

function normalizeStoredItem(item: CartItem): CartItem {
  const legacy = item.product as CartProductSnapshot & Record<string, unknown>;
  const price = Number(legacy.price ?? legacy.price_per_bundle);
  const unitSize = Number(legacy.unit_size ?? legacy.stems_per_bundle);
  const stockQuantity = Number(legacy.stock_quantity ?? legacy.stock_bundles);
  const minimumQuantity = Number(
    legacy.minimum_order_quantity ?? legacy.minimum_order_bundles,
  );
  const minimum = Math.max(
    1,
    Math.trunc(minimumQuantity),
  );
  const stock = Math.max(0, Math.trunc(stockQuantity));
  const requested = Math.max(1, Math.trunc(item.quantity));
  const canMeetMinimum =
    item.product.is_available &&
    item.product.is_in_stock &&
    stock >= minimum;

  return {
    product: {
      ...item.product,
      id: Math.trunc(item.product.id),
      price: Math.max(0, price),
      unit_size: Math.max(
        0,
        Math.trunc(unitSize),
      ),
      stock_quantity: stock,
      minimum_order_quantity: minimum,
      sale_unit: legacy.sale_unit ?? "bunch",
      sale_unit_display:
        typeof legacy.sale_unit_display === "string"
          ? legacy.sale_unit_display
          : "دسته",
      product_type: legacy.product_type ?? "cut_flower",
      product_identity: String(
        legacy.product_identity ?? legacy.flower_type ?? "",
      ),
    },
    quantity: canMeetMinimum
      ? Math.min(stock, Math.max(minimum, requested))
      : requested,
  };
}

export function parseStoredCart(rawValue: string | null): CartItem[] {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(rawValue);
    if (
      !isRecord(parsed) ||
      parsed.version !== CART_STORAGE_VERSION ||
      !Array.isArray(parsed.items)
    ) {
      return [];
    }

    const uniqueItems = new Map<number, CartItem>();
    for (const rawItem of parsed.items) {
      if (!isCartItem(rawItem)) {
        continue;
      }
      uniqueItems.set(
        Math.trunc(rawItem.product.id),
        normalizeStoredItem(rawItem),
      );
    }

    return Array.from(uniqueItems.values());
  } catch {
    return [];
  }
}

export function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY));
  } catch {
    return [];
  }
}

export function writeStoredCart(items: CartItem[]): void {
  if (typeof window === "undefined") {
    return;
  }

  const storedCart: StoredCart = {
    version: CART_STORAGE_VERSION,
    items,
  };

  try {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(storedCart),
    );
  } catch {
    // The in-memory cart remains usable when storage is unavailable.
  }
}
