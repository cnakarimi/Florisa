"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { CatalogFeedback } from "@/features/catalog/components/CatalogFeedback";
import { useCart } from "@/features/cart/hooks/CartProvider";
import { useCatalog } from "@/features/catalog/hooks/useCatalog";
import type {
  CatalogProduct,
  ProductOrdering,
} from "@/features/catalog/types";
import { Header } from "./Header";
import { HeroSection } from "./HeroSection";
import { CategoriesSection } from "./CategoriesSection";
import { ProductCard } from "./ProductCard";
import { MagazineSection } from "./MagazineSection";
import { BottomNav } from "./BottomNav";
import { ArticleModal } from "./ArticleModal";
import { ShopCatalog } from "./ShopCatalog";
import { PlantAICare } from "./PlantAICare";
import { FavoritesView } from "./FavoritesView";
import type { Article, TabType } from "../types";

export function HomeExperience() {
  const router = useRouter();
  const cart = useCart();
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [favorites, setFavorites] = useState<CatalogProduct[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [ordering, setOrdering] = useState<ProductOrdering>("newest");

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
            onAddToCart={(item) => cart.addItem(item)}
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
        cartCount={cart.totalBundles}
        favoritesCount={favorites.length}
        onNavigateToCart={() => router.push("/cart")}
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
            onAddToCart={(product) => cart.addItem(product)}
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
            onAddToCart={(product) => cart.addItem(product)}
            onSelectProduct={openProduct}
          />
        ) : null}
      </main>

      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
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
