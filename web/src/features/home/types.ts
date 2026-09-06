import type { CatalogCategory, CatalogProduct } from "@/features/catalog/types";
import type { HomeSlide, HomeSlidesStatus } from "@/features/home/slider/types";

export interface HomeExperiencePresentationProps {
  categories: CatalogCategory[];
  latestProducts: CatalogProduct[];

  isCategoriesLoading: boolean;
  isProductsLoading: boolean;

  categoriesError: string | null;
  productsError: string | null;

  homeSlides: HomeSlide[];
  homeSlidesStatus: HomeSlidesStatus;

  cartCount: number;

  onRetryCategories: () => void;
  onRetryProducts: () => void;

  onAddToCart: (product: CatalogProduct) => void;
  onSelectProduct: (product: CatalogProduct) => void;

  onSearch: (query: string) => void;
}
