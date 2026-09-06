"use client";

import { useRouter } from "next/navigation";

import type { CatalogProduct } from "@/features/catalog/types";
import { useCatalog } from "@/features/catalog/hooks/useCatalog";
import { useCart } from "@/features/cart/hooks/CartProvider";

import { useHomeSlides } from "../slider/useHomeSlides";
import {
  HOME_FEATURED_PRODUCTS_QUERY,
  HOME_NEWEST_PRODUCTS_QUERY,
} from "../queries";
import { HomeView } from "./HomeView";

export function HomeExperience() {
  const router = useRouter();

  const cart = useCart();
  const { slides: homeSlides, status: homeSlidesStatus } = useHomeSlides();

  const featuredCatalog = useCatalog(HOME_FEATURED_PRODUCTS_QUERY);
  const newestCatalog = useCatalog(HOME_NEWEST_PRODUCTS_QUERY);

  const {
    categories,
    isCategoriesLoading,
    categoriesError,
    retryCategories,
  } = newestCatalog;

  const handleSearch = (query: string) => {
    const normalizedQuery = query.trim();

    const searchParams = normalizedQuery
      ? `?search=${encodeURIComponent(normalizedQuery)}`
      : "";

    router.push(`/shop${searchParams}`);
  };

  const handleProductSelect = (product: CatalogProduct) => {
    router.push(`/products/${encodeURIComponent(product.slug)}`);
  };

  return (
    <HomeView
      categories={categories}
      featuredProducts={featuredCatalog.products}
      newestProducts={newestCatalog.products}
      isCategoriesLoading={isCategoriesLoading}
      isFeaturedProductsLoading={featuredCatalog.isProductsLoading}
      isNewestProductsLoading={newestCatalog.isProductsLoading}
      categoriesError={categoriesError}
      featuredProductsError={featuredCatalog.productsError}
      newestProductsError={newestCatalog.productsError}
      homeSlides={homeSlides}
      homeSlidesStatus={homeSlidesStatus}
      cartCount={cart.isHydrated ? cart.totalQuantity : 0}
      onRetryCategories={retryCategories}
      onRetryFeaturedProducts={featuredCatalog.retryProducts}
      onRetryNewestProducts={newestCatalog.retryProducts}
      onAddToCart={cart.addItem}
      onSelectProduct={handleProductSelect}
      onSearch={handleSearch}
    />
  );
}
