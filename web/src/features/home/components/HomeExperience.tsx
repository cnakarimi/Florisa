"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

import { useCart } from "@/features/cart/hooks/CartProvider";
import { CatalogFeedback } from "@/features/catalog/components/CatalogFeedback";
import { useCatalog } from "@/features/catalog/hooks/useCatalog";
import type { CatalogProduct, ProductOrdering } from "@/features/catalog/types";

import type { Article, TabType } from "../types";
import { ArticleModal } from "./ArticleModal";
import { BottomNav } from "./BottomNav";
import { CategoriesSection } from "./CategoriesSection";
import { FavoritesView } from "./FavoritesView";
import { Header } from "./Header";
import { HeroSection } from "./HeroSection";
import { MagazineSection } from "./MagazineSection";
import { PlantAICare } from "./PlantAICare";
import { ProductCard } from "./ProductCard";
import { ShopCatalog } from "./ShopCatalog";

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
      const isFavorite = current.some((item) => item.id === product.id);

      return isFavorite
        ? current.filter((item) => item.id !== product.id)
        : [...current, product];
    });
  };

  const openProduct = (product: CatalogProduct) => {
    router.push(`/products/${encodeURIComponent(product.slug)}`);
  };

  // تعداد بیشتری نمایش می‌دهیم تا اسلایدر واقعاً قابل حرکت باشد.
  const latestProducts = products.slice(0, 8);

  const latestProductsContent = isProductsLoading ? (
    <CatalogFeedback kind="loading" />
  ) : productsError && products.length === 0 ? (
    <CatalogFeedback
      kind="error"
      message={productsError}
      onRetry={retryProducts}
    />
  ) : latestProducts.length === 0 ? (
    <CatalogFeedback
      kind="empty"
      message={
        selectedCategory
          ? "در این دسته‌بندی هنوز محصولی ثبت نشده است."
          : undefined
      }
    />
  ) : (
    <div
      className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:gap-4 sm:px-6 md:-mx-8 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="جدیدترین محصولات"
    >
      {latestProducts.map((product) => (
        <div
          key={product.id}
          className="w-[43vw] min-w-[155px] max-w-[240px] shrink-0 snap-start sm:w-[36vw] sm:max-w-[280px] md:w-[28vw] md:max-w-[300px]"
        >
          <ProductCard
            product={product}
            isFavorite={favorites.some((item) => item.id === product.id)}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={cart.addItem}
            onSelectProduct={openProduct}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-dvh bg-black text-zinc-100 selection:bg-[#c7a23c]/30 selection:text-white">
      <div className="relative mx-auto min-h-dvh w-full max-w-screen-lg overflow-x-hidden bg-[#111211] pb-24 shadow-2xl shadow-black">
        {activeTab !== "home" ? (
          <Header
            cartCount={cart.totalBundles}
            favoritesCount={favorites.length}
            onNavigateToCart={() => router.push("/cart")}
            onOpenFavorites={() => setActiveTab("favorites")}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
          />
        ) : null}

        <main className={activeTab === "home" ? "" : "px-4 sm:px-6 md:px-8"}>
          {activeTab === "home" ? (
            <div className="animate-in fade-in duration-300">
              <HeroSection onShopClick={() => setActiveTab("shop")} />

              <div className="px-4 sm:px-6 md:px-8">
                <CategoriesSection
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  isLoading={isCategoriesLoading}
                  error={categoriesError}
                  onRetry={retryCategories}
                />

                <section
                  className="pb-2 pt-6 sm:pt-8"
                  aria-labelledby="newest-title"
                >
                  <div className="mb-4 flex items-center justify-between sm:mb-6">
                    <h2
                      id="newest-title"
                      className="flex items-center gap-2 text-lg font-extrabold text-[#dedbd5] sm:text-xl md:text-2xl"
                    >
                      <span>جدیدترین محصولات</span>

                      <span className="relative grid h-7 w-7 place-items-center text-[#cda62e] sm:h-8 sm:w-8">
                        <Sparkles className="absolute h-full w-full stroke-[1.4]" />

                        <span className="relative pt-0.5 text-[7px] font-black tracking-tighter sm:text-[8px]">
                          NEW
                        </span>
                      </span>
                    </h2>

                    <button
                      type="button"
                      onClick={() => setActiveTab("shop")}
                      className="shrink-0 text-xs font-medium text-[#c5a33d] transition-colors hover:text-[#e2c465] sm:text-sm"
                    >
                      مشاهده همه
                    </button>
                  </div>

                  {latestProductsContent}
                </section>

                <MagazineSection onSelectArticle={setSelectedArticle} />
              </div>
            </div>
          ) : null}

          {activeTab === "shop" ? (
            <ShopCatalog
              products={products}
              categories={categories}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onAddToCart={cart.addItem}
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
              onAddToCart={cart.addItem}
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
    </div>
  );
}
