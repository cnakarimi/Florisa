import { CatalogFeedback } from "@/features/catalog/components/CatalogFeedback";

import { BottomNav } from "./BottomNav";
import { CategoriesSection } from "./CategoriesSection";
import { HeroSection } from "./HeroSection";
import type { HomeExperiencePresentationProps } from "./homeExperience.types";
import { MagazineSection } from "./MagazineSection";
import { ProductCard } from "./ProductCard";
import { ShopNavigationScrollNavbar } from "./ShopNavigationScrollNavbar";

export function MobileHomeExperience({
  categories,
  latestProducts,
  selectedCategory,
  isCategoriesLoading,
  isProductsLoading,
  categoriesError,
  productsError,
  onSelectCategory,
  onRetryCategories,
  onRetryProducts,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
  onSelectArticle,
  onShopClick,
  isFavorite,
}: HomeExperiencePresentationProps) {
  const latestProductsContent = isProductsLoading ? (
    <CatalogFeedback kind="loading" />
  ) : productsError && latestProducts.length === 0 ? (
    <CatalogFeedback
      kind="error"
      message={productsError}
      onRetry={onRetryProducts}
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
            isFavorite={isFavorite(product)}
            onToggleFavorite={onToggleFavorite}
            onAddToCart={onAddToCart}
            onSelectProduct={onSelectProduct}
          />
        </div>
      ))}
    </div>
  );

  return (
    <>
      <ShopNavigationScrollNavbar />

      <div className="min-h-dvh bg-black text-zinc-100 selection:bg-[#c7a23c]/30 selection:text-white">
        <div className="relative mx-auto min-h-dvh w-full max-w-screen-lg overflow-x-hidden bg-[#111211] shadow-2xl shadow-black">
          <main>
            <div className="animate-in fade-in duration-300">
              <HeroSection onShopClick={onShopClick} />

              <div className="px-4 sm:px-6 md:px-8">
                {isCategoriesLoading ||
                Boolean(categoriesError) ||
                categories.length >= 2 ? (
                  <CategoriesSection
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={onSelectCategory}
                    isLoading={isCategoriesLoading}
                    error={categoriesError}
                    onRetry={onRetryCategories}
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
                      <span className="relative grid h-7 w-7 place-items-center text-[#cda62e] sm:h-8 sm:w-8" />
                    </h2>

                    <button
                      type="button"
                      onClick={onShopClick}
                      className="shrink-0 text-xs font-medium text-[#c5a33d] transition-colors hover:text-[#e2c465] sm:text-sm"
                    >
                      مشاهده همه
                    </button>
                  </div>

                  {latestProductsContent}
                </section>

                <MagazineSection onSelectArticle={onSelectArticle} />
              </div>
            </div>
          </main>

          <BottomNav />
        </div>
      </div>
    </>
  );
}
