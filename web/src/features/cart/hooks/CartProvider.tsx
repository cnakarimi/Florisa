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
import { ApiError, getApiErrorMessage } from "@/lib/api/client";
import { readStoredCart, writeStoredCart } from "@/features/cart/storage";
import {
  CART_STORAGE_KEY,
  type CartItem,
  type CartRefreshResult,
  isCartItemValid,
  productToCartSnapshot,
} from "@/features/cart/types";

const REFRESH_TTL_MS = 60_000;

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalBundles: number;
  totalStems: number;
  subtotal: number;
  isHydrated: boolean;
  isRefreshing: boolean;
  refreshError: string | null;
  hasInvalidItems: boolean;
  addItem: (product: CatalogProduct, quantity?: number) => void;
  removeItem: (productId: number) => void;
  increaseItem: (productId: number) => void;
  decreaseItem: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  hasItem: (productId: number) => boolean;
  getItemQuantity: (productId: number) => number;
  refreshCartItems: (force?: boolean) => Promise<CartRefreshResult>;
}

const CartContext = createContext<CartContextValue | null>(null);

function normalizeQuantity(
  product: CartItem["product"],
  quantity: number,
): number | null {
  if (!product.is_available || !product.is_in_stock) {
    return null;
  }

  const minimum = Math.max(1, Math.trunc(product.minimum_order_bundles));
  const stock = Math.max(0, Math.trunc(product.stock_bundles));
  if (stock < minimum) {
    return null;
  }

  return Math.min(stock, Math.max(minimum, Math.trunc(quantity)));
}

function cartResult(
  items: CartItem[],
  error: string | null = null,
): CartRefreshResult {
  return {
    items,
    isValid:
      !error && items.length > 0 && items.every(isCartItemValid),
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
    if (isHydrated) {
      writeStoredCart(items);
    }
  }, [isHydrated, items]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY) {
        setItems(readStoredCart());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addItem = useCallback(
    (product: CatalogProduct, requestedQuantity?: number) => {
      if (
        !product.is_in_stock ||
        product.stock_quantity < product.minimum_order_quantity
      ) {
        return;
      }

      const snapshot = productToCartSnapshot(product);
      const increment = Math.max(
        snapshot.minimum_order_bundles,
        Math.trunc(
          requestedQuantity ?? snapshot.minimum_order_bundles,
        ),
      );

      setItems((current) => {
        const existing = current.find(
          (item) => item.product.id === snapshot.id,
        );

        if (!existing) {
          const quantity = normalizeQuantity(snapshot, increment);
          return quantity
            ? [...current, { product: snapshot, quantity }]
            : current;
        }

        const quantity = normalizeQuantity(
          snapshot,
          existing.quantity + increment,
        );
        if (!quantity) {
          return current;
        }

        return current.map((item) =>
          item.product.id === snapshot.id
            ? { product: snapshot, quantity }
            : item,
        );
      });
    },
    [],
  );

  const removeItem = useCallback((productId: number) => {
    setItems((current) =>
      current.filter((item) => item.product.id !== productId),
    );
  }, []);

  const setQuantity = useCallback((productId: number, quantity: number) => {
    if (!Number.isFinite(quantity)) {
      return;
    }

    setItems((current) =>
      current.flatMap((item) => {
        if (item.product.id !== productId) {
          return [item];
        }

        const minimum = Math.max(
          1,
          Math.trunc(item.product.minimum_order_bundles),
        );
        const requested = Math.trunc(quantity);
        if (requested < minimum) {
          return [];
        }

        const normalized = normalizeQuantity(item.product, requested);
        return normalized ? [{ ...item, quantity: normalized }] : [item];
      }),
    );
  }, []);

  const increaseItem = useCallback((productId: number) => {
    setItems((current) =>
      current.map((item) => {
        if (item.product.id !== productId) {
          return item;
        }

        const quantity = normalizeQuantity(
          item.product,
          item.quantity + 1,
        );
        return quantity ? { ...item, quantity } : item;
      }),
    );
  }, []);

  const decreaseItem = useCallback((productId: number) => {
    setItems((current) =>
      current.flatMap((item) => {
        if (item.product.id !== productId) {
          return [item];
        }

        const minimum = Math.max(
          1,
          Math.trunc(item.product.minimum_order_bundles),
        );
        if (item.quantity - 1 < minimum) {
          return [];
        }

        return [{ ...item, quantity: item.quantity - 1 }];
      }),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setRefreshError(null);
  }, []);

  const hasItem = useCallback(
    (productId: number) =>
      items.some((item) => item.product.id === productId),
    [items],
  );

  const getItemQuantity = useCallback(
    (productId: number) =>
      items.find((item) => item.product.id === productId)?.quantity ?? 0,
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

      if (
        !force &&
        Date.now() - lastRefreshAtRef.current < REFRESH_TTL_MS
      ) {
        return cartResult(items, refreshError);
      }

      const request = (async () => {
        setIsRefreshing(true);
        setRefreshError(null);

        try {
          const refreshedItems = await Promise.all(
            items.map(async (item): Promise<CartItem> => {
              try {
                const product = await getProductDetail(
                  item.product.slug,
                  true,
                );
                const snapshot = productToCartSnapshot(product);
                const quantity =
                  normalizeQuantity(snapshot, item.quantity) ??
                  Math.max(
                    1,
                    Math.trunc(snapshot.minimum_order_bundles),
                  );

                return { product: snapshot, quantity };
              } catch (error) {
                if (error instanceof ApiError && error.status === 404) {
                  return {
                    ...item,
                    product: {
                      ...item.product,
                      is_available: false,
                      is_in_stock: false,
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

  const totals = useMemo(
    () =>
      items.reduce(
        (summary, item) => ({
          totalBundles: summary.totalBundles + item.quantity,
          totalStems:
            summary.totalStems +
            item.quantity * item.product.stems_per_bundle,
          subtotal:
            summary.subtotal +
            item.quantity * item.product.price_per_bundle,
        }),
        { totalBundles: 0, totalStems: 0, subtotal: 0 },
      ),
    [items],
  );

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
