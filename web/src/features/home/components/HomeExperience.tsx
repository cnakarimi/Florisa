"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/features/cart/hooks/CartProvider";
import { useCatalog } from "@/features/catalog/hooks/useCatalog";
import type { CatalogProduct, ProductQuery } from "@/features/catalog/types";
import { useFavorites } from "@/features/favorites/hooks/FavoritesProvider";

import { useHomeSlides } from "../slider/useHomeSlides";
import type { Article } from "../types";

import { ArticleModal } from "./ArticleModal";
import { HomeView } from "./HomeView";

const HOME_PRODUCTS_LIMIT = 8;

export function HomeExperience() {
  const router = useRouter();

  const cart = useCart();
  const { favorites, toggleFavorite } = useFavorites();

  const { slides: homeSlides, status: homeSlidesStatus } = useHomeSlides();

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const [catalogQuery, setCatalogQuery] = useState<ProductQuery>({
    ordering: "newest",
  });

  const selectedCategory = catalogQuery.category ?? null;

  const {
    categories,
    products,
    isCategoriesLoading,
    isProductsLoading,
    categoriesError,
    productsError,
    retryCategories,
    retryProducts,
  } = useCatalog(catalogQuery);

  const latestProducts = products.slice(0, HOME_PRODUCTS_LIMIT);

  const handleCategorySelect = (category: string | null) => {
    setCatalogQuery((current) => ({
      ...current,
      category: category ?? undefined,
    }));
  };

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

  const handleShopClick = () => {
    router.push("/shop");
  };

  const isFavorite = (product: CatalogProduct) =>
    favorites.some((favorite) => favorite.id === product.id);

  return (
    <>
      <HomeView
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
        onSelectCategory={handleCategorySelect}
        onRetryCategories={retryCategories}
        onRetryProducts={retryProducts}
        onToggleFavorite={toggleFavorite}
        onAddToCart={cart.addItem}
        onSelectProduct={handleProductSelect}
        onSelectArticle={setSelectedArticle}
        onShopClick={handleShopClick}
        onSearch={handleSearch}
        isFavorite={isFavorite}
      />

      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </>
  );
}
