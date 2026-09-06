"use client";

import { useRouter } from "next/navigation";

import type { CatalogProduct, ProductQuery } from "@/features/catalog/types";
import { useCatalog } from "@/features/catalog/hooks/useCatalog";
import { useCart } from "@/features/cart/hooks/CartProvider";

import { useHomeSlides } from "../slider/useHomeSlides";
import { HomeView } from "./HomeView";

const HOME_PRODUCTS_LIMIT = 8;

const HOME_CATALOG_QUERY: ProductQuery = {
  ordering: "newest",
};

export function HomeExperience() {
  const router = useRouter();

  const cart = useCart();
  const { slides: homeSlides, status: homeSlidesStatus } = useHomeSlides();

  const {
    categories,
    products,
    isCategoriesLoading,
    isProductsLoading,
    categoriesError,
    productsError,
    retryCategories,
    retryProducts,
  } = useCatalog(HOME_CATALOG_QUERY);

  const latestProducts = products.slice(0, HOME_PRODUCTS_LIMIT);

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
      latestProducts={latestProducts}
      isCategoriesLoading={isCategoriesLoading}
      isProductsLoading={isProductsLoading}
      categoriesError={categoriesError}
      productsError={productsError}
      homeSlides={homeSlides}
      homeSlidesStatus={homeSlidesStatus}
      cartCount={cart.isHydrated ? cart.totalQuantity : 0}
      onRetryCategories={retryCategories}
      onRetryProducts={retryProducts}
      onAddToCart={cart.addItem}
      onSelectProduct={handleProductSelect}
      onSearch={handleSearch}
    />
  );
}
