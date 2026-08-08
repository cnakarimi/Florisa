"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

import { useCart } from "@/features/cart/hooks/CartProvider";
import { CatalogFeedback } from "@/features/catalog/components/CatalogFeedback";
import { useCatalog } from "@/features/catalog/hooks/useCatalog";
import type { CatalogProduct, ProductQuery } from "@/features/catalog/types";
import { useFavorites } from "@/features/favorites/hooks/FavoritesProvider";

import type { Article } from "../types";
import { ArticleModal } from "./ArticleModal";
import { BottomNav } from "./BottomNav";
import { CategoriesSection } from "./CategoriesSection";
import { FavoritesView } from "./FavoritesView";
import { HeroSection } from "./HeroSection";
import { MagazineSection } from "./MagazineSection";
import { PlantAICare } from "./PlantAICare";
import { ProductCard } from "./ProductCard";
import { ScrollNavbar } from "./ScrollNavbar";
import { ShopCatalog } from "./ShopCatalog";

type PlatformView = "home" | "shop" | "care" | "favorites";

interface HomeExperienceProps {
  view?: PlatformView;
  initialSearch?: string;
  initialQuery?: ProductQuery;
}

export function HomeExperience({
  view = "home",
  initialSearch = "",
  initialQuery = {},
}: HomeExperienceProps) {
  const router = useRouter();
  const cart = useCart();
  const { favorites, toggleFavorite } = useFavorites();

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [catalogQuery, setCatalogQuery] = useState<ProductQuery>({
    ...initialQuery,
    search: initialQuery.search ?? initialSearch,
    ordering: initialQuery.ordering ?? "newest",
  });
  const selectedCategory = catalogQuery.category ?? null;
  const searchQuery = catalogQuery.search ?? "";
  const ordering = catalogQuery.ordering ?? "newest";
  const catalogFilters = { ...catalogQuery };
  delete catalogFilters.category;
  delete catalogFilters.search;
  delete catalogFilters.ordering;
  delete catalogFilters.page;
  delete catalogFilters.page_size;
  const setSelectedCategory = (category: string | null) =>
    setCatalogQuery((current) => ({ ...current, category }));
  const setSearchQuery = (search: string) =>
    setCatalogQuery((current) => ({ ...current, search }));

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
  } = useCatalog(catalogQuery);

  useEffect(() => {
    if (view !== "shop") return;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(catalogQuery)) {
      if (value === undefined || value === null || value === "") continue;
      if (key === "ordering" && value === "newest") continue;
      params.set(key, String(value));
    }
    const query = params.toString();
    router.replace(`/shop${query ? `?${query}` : ""}`, { scroll: false });
  }, [catalogQuery, router, view]);

  const handleNavbarSearch = (query: string) => {
    const normalizedQuery = query.trim();
    const search = normalizedQuery
      ? `?search=${encodeURIComponent(normalizedQuery)}`
      : "";

    if (view === "shop") {
      setSearchQuery(normalizedQuery);
      setSelectedCategory(null);
    }

    router.push(`/shop${search}`);
  };

  const openProduct = (product: CatalogProduct) => {
    router.push(`/products/${encodeURIComponent(product.slug)}`);
  };

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
      className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="جدیدترین محصولات"
    >
      {latestProducts.map((product) => (
        <div
          key={product.id}
          className="w-[72vw] min-w-[240px] max-w-[290px] shrink-0 snap-start sm:w-[44vw] sm:max-w-[310px] md:w-[30vw] md:max-w-[300px]"
        >
          <ProductCard
            product={product}
            imageSizes="w-[274px] h-[274px]"
            isFavorite={favorites.some((item) => item.id === product.id)}
            onToggleFavorite={toggleFavorite}
            onAddToCart={cart.addItem}
            onSelectProduct={openProduct}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-dvh bg-black text-zinc-100 selection:bg-[#c7a23c]/30 selection:text-white">
      <div
        className={`relative mx-auto min-h-dvh w-full max-w-screen-lg overflow-x-hidden bg-[#111211] shadow-2xl shadow-black ${
          view === "home" ? "" : "md:pb-24"
        }`}
      >
        <main className={view === "home" ? "" : "px-4 sm:px-6 md:px-8"}>
          {view === "home" ? (
            <div className="animate-in fade-in duration-300">
              <HeroSection onShopClick={() => router.push("/shop")} />

              <div className="px-4 sm:px-6 md:px-8">
                {isCategoriesLoading ||
                Boolean(categoriesError) ||
                categories.length >= 2 ? (
                  <CategoriesSection
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    isLoading={isCategoriesLoading}
                    error={categoriesError}
                    onRetry={retryCategories}
                  />
                ) : null}

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

                      <span className="relative grid h-7 w-7 place-items-center text-[#cda62e] sm:h-8 sm:w-8"></span>
                    </h2>

                    <button
                      type="button"
                      onClick={() => {
                        router.push("/shop");
                      }}
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

          {view === "shop" ? (
            <>
              <ScrollNavbar
                searchQuery={searchQuery}
                onSearch={handleNavbarSearch}
                onLogoClick={() => {
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              />

              <ShopCatalog
                products={products}
                categories={categories}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onAddToCart={cart.addItem}
                onSelectProduct={openProduct}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                ordering={ordering}
                onOrderingChange={(nextOrdering) =>
                  setCatalogQuery((current) => ({
                    ...current,
                    ordering: nextOrdering,
                  }))
                }
                filters={catalogFilters}
                onFiltersChange={(filters) =>
                  setCatalogQuery((current) => ({
                    search: current.search,
                    category: current.category,
                    ordering: current.ordering,
                    ...filters,
                  }))
                }
                isLoading={isProductsLoading}
                error={productsError}
                onRetry={retryProducts}
                hasNextPage={hasNextPage}
                isLoadingMore={isLoadingMore}
                onLoadMore={loadMore}
              />
            </>
          ) : null}

          {view === "care" ? <PlantAICare /> : null}

          {view === "favorites" ? (
            <FavoritesView
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onAddToCart={cart.addItem}
              onSelectProduct={openProduct}
            />
          ) : null}
        </main>

        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />

        <BottomNav />
      </div>
    </div>
  );
}
