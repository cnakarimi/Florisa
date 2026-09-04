"use client";

import { BottomNav } from "@/components/navigation/BottomNav";
import { ScrollNavbar } from "@/components/navigation/ScrollNavbar";

import { CategoriesSection } from "./CategoriesSection";
import { DesktopHeader } from "./DesktopHeader";
import { FeaturesGrid } from "./FeaturesGrid";
import { HomeHero } from "./HomeHero";
import type { HomeExperiencePresentationProps } from "./homeExperience.types";
import { MagazineSection } from "./MagazineSection";
import { ProductsSection } from "./ProductsSection";

export function HomeView({
  categories,
  latestProducts,
  selectedCategory,
  isCategoriesLoading,
  isProductsLoading,
  categoriesError,
  productsError,
  homeSlides,
  homeSlidesStatus,
  cartCount,
  onSelectCategory,
  onRetryCategories,
  onRetryProducts,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
  onSelectArticle,
  onShopClick,
  onSearch,
  isFavorite,
}: HomeExperiencePresentationProps) {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      data-home-experience="responsive"
      className="min-h-dvh overflow-x-clip bg-black text-zinc-100 selection:bg-[#c7a23c]/30 selection:text-white lg:bg-[#0d0f0e]"
    >
      <div className="lg:hidden">
        <ScrollNavbar
          searchQuery=""
          onSearch={onSearch}
          onLogoClick={scrollToTop}
        />
      </div>

      <DesktopHeader cartCount={cartCount} />

      <div className="relative mx-auto min-h-dvh w-full bg-background-primary">
        <main>
          <HomeHero slides={homeSlides} status={homeSlidesStatus} />

          <div className="px-4 sm:px-6 md:px-8 lg:contents">
            <CategoriesSection
              categories={categories}
              selectedCategory={selectedCategory}
              isCategoriesLoading={isCategoriesLoading}
              categoriesError={categoriesError}
              onSelectCategory={onSelectCategory}
              onRetryCategories={onRetryCategories}
            />

            <ProductsSection
              latestProducts={latestProducts}
              selectedCategory={selectedCategory}
              isProductsLoading={isProductsLoading}
              productsError={productsError}
              onRetryProducts={onRetryProducts}
              onToggleFavorite={onToggleFavorite}
              onAddToCart={onAddToCart}
              onSelectProduct={onSelectProduct}
              onShopClick={onShopClick}
              isFavorite={isFavorite}
            />

            <section className="mx-auto hidden max-w-[1600px] px-8 pb-20 lg:block">
              <FeaturesGrid />
            </section>

            <MagazineSection onSelectArticle={onSelectArticle} />
          </div>
        </main>

        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
