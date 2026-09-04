"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/features/cart/hooks/CartProvider";
import { useFavorites } from "@/features/favorites/hooks/FavoritesProvider";
import { ScrollNavbar } from "@/components/navigation/ScrollNavbar";
import { ShopCatalog } from "@/features/catalog/components/ShopCatalog";

import { useCatalog } from "../hooks/useCatalog";
import type { CatalogProduct, ProductQuery } from "../types";

interface ShopExperienceProps {
  initialQuery?: ProductQuery;
}

export function ShopExperience({ initialQuery = {} }: ShopExperienceProps) {
  const router = useRouter();

  const cart = useCart();
  const { toggleFavorite } = useFavorites();

  const [catalogQuery, setCatalogQuery] = useState<ProductQuery>({
    ...initialQuery,
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

  const {
    categories,
    products,
    hasNextPage,
    isProductsLoading,
    isLoadingMore,
    productsError,
    retryProducts,
    loadMore,
  } = useCatalog(catalogQuery);

  useEffect(() => {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(catalogQuery)) {
      if (value === undefined || value === null || value === "") continue;
      if (key === "ordering" && value === "newest") continue;

      params.set(key, String(value));
    }

    const query = params.toString();

    router.replace(`/shop${query ? `?${query}` : ""}`, {
      scroll: false,
    });
  }, [catalogQuery, router]);

  const setSelectedCategory = (category: string | null) => {
    setCatalogQuery((current) => ({
      ...current,
      category: category ?? undefined,
    }));
  };

  const setSearchQuery = (search: string) => {
    setCatalogQuery((current) => ({
      ...current,
      search,
    }));
  };

  const handleNavbarSearch = (query: string) => {
    const normalizedQuery = query.trim();

    setSearchQuery(normalizedQuery);
    setSelectedCategory(null);
  };

  const openProduct = (product: CatalogProduct) => {
    router.push(`/products/${encodeURIComponent(product.slug)}`);
  };

  return (
    <div className="min-h-dvh bg-black text-zinc-100 selection:bg-[#c7a23c]/30 selection:text-white">
      <div className="relative mx-auto min-h-dvh w-full max-w-screen-lg overflow-x-hidden bg-[#111211] shadow-2xl shadow-black md:pb-24">
        <main className="px-4 sm:px-6 md:px-8">
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
        </main>
      </div>
    </div>
  );
}
