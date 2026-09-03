import type { CatalogProduct } from "@/features/catalog/types";

import { ProductsSlider } from "./ProductsSlider";

interface ProductsSectionProps {
  latestProducts: CatalogProduct[];
  selectedCategory: string | null;
  isProductsLoading: boolean;
  productsError: string | null;
  onRetryProducts: () => void;
  onToggleFavorite: (product: CatalogProduct) => void;
  onAddToCart: (product: CatalogProduct) => void;
  onSelectProduct: (product: CatalogProduct) => void;
  onShopClick: () => void;
  isFavorite: (product: CatalogProduct) => boolean;
}

export function ProductsSection(props: ProductsSectionProps) {
  const { onShopClick } = props;

  return (
    <section
      className="mx-auto max-w-[1600px] pb-2 pt-6 sm:pt-8 lg:px-8 lg:pb-20 lg:pt-0"
      aria-labelledby="home-products-title"
    >
      <div className="mb-4 flex items-center justify-between sm:mb-6 lg:mb-7">
        <h2
          id="home-products-title"
          className="text-desktop-heading-h2 text-[#dedbd5] lg:text-white"
        >
          جدیدترین محصولات
        </h2>

        <button type="button" onClick={onShopClick}>
          مشاهده همه
        </button>
      </div>

      <ProductsSlider {...props} />
    </section>
  );
}
