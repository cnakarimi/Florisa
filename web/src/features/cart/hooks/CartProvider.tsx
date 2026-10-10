"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getProductDetail } from "@/features/catalog/api/catalog";
import type { CatalogProduct } from "@/features/catalog/types";
import {
  addCartSnapshot,
  calculateCartTotals,
  isCartItemValid,
  makeCartLineId,
  productToCartSnapshot,
  resolveCutFlowerVariant,
  resolvePlantPotOption,
  setCartItemQuantity,
} from "@/features/cart/logic";
import { readStoredCart, writeStoredCart } from "@/features/cart/storage";
import {
  CART_STORAGE_KEY,
  type CartItem,
  type CartLineId,
  type CartRefreshResult,
} from "@/features/cart/types";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";

const REFRESH_TTL_MS = 60_000;

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalQuantity: number;
  subtotal: number;

  isHydrated: boolean;
  isRefreshing: boolean;
  refreshError: string | null;
  hasInvalidItems: boolean;

  addItem: (product: CatalogProduct, quantity?: number, variantId?: number, potOptionId?: number | null) => void;
  removeItem: (lineId: CartLineId) => void;
  increaseItem: (lineId: CartLineId) => void;
  decreaseItem: (lineId: CartLineId) => void;
  setQuantity: (lineId: CartLineId, quantity: number) => void;
  clearCart: () => void;

  hasItem: (productId: number, variantId?: number) => boolean;
  getItemQuantity: (productId: number, variantId?: number) => number;

  refreshCartItems: (force?: boolean) => Promise<CartRefreshResult>;
}

const CartContext = createContext<CartContextValue | null>(null);

