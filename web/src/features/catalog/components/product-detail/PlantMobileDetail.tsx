"use client";

import { useState } from "react";
import type { ProductDetailViewProps } from "./ProductDetailView";
import { ProductGallery, type GalleryImage } from "./ProductGallery";
import { ProductInfo } from "./ProductInfo";
import { ProductDescription } from "./ProductDescription";
import { PlantCareGuide, PlantSpecifications } from "./PlantMobileSections";
import { ProductReviews } from "./ProductReviews";
import { RelatedProducts } from "./RelatedProducts";
import { PurchaseBar } from "./PurchaseBar";
import { getPlantPurchase } from "@/features/catalog/utils/plant-detail";
import { toPersianDigits } from "@/utils/persian";
import styles from "./PlantMobileDetail.module.css";
import type { PlantPotOption } from "../../types";
import { ProductPotSelector } from "./ProductPotSelector";
import { selectedPotDetails } from "../../utils/pot-options";

interface PlantMobileDetailProps extends ProductDetailViewProps {
  gallery: GalleryImage[];
  selectedImage: number;
  onSelectImage: (index: number) => void;
  onOpenZoom: () => void;
  potOptions: PlantPotOption[];
  selectedPot: PlantPotOption | null;
  potAvailable: boolean;
  onSelectPot: (option: PlantPotOption) => void;
}

export function PlantMobileDetail(props: PlantMobileDetailProps) {
  const { product, gallery, selectedImage, onSelectImage, onOpenZoom } = props;
  const [requestedQuantity, setRequestedQuantity] = useState(Math.max(1, product.minimum_order_quantity));
  const purchase = getPlantPurchase(requestedQuantity, product.minimum_order_quantity, props.selectedPot?.max_quantity ?? product.stock_quantity, product.is_in_stock && props.potAvailable, props.selectedPot?.unit_price ?? product.price);
  if (product.product_type !== "plant") return null;
  return <div data-plant-mobile-detail className={styles.page}>
    <ProductGallery gallery={gallery} selectedImage={selectedImage} onSelectImage={onSelectImage} onOpenZoom={onOpenZoom} cartCount={props.cartCount} onBack={props.onBack} onNavigateToCart={props.onNavigateToCart} mobilePlant
      caption={props.selectedPot?.configuration_image && !(gallery[selectedImage] ?? gallery[0]).isConfiguration ? "تصویر عمومی گیاه؛ این تصویر ترکیب انتخاب‌شده را نشان نمی‌دهد." : undefined} />
    <div className="px-4 py-4"><ProductInfo product={product} potName={props.selectedPot?.name} isFavorite={props.isFavorite} onToggleFavorite={props.onToggleFavorite} mobilePlant /></div>
    {props.selectedPot && <div className="px-4"><ProductPotSelector options={props.potOptions} selected={props.selectedPot} available={props.potAvailable} productAvailable={product.is_in_stock} onSelect={props.onSelectPot} /></div>}
    <section className="px-4 py-4" aria-labelledby="plant-quantity-title">
      <div className="flex items-center justify-between gap-4">
        <div><h2 id="plant-quantity-title" className="text-mobile-ui-button font-semibold">تعداد گلدان</h2><p className="mt-1 text-mobile-ui-caption text-text-secondary">{purchase.canBuy ? `حداقل سفارش ${toPersianDigits(purchase.minimumQuantity)} گلدان` : "در حال حاضر ناموجود"}</p></div>
        <div className="flex h-10 items-center rounded-xl border border-white/10 bg-background-secondary" role="group" aria-label="تعداد گلدان">
          <button type="button" aria-label="افزایش تعداد گلدان" disabled={!purchase.canBuy || purchase.quantity >= purchase.availableStock} onClick={() => setRequestedQuantity(purchase.quantity + 1)} className="h-10 w-10 text-xl text-text-brand disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-action-primary">+</button>
          <output aria-live="polite" className="numeric-ltr min-w-10 text-center text-sm font-semibold">{toPersianDigits(purchase.quantity)}</output>
          <button type="button" aria-label="کاهش تعداد گلدان" disabled={!purchase.canBuy || purchase.quantity <= purchase.minimumQuantity} onClick={() => setRequestedQuantity(purchase.quantity - 1)} className="h-10 w-10 text-xl text-text-brand disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-action-primary">−</button>
        </div>
      </div>
    </section>
    {product.details && <PlantCareGuide details={product.details} />}
    <ProductDescription text={product.description || product.short_description} />
    {product.details && <PlantSpecifications details={selectedPotDetails(product.details, props.selectedPot)} />}
    <ProductReviews reviews={props.reviews} reviewCount={product.review_count} ratingAverage={product.rating_average} isLoading={props.areReviewsLoading} error={props.reviewsError} hasMore={props.hasMoreReviews} isLoadingMore={props.areMoreReviewsLoading} moreError={props.moreReviewsError} onLoadMore={props.onLoadMoreReviews} mobilePlant />
    <RelatedProducts products={props.relatedProducts} isLoading={props.areRelatedProductsLoading} onSelectProduct={props.onSelectProduct} onAddToCart={related => props.onAddToCart(related, Math.max(1, related.minimum_order_quantity))} mobilePlant />
    <PurchaseBar total={purchase.total} canBuy={purchase.canBuy} onAdd={() => props.onAddToCart(product, purchase.quantity, undefined, props.selectedPot?.id)} />
  </div>;
}
