import type { CatalogCategory, CatalogProduct } from "@/features/catalog/types";
import type { HomeSlide, HomeSlidesStatus } from "@/features/home/slider/types";

export interface HomeExperiencePresentationProps {
  categories: CatalogCategory[];
  featuredProducts: CatalogProduct[];
  newestProducts: CatalogProduct[];

  isCategoriesLoading: boolean;
  isFeaturedProductsLoading: boolean;
  isNewestProductsLoading: boolean;

  categoriesError: string | null;
  featuredProductsError: string | null;
  newestProductsError: string | null;

  homeSlides: HomeSlide[];
  homeSlidesStatus: HomeSlidesStatus;

  cartCount: number;

  onRetryCategories: () => void;
  onRetryFeaturedProducts: () => void;
  onRetryNewestProducts: () => void;

  onAddToCart: (product: CatalogProduct) => void;
  onSelectProduct: (product: CatalogProduct) => void;

  onSearch: (query: string) => void;
}