function cartResult(
  items: CartItem[],
  error: string | null = null,
): CartRefreshResult {
  return {
    items,
    isValid: !error && items.length > 0 && items.every(isCartItemValid),
    error,
  };
}

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const refreshPromiseRef = useRef<Promise<CartRefreshResult> | null>(null);

  const lastRefreshAtRef = useRef(0);

  useEffect(() => {
    const storedItems = readStoredCart();

    Promise.resolve().then(() => {
      setItems(storedItems);
      setIsHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    writeStoredCart(items);
  }, [isHydrated, items]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY) {
        setItems(readStoredCart());
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const addItem = useCallback(
    (product: CatalogProduct, requestedQuantity?: number, variantId?: number, potOptionId?: number | null) => {
      const activeVariants =
        product.product_type === "cut_flower"
          ? (product.details?.variants.filter((variant) => variant.is_active) ?? [])
          : [];
      const variant =
        activeVariants.find((item) => item.id === variantId) ??
        (variantId === undefined && activeVariants.length === 1
          ? activeVariants[0]
          : null);
      if (product.product_type === "cut_flower" && !variant) return;
      const pot = product.product_type === "plant" ? resolvePlantPotOption(product, potOptionId ?? null).option : null;
      if (product.product_type === "plant" && !pot) return;
      const snapshot = productToCartSnapshot(product, variant, pot);

      setItems((current) =>
        addCartSnapshot(current, snapshot, requestedQuantity),
      );
    },
    [],
  );

  const removeItem = useCallback((lineId: CartLineId) => {
    setItems((current) =>
      current.filter((item) => item.line_id !== lineId),
    );
  }, []);

  const setQuantity = useCallback((lineId: CartLineId, quantity: number) => {
    setItems((current) => setCartItemQuantity(current, lineId, quantity));
  }, []);

  const increaseItem = useCallback((lineId: CartLineId) => {
    setItems((current) => {
      const item = current.find((item) => item.line_id === lineId);

      if (!item) {
        return current;
      }

      return setCartItemQuantity(current, lineId, item.quantity + 1);
    });
  }, []);

  const decreaseItem = useCallback((lineId: CartLineId) => {
    setItems((current) => {
      const item = current.find((item) => item.line_id === lineId);

      if (!item) {
        return current;
      }

      return setCartItemQuantity(current, lineId, item.quantity - 1);
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setRefreshError(null);
  }, []);

  const hasItem = useCallback(
    (productId: number, variantId?: number) =>
      items.some(
        (item) =>
          item.product.id === productId &&
          (variantId === undefined || item.product.variant_id === variantId),
      ),
    [items],
  );

  const getItemQuantity = useCallback(
    (productId: number, variantId?: number) =>
      items.find(
        (item) =>
          item.product.id === productId &&
          (variantId === undefined || item.product.variant_id === variantId),
      )?.quantity ?? 0,
    [items],
  );

  const refreshCartItems = useCallback(
    async (force = false): Promise<CartRefreshResult> => {
      if (refreshPromiseRef.current) {
        return refreshPromiseRef.current;
      }

      if (items.length === 0) {
        setRefreshError(null);
        return cartResult([]);
      }

      if (!force && Date.now() - lastRefreshAtRef.current < REFRESH_TTL_MS) {
        return cartResult(items, refreshError);
      }

      const request = (async () => {
        setIsRefreshing(true);
        setRefreshError(null);

        try {
          const refreshedItems = await Promise.all(
            items.map(async (item): Promise<CartItem> => {
              try {
                const product = await getProductDetail(item.product.slug, true);

                let snapshot;
                if (product.product_type === "cut_flower") {
                  const resolution = resolveCutFlowerVariant(
                    product,
                    item.product.variant_id,
                  );
                  const selectedVariant = resolution.variant;

                  if (!selectedVariant) {
                    return {
                      ...item,
                      product: {
                        ...item.product,
                        is_in_stock: false,
                        requires_variant_selection: true,
                        validation_message: resolution.message,
                      },
                    };
                  }
                  snapshot = productToCartSnapshot(product, selectedVariant);
                } else if (product.product_type === "plant") {
                  const resolution = resolvePlantPotOption(product, item.product.pot_option_id ?? null);
                  if (!resolution.option) return { ...item, product: { ...item.product,
                    is_in_stock: false, requires_pot_selection: product.is_in_stock, validation_message: resolution.message } };
                  snapshot = productToCartSnapshot(product, null, resolution.option);
                } else {
                  snapshot = productToCartSnapshot(product);
                }

                const minimum = Math.max(1, snapshot.minimum_order_quantity);
                const validationMessage = item.quantity < minimum
                  ? `حداقل تعداد سفارش به ${minimum} تغییر کرده است.`
                  : item.quantity > snapshot.stock_quantity
                    ? product.product_type === "plant" ? "تعداد انتخاب‌شده برای این ترکیب موجود نیست؛ تعداد را کاهش دهید یا گلدان دیگری انتخاب کنید." : `موجودی فعلی ${snapshot.stock_quantity} ${snapshot.sale_unit_display} است.`
                    : "";
                const refreshedSnapshot = {
                  ...snapshot,
                  validation_message: validationMessage,
                };

                return {
                  line_id: makeCartLineId(snapshot.id, snapshot.variant_id, snapshot.pot_option_id),
                  product: refreshedSnapshot,
                  quantity: item.quantity,
                };
              } catch (error) {
                if (error instanceof ApiError && error.status === 404) {
                  return {
                    ...item,
                    product: {
                      ...item.product,
                      is_available: false,
                      is_in_stock: false,
                      validation_message: "این محصول دیگر در دسترس نیست.",
                    },
                  };
                }

                throw error;
              }
            }),
          );

          lastRefreshAtRef.current = Date.now();

          setItems(refreshedItems);

          return cartResult(refreshedItems);
        } catch (error) {
          const message = getApiErrorMessage(error);

          setRefreshError(message);

          return cartResult(items, message);
        } finally {
          setIsRefreshing(false);
          refreshPromiseRef.current = null;
        }
      })();

      refreshPromiseRef.current = request;

      return request;
    },
    [items, refreshError],
  );

  const totals = useMemo(() => calculateCartTotals(items), [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalItems: items.length,
      ...totals,

      isHydrated,
      isRefreshing,
      refreshError,

      hasInvalidItems: items.some((item) => !isCartItemValid(item)),

      addItem,
      removeItem,
      increaseItem,
      decreaseItem,
      setQuantity,
      clearCart,

      hasItem,
      getItemQuantity,

      refreshCartItems,
    }),
    [
      addItem,
      clearCart,
      decreaseItem,
      getItemQuantity,
      hasItem,
      increaseItem,
      isHydrated,
      isRefreshing,
      items,
      refreshCartItems,
      refreshError,
      removeItem,
      setQuantity,
      totals,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}
