"use client";

import type { ProductDetailViewProps } from "./ProductDetailView";
import { ProductGallery, type GalleryImage } from "./ProductGallery";
import { ProductInfo } from "./ProductInfo";
import { ProductDescription } from "./ProductDescription";
import { PlantCareGuide, PlantSpecifications } from "./PlantMobileSections";
import { ProductReviews } from "./ProductReviews";
import { RelatedProducts } from "./RelatedProducts";
import { PurchaseBar } from "./PurchaseBar";
import { getPlantPurchase } from "@/features/catalog/utils/plant-detail";
import { PlantQuantitySelector } from "./PlantQuantitySelector";
import styles from "./PlantMobileDetail.module.css";
import type { PlantPotOption } from "../../types";
import { ProductPotSelector } from "./ProductPotSelector";
import { selectedPotDetails } from "../../utils/pot-options";

interface PlantMobileDetailProps extends Omit<ProductDetailViewProps, "onAddCutFlowerSelection"> {
  gallery: GalleryImage[];
  selectedImage: number;
  onSelectImage: (index: number) => void;
  onOpenZoom: () => void;
  potOptions: PlantPotOption[];
  selectedPot: PlantPotOption | null;
  potAvailable: boolean;
  onSelectPot: (option: PlantPotOption) => void;
  quantity: number;
  onChangeQuantity: (quantity: number) => void;
}

export function PlantMobileDetail(props: PlantMobileDetailProps) {
  const { product, gallery, selectedImage, onSelectImage, onOpenZoom } = props;
  const purchase = getPlantPurchase(props.quantity, product.minimum_order_quantity, props.selectedPot?.max_quantity ?? product.stock_quantity, product.is_in_stock && props.potAvailable, props.selectedPot?.unit_price ?? product.price);
  if (product.product_type !== "plant") return null;
  return <div data-plant-mobile-detail className={styles.page}>
    <ProductGallery gallery={gallery} selectedImage={selectedImage} onSelectImage={onSelectImage} onOpenZoom={onOpenZoom} cartCount={props.cartCount} onBack={props.onBack} onNavigateToCart={props.onNavigateToCart} mobilePlant
      caption={props.selectedPot && !(gallery[selectedImage] ?? gallery[0]).isConfiguration ? "تصویر عمومی گیاه؛ این تصویر ترکیب انتخاب‌شده را نشان نمی‌دهد." : undefined} />
    <div className="px-4 py-4"><ProductInfo product={product} potName={props.selectedPot?.name} isFavorite={props.isFavorite} onToggleFavorite={props.onToggleFavorite} mobilePlant /></div>
    {props.selectedPot && <div className="px-4"><ProductPotSelector options={props.potOptions} selected={props.selectedPot} available={props.potAvailable} productAvailable={product.is_in_stock} onSelect={props.onSelectPot} /></div>}
    <div className="px-4"><PlantQuantitySelector quantity={purchase.quantity} minimum={purchase.minimumQuantity} maximum={purchase.availableStock} available={purchase.canBuy} onChange={props.onChangeQuantity} /></div>
    {product.details && <PlantCareGuide details={product.details} />}
    <ProductDescription text={product.description || product.short_description} />
    {product.details && <PlantSpecifications details={selectedPotDetails(product.details, props.selectedPot)} />}
    <ProductReviews reviews={props.reviews} reviewCount={product.review_count} ratingAverage={product.rating_average} isLoading={props.areReviewsLoading} error={props.reviewsError} hasMore={props.hasMoreReviews} isLoadingMore={props.areMoreReviewsLoading} moreError={props.moreReviewsError} onLoadMore={props.onLoadMoreReviews} mobilePlant />
    <RelatedProducts products={props.relatedProducts} isLoading={props.areRelatedProductsLoading} onSelectProduct={props.onSelectProduct} onAddToCart={related => props.onAddToCart(related, Math.max(1, related.minimum_order_quantity))} mobilePlant />
    <PurchaseBar key={`${product.id}:${props.selectedPot?.id ?? "baseline"}:${purchase.quantity}`} total={purchase.total} canBuy={purchase.canBuy} onAdd={() => props.onAddToCart(product, purchase.quantity, undefined, props.selectedPot?.id)} />
  </div>;
}
