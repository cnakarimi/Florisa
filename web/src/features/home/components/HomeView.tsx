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
  featuredProducts,
  newestProducts,
  isCategoriesLoading,
  isFeaturedProductsLoading,
  isNewestProductsLoading,
  categoriesError,
  featuredProductsError,
  newestProductsError,
  homeSlides,
  homeSlidesStatus,
  cartCount,
  onRetryCategories,
  onRetryFeaturedProducts,
  onRetryNewestProducts,
  onAddToCart,
  onSelectProduct,
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
              id="featured-products"
              title="محصولات منتخب"
              products={featuredProducts}
              isLoading={isFeaturedProductsLoading}
              error={featuredProductsError}
              onRetry={onRetryFeaturedProducts}
              onAddToCart={onAddToCart}
              onSelectProduct={onSelectProduct}
            />

            <MagazineSection />

            <ProductsSection
              id="newest-products"
              title="جدیدترین محصولات"
              products={newestProducts}
              isLoading={isNewestProductsLoading}
              error={newestProductsError}
              onRetry={onRetryNewestProducts}
              onAddToCart={onAddToCart}
              onSelectProduct={onSelectProduct}
            />

            <section className="mx-auto w-full max-w-[1600px] py-10 lg:px-8 lg:pb-20 lg:pt-4">
              <FeaturesGrid />
            </section>
          </div>
        </main>

        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
