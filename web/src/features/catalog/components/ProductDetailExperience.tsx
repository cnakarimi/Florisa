"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { getProductDetail } from "@/features/catalog/api/catalog";
import type {
  CatalogProductDetail,
} from "@/features/catalog/types";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";
import { useCart } from "@/features/cart/hooks/CartProvider";
import { CartDrawer } from "@/features/home/components/CartDrawer";
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
  const cart = useCart();
  const [product, setProduct] = useState<CatalogProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
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
        cartCount={cart.totalBundles}
        isFavorite={isFavorite}
        onBack={goBack}
        onNavigateToCart={() => router.push("/cart")}
        onToggleFavorite={() => setIsFavorite((current) => !current)}
        onAddToCart={(selectedProduct, quantity) => {
          cart.addItem(selectedProduct, quantity);
          setIsCartOpen(true);
        }}
      />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
}
