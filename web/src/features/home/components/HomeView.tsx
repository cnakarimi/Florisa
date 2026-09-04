"use client";

import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { BottomNav } from "@/components/navigation/BottomNav";
import { ScrollNavbar } from "@/components/navigation/ScrollNavbar";

import type { HomeExperiencePresentationProps } from "../types";

import { CategoriesSection } from "./CategoriesSection";
import { FeaturesGrid } from "./FeaturesGrid";
import { HomeHero } from "./HomeHero";
import { MagazineSection } from "./MagazineSection";
import { ProductsSection } from "./ProductsSection";

export function HomeView({
  categories,
  latestProducts,
  isCategoriesLoading,
  isProductsLoading,
  categoriesError,
  productsError,
  homeSlides,
  homeSlidesStatus,
  cartCount,
  onRetryCategories,
  onRetryProducts,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
  onShopClick,
  onSearch,
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
              isCategoriesLoading={isCategoriesLoading}
              categoriesError={categoriesError}
              onRetryCategories={onRetryCategories}
            />

            <ProductsSection
              latestProducts={latestProducts}
              isProductsLoading={isProductsLoading}
              productsError={productsError}
              onRetryProducts={onRetryProducts}
              onToggleFavorite={onToggleFavorite}
              onAddToCart={onAddToCart}
              onSelectProduct={onSelectProduct}
              onShopClick={onShopClick}
            />

            <section className="mx-auto hidden max-w-[1600px] px-8 pb-20 lg:block">
              <FeaturesGrid />
            </section>

            <MagazineSection />
          </div>
        </main>

        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
