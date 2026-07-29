"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import { getProductDetail } from "@/features/catalog/api/catalog";
import { CatalogFeedback } from "@/features/catalog/components/CatalogFeedback";
import { useCatalog } from "@/features/catalog/hooks/useCatalog";
import type {
  CatalogProduct,
  CatalogProductDetail,
  ProductOrdering,
} from "@/features/catalog/types";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/api/client";
import { Header } from "./Header";
import { HeroSection } from "./HeroSection";
import { CategoriesSection } from "./CategoriesSection";
import { ProductCard } from "./ProductCard";
import { MagazineSection } from "./MagazineSection";
import { BottomNav } from "./BottomNav";
import { ProductModal } from "./ProductModal";
import { ArticleModal } from "./ArticleModal";
import { CartDrawer } from "./CartDrawer";
import { ShopCatalog } from "./ShopCatalog";
import { PlantAICare } from "./PlantAICare";
import { FavoritesView } from "./FavoritesView";
import type { Article, CartItem, TabType } from "../types";

interface HomeExperienceProps {
  initialProductSlug?: string;
}

export function HomeExperience({
  initialProductSlug,
}: HomeExperienceProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<CatalogProduct[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [ordering, setOrdering] = useState<ProductOrdering>("newest");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<CatalogProductDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(
    Boolean(initialProductSlug),
  );
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailRetry, setDetailRetry] = useState(0);

  const {
    categories,
    products,
    hasNextPage,
    isCategoriesLoading,
    isProductsLoading,
    isLoadingMore,
    categoriesError,
    productsError,
    retryCategories,
    retryProducts,
    loadMore,
  } = useCatalog({
    category: selectedCategory,
    search: searchQuery,
    ordering,
  });

  useEffect(() => {
    if (!initialProductSlug) {
      return;
    }

    let isCurrent = true;

    Promise.resolve().then(() => {
      if (!isCurrent) {
        return;
      }
      setIsDetailLoading(true);
      setDetailError(null);
      setSelectedProduct(null);
    });

    getProductDetail(initialProductSlug, detailRetry > 0)
      .then((product) => {
        if (isCurrent) {
          setSelectedProduct(product);
        }
      })
      .catch((error: unknown) => {
        if (!isCurrent) {
          return;
        }
        if (error instanceof ApiError && error.status === 404) {
          setDetailError("محصول موردنظر پیدا نشد یا دیگر فعال نیست.");
          return;
        }
        setDetailError(getApiErrorMessage(error));
      })
      .finally(() => {
        if (isCurrent) {
          setIsDetailLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [detailRetry, initialProductSlug]);

  const handleAddToCart = (
    product: CatalogProduct,
    quantity = 1,
    selectedPotColor?: string,
  ) => {
    if (!product.is_in_stock) {
      return;
    }

    setCart((current) => {
      const existingIndex = current.findIndex(
        (item) => item.product.id === product.id,
      );
      if (existingIndex > -1) {
        const updated = [...current];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          selectedPotColor:
            selectedPotColor ?? updated[existingIndex].selectedPotColor,
        };
        return updated;
      }
      return [
        ...current,
        { product, quantity, selectedPotColor },
      ];
    });
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    setCart((current) =>
      current.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const handleRemoveItem = (productId: number) => {
    setCart((current) =>
      current.filter((item) => item.product.id !== productId),
    );
  };

  const handleToggleFavorite = (product: CatalogProduct) => {
    setFavorites((current) => {
      const exists = current.some((item) => item.id === product.id);
      return exists
        ? current.filter((item) => item.id !== product.id)
        : [...current, product];
    });
  };

  const openProduct = (product: CatalogProduct) => {
    router.push(`/products/${encodeURIComponent(product.slug)}`);
  };

  const productGrid = isProductsLoading ? (
    <CatalogFeedback kind="loading" />
  ) : productsError && products.length === 0 ? (
    <CatalogFeedback
      kind="error"
      message={productsError}
      onRetry={retryProducts}
    />
  ) : products.length === 0 ? (
    <CatalogFeedback
      kind="empty"
      message={
        searchQuery || selectedCategory
          ? "محصولی مطابق جستجو یا دسته‌بندی انتخاب‌شده پیدا نشد."
          : undefined
      }
    />
  ) : (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isFavorite={favorites.some(
              (favorite) => favorite.id === product.id,
            )}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={(item) => handleAddToCart(item, 1)}
            onSelectProduct={openProduct}
          />
        ))}
      </div>

      {productsError ? (
        <div className="mt-4">
          <CatalogFeedback
            kind="error"
            message={productsError}
            onRetry={retryProducts}
            compact
          />
        </div>
      ) : null}

      {hasNextPage ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="rounded-xl border border-white/10 bg-[#222430] px-6 py-2.5 text-xs font-semibold text-white hover:border-emerald-500/50 disabled:cursor-wait disabled:opacity-60"
          >
            {isLoadingMore ? "در حال دریافت..." : "نمایش محصولات بیشتر"}
          </button>
        </div>
      ) : null}
    </>
  );

  return (
    <div className="min-h-screen bg-[#0d0e12] pb-24 font-['Vazirmatn',sans-serif] text-zinc-100 selection:bg-emerald-600 selection:text-white">
      <Header
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        favoritesCount={favorites.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenFavorites={() => setActiveTab("favorites")}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
      />

      <main className="mx-auto max-w-6xl px-4">
        {activeTab === "home" ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <HeroSection
              onShopClick={() => setActiveTab("shop")}
              onCareClick={() => setActiveTab("care_ai")}
            />

            <CategoriesSection
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              isLoading={isCategoriesLoading}
              error={categoriesError}
              onRetry={retryCategories}
            />

            <section className="my-8">
              <div className="mb-5 flex items-center justify-between px-1">
                <h3 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
                  <span className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-1 text-amber-400">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <span>جدیدترین محصولات</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("shop")}
                  className="text-xs text-amber-400 hover:underline"
                >
                  مشاهده همه
                </button>
              </div>
              {productGrid}
            </section>

            <MagazineSection
              onSelectArticle={(article) => setSelectedArticle(article)}
            />
          </div>
        ) : null}

        {activeTab === "shop" ? (
          <ShopCatalog
            products={products}
            categories={categories}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={(product) => handleAddToCart(product, 1)}
            onSelectProduct={openProduct}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            ordering={ordering}
            onOrderingChange={setOrdering}
            isLoading={isProductsLoading}
            error={productsError}
            onRetry={retryProducts}
            hasNextPage={hasNextPage}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMore}
          />
        ) : null}

        {activeTab === "care_ai" ? <PlantAICare /> : null}

        {activeTab === "favorites" ? (
          <FavoritesView
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={(product) => handleAddToCart(product, 1)}
            onSelectProduct={openProduct}
          />
        ) : null}
      </main>

      {selectedProduct ? (
        <ProductModal
          key={selectedProduct.id}
          product={selectedProduct}
          onClose={() => router.push("/")}
          isFavorite={favorites.some(
            (favorite) => favorite.id === selectedProduct.id,
          )}
          onToggleFavorite={handleToggleFavorite}
          onAddToCart={handleAddToCart}
        />
      ) : null}

      {initialProductSlug && isDetailLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md">
            <CatalogFeedback
              kind="loading"
              message="در حال دریافت جزئیات محصول..."
            />
          </div>
        </div>
      ) : null}

      {initialProductSlug && detailError && !isDetailLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-black/40 p-2 text-zinc-300"
              aria-label="بازگشت به فروشگاه"
            >
              <X className="h-4 w-4" />
            </button>
            <CatalogFeedback
              kind="error"
              message={detailError}
              onRetry={() => setDetailRetry((value) => value + 1)}
            />
          </div>
        </div>
      ) : null}

      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCart([])}
      />

      <BottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === "profile") {
            router.push("/profile");
            return;
          }
          setActiveTab(tab);
        }}
        favoritesCount={favorites.length}
      />
    </div>
  );
}
