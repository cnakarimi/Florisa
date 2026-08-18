"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/features/cart/hooks/CartProvider";
import { useCatalog } from "@/features/catalog/hooks/useCatalog";
import type { CatalogProduct, ProductQuery } from "@/features/catalog/types";
import { useFavorites } from "@/features/favorites/hooks/FavoritesProvider";

import type { Article } from "../types";
import { useHomeSlides } from "../slider/useHomeSlides";
import { ArticleModal } from "./ArticleModal";
import { BottomNav } from "./BottomNav";
import { FavoritesView } from "./FavoritesView";
import { PlantAICare } from "./PlantAICare";
import { ResponsiveHomeExperience } from "./ResponsiveHomeExperience";
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
  const { slides: homeSlides, status: homeSlidesStatus } = useHomeSlides();

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

  if (view === "home") {
    return (
      <>
        <ResponsiveHomeExperience
          categories={categories}
          latestProducts={latestProducts}
          selectedCategory={selectedCategory}
          isCategoriesLoading={isCategoriesLoading}
          isProductsLoading={isProductsLoading}
          categoriesError={categoriesError}
          productsError={productsError}
          homeSlides={homeSlides}
          homeSlidesStatus={homeSlidesStatus}
          cartCount={cart.isHydrated ? cart.totalQuantity : 0}
          favoritesCount={favorites.length}
          onSelectCategory={setSelectedCategory}
          onRetryCategories={retryCategories}
          onRetryProducts={retryProducts}
          onToggleFavorite={toggleFavorite}
          onAddToCart={cart.addItem}
          onSelectProduct={openProduct}
          onSelectArticle={setSelectedArticle}
          onShopClick={() => router.push("/shop")}
          onSearch={handleNavbarSearch}
          isFavorite={(product) =>
            favorites.some((item) => item.id === product.id)
          }
        />

        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      </>
    );
  }

  return (
    <div className="min-h-dvh bg-black text-zinc-100 selection:bg-[#c7a23c]/30 selection:text-white">
      <div className="relative mx-auto min-h-dvh w-full max-w-screen-lg overflow-x-hidden bg-[#111211] shadow-2xl shadow-black md:pb-24">
        <main className="px-4 sm:px-6 md:px-8">
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
