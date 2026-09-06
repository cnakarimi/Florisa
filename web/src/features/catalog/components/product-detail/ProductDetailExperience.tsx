"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { CartDrawer } from "@/components/layout/CartDrawer";
import { useCart } from "@/features/cart/hooks/CartProvider";
import { getProductDetail } from "@/features/catalog/api/catalog";
import type { CatalogProductDetail } from "@/features/catalog/types";
import { useFavorites } from "@/features/favorites/hooks/FavoritesProvider";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";

import { CatalogFeedback } from "../CatalogFeedback";
import { ProductDetailLoading } from "./ProductDetailLoading";
import { ProductDetailView } from "./ProductDetailView";

interface ProductDetailExperienceProps {
  slug: string;
}

export function ProductDetailExperience({
  slug,
}: ProductDetailExperienceProps) {
  const router = useRouter();
  const cart = useCart();
  const { favorites, toggleFavorite } = useFavorites();

  const [product, setProduct] = useState<CatalogProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

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

  if (isLoading) {
    return <ProductDetailLoading />;
  }

  if (isNotFound || error || !product) {
    return (
      <main
        dir="rtl"
        className="min-h-dvh bg-background-primary text-text-primary selection:bg-action-primary/30 selection:text-text-inverse"
      >
        <div className="mx-auto min-h-dvh w-full max-w-screen-lg bg-background-secondary px-4 py-5 shadow-large sm:px-6 md:px-8 md:py-7">
          <div className="mx-auto w-full max-w-xl">
            <button
              type="button"
              onClick={goBack}
              className="mb-8 grid size-11 place-items-center rounded-full border border-border-subtle bg-surface-muted text-text-secondary transition-colors hover:border-action-primary/30 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
              aria-label="بازگشت"
            >
              <ArrowRight className="size-5" aria-hidden="true" />
            </button>

            <div className="rounded-[24px] border border-border-subtle bg-surface-muted p-4 shadow-large sm:p-6">
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
          </div>
        </div>
      </main>
    );
  }

  const isFavorite = favorites.some((item) => item.id === product.id);

  return (
    <>
      <ProductDetailView
        key={product.id}
        product={product}
        cartCount={cart.isHydrated ? cart.totalQuantity : 0}
        isFavorite={isFavorite}
        onBack={goBack}
        onNavigateToCart={() => router.push("/cart")}
        onToggleFavorite={() => toggleFavorite(product)}
        onAddToCart={(selectedProduct, quantity) => {
          cart.addItem(selectedProduct, quantity);
          setIsCartOpen(true);
        }}
      />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
