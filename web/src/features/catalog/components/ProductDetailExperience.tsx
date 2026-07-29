"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { getProductDetail } from "@/features/catalog/api/catalog";
import type {
  CatalogProduct,
  CatalogProductDetail,
} from "@/features/catalog/types";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";
import { CartDrawer } from "@/features/home/components/CartDrawer";
import type { CartItem } from "@/features/home/types";
import { CatalogFeedback } from "./CatalogFeedback";
import { ProductDetailLoading } from "./ProductDetailLoading";
import { ProductDetailView } from "./ProductDetailView";

interface ProductDetailExperienceProps {
  slug: string;
}

export function ProductDetailExperience({
  slug,
}: ProductDetailExperienceProps) {
  const router = useRouter();
  const [product, setProduct] = useState<CatalogProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    Promise.resolve().then(() => {
      if (!isCurrent) {
        return;
      }
      setIsLoading(true);
      setError(null);
      setIsNotFound(false);
      setProduct(null);
    });

    getProductDetail(slug, retryKey > 0)
      .then((result) => {
        if (isCurrent) {
          setProduct(result);
        }
      })
      .catch((requestError: unknown) => {
        if (!isCurrent) {
          return;
        }

        if (requestError instanceof ApiError && requestError.status === 404) {
          setIsNotFound(true);
          return;
        }
        setError(getApiErrorMessage(requestError));
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [retryKey, slug]);

  useEffect(() => {
    if (!product) {
      return;
    }
    const previousTitle = document.title;
    document.title = `${product.name} | فلوریسا`;
    return () => {
      document.title = previousTitle;
    };
  }, [product]);

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }, [router]);

  const handleAddToCart = (
    selectedProduct: CatalogProduct,
    quantity: number,
  ) => {
    if (!selectedProduct.is_in_stock) {
      return;
    }

    setCart((current) => {
      const existingIndex = current.findIndex(
        (item) => item.product.id === selectedProduct.id,
      );
      const availableStock = Math.max(1, selectedProduct.stock_bundles);

      if (existingIndex >= 0) {
        const updated = [...current];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(
            availableStock,
            updated[existingIndex].quantity + quantity,
          ),
        };
        return updated;
      }

      return [
        ...current,
        {
          product: selectedProduct,
          quantity: Math.min(availableStock, quantity),
        },
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    setCart((current) =>
      current.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: Math.min(
                item.product.stock_bundles,
                Math.max(1, quantity),
              ),
            }
          : item,
      ),
    );
  };

  if (isLoading) {
    return <ProductDetailLoading />;
  }

  if (isNotFound || error || !product) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#0d0e12] px-4 py-5 text-white sm:px-6"
      >
        <div className="mx-auto w-full max-w-md">
          <button
            type="button"
            onClick={goBack}
            className="mb-6 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#191b23] text-zinc-200"
            aria-label="بازگشت"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
          <CatalogFeedback
            kind={isNotFound ? "empty" : "error"}
            message={
              isNotFound
                ? "محصول موردنظر پیدا نشد یا دیگر فعال نیست."
                : error || "دریافت جزئیات محصول با مشکل روبه‌رو شد."
            }
            onRetry={
              isNotFound
                ? undefined
                : () => setRetryKey((current) => current + 1)
            }
          />
        </div>
      </main>
    );
  }

  return (
    <>
      <ProductDetailView
        product={product}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        isFavorite={isFavorite}
        onBack={goBack}
        onOpenCart={() => setIsCartOpen(true)}
        onToggleFavorite={() => setIsFavorite((current) => !current)}
        onAddToCart={handleAddToCart}
      />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={(productId) =>
          setCart((current) =>
            current.filter((item) => item.product.id !== productId),
          )
        }
        onClearCart={() => setCart([])}
      />
    </>
  );
}
