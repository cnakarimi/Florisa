"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ScrollNavbar } from "@/components/navigation/ScrollNavbar";
import { useCart } from "@/features/cart/hooks/CartProvider";
import { ShopCatalog } from "@/features/catalog/components/ShopCatalog";
import { useCatalog } from "@/features/catalog/hooks/useCatalog";
import type { CatalogProduct, ProductQuery } from "@/features/catalog/types";
import {
  getCatalogFilters,
  serializeShopQuery,
} from "@/features/catalog/utils/query";

interface ShopExperienceProps {
  initialQuery?: ProductQuery;
}

export function ShopExperience({ initialQuery = {} }: ShopExperienceProps) {
  const router = useRouter();
  const cart = useCart();

  const [catalogQuery, setCatalogQuery] = useState<ProductQuery>({
    ...initialQuery,
    ordering: initialQuery.ordering ?? "newest",
  });

  const selectedCategory = catalogQuery.category ?? null;
  const searchQuery = catalogQuery.search ?? "";
  const ordering = catalogQuery.ordering ?? "newest";

  const catalogFilters = useMemo(
    () => getCatalogFilters(catalogQuery),
    [catalogQuery],
  );

  const {
    categories,
    products,
    totalProducts,
    hasNextPage,
    isProductsLoading,
    isLoadingMore,
    productsError,
    retryProducts,
    loadMore,
  } = useCatalog(catalogQuery);

  useEffect(() => {
    const query = serializeShopQuery(catalogQuery);

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
      search: search || undefined,
    }));
  };

  const setOrdering = (nextOrdering: ProductQuery["ordering"]) => {
    setCatalogQuery((current) => ({
      ...current,
      ordering: nextOrdering ?? "newest",
    }));
  };

  const setFilters = (filters: ProductQuery) => {
    setCatalogQuery((current) => ({
      search: current.search,
      category: current.category,
      ordering: current.ordering,
      ...filters,
    }));
  };

  const handleNavbarSearch = (query: string) => {
    const normalizedQuery = query.trim();

    setCatalogQuery((current) => ({
      ...current,
      search: normalizedQuery || undefined,
      category: undefined,
    }));
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
            totalProducts={totalProducts}
            categories={categories}
            onAddToCart={cart.addItem}
            onSelectProduct={openProduct}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            ordering={ordering}
            onOrderingChange={setOrdering}
            filters={catalogFilters}
            onFiltersChange={setFilters}
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
