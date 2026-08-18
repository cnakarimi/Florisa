import type { CatalogCategory, CatalogProduct } from "@/features/catalog/types";

import type { HomeSlide, HomeSlidesStatus } from "../slider/types";
import type { Article } from "../types";

export interface HomeExperiencePresentationProps {
  categories: CatalogCategory[];
  latestProducts: CatalogProduct[];
  selectedCategory: string | null;
  isCategoriesLoading: boolean;
  isProductsLoading: boolean;
  categoriesError: string | null;
  productsError: string | null;
  homeSlides: HomeSlide[];
  homeSlidesStatus: HomeSlidesStatus;
  cartCount: number;
  favoritesCount: number;
  onSelectCategory: (category: string | null) => void;
  onRetryCategories: () => void;
  onRetryProducts: () => void;
  onToggleFavorite: (product: CatalogProduct) => void;
  onAddToCart: (product: CatalogProduct) => void;
  onSelectProduct: (product: CatalogProduct) => void;
  onSelectArticle: (article: Article) => void;
  onShopClick: () => void;
  onSearch: (query: string) => void;
  isFavorite: (product: CatalogProduct) => boolean;
}
