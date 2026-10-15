"use client";

import { useId, useState } from "react";
import type { ProductDetailViewProps } from "./ProductDetailView";
import { ProductGallery, type GalleryImage } from "./ProductGallery";
import { ProductInfo } from "./ProductInfo";
import { ProductDescription } from "./ProductDescription";
import { ProductReviews } from "./ProductReviews";
import { RelatedProducts } from "./RelatedProducts";
import { PurchaseBar } from "./PurchaseBar";
import { arrangementComposition, arrangementSpecifications, getArrangementPurchase } from "../../utils/arrangement-detail";
import { toPersianDigits } from "@/utils/persian";
import mobileStyles from "./PlantMobileDetail.module.css";
import styles from "./ArrangementMobileDetail.module.css";

interface Props extends Omit<ProductDetailViewProps, "onAddCutFlowerSelection"> {
  gallery: GalleryImage[];
  selectedImage: number;
  onSelectImage: (index: number) => void;
  onOpenZoom: () => void;
}

export function ArrangementMobileDetail(props: Props) {
  const { product } = props;
  const id = useId();
  const [quantity, setQuantity] = useState(product.minimum_order_quantity);
  const [pending, setPending] = useState(false);
  const [showAllLoadedReviews, setShowAllLoadedReviews] = useState(false);
  const purchase = getArrangementPurchase(quantity, product.minimum_order_quantity, product.stock_quantity, product.is_in_stock, product.price);
  if (product.product_type !== "arrangement") return null;
  const rows = product.details ? arrangementSpecifications(product.details) : [];
  const composition = product.details ? arrangementComposition(product.details) : [];

  return <div data-arrangement-mobile-detail className={`${mobileStyles.page} ${styles.page}`}>
    <ProductGallery gallery={props.gallery} selectedImage={props.selectedImage} onSelectImage={props.onSelectImage} onOpenZoom={props.onOpenZoom} cartCount={props.cartCount} onBack={props.onBack} onNavigateToCart={props.onNavigateToCart} mobilePlant assetDirectory="arrangement-detail" showArrows={false} />
    <div className="px-4 py-4"><ProductInfo product={product} subtitle={product.details?.arrangement_type_display || product.category.name} isFavorite={props.isFavorite} onToggleFavorite={props.onToggleFavorite} mobilePlant assetDirectory="arrangement-detail" /></div>

    <section className={styles.attributes} aria-labelledby={`${id}-attributes`}>
      <div className={styles.attributeHeader}>
        <h2 id={`${id}-attributes`} className="text-mobile-heading-h4 font-semibold">شناسنامه دیزاین گل</h2>
        <div className={styles.quantity} role="group" aria-label="تعداد گل‌آرایی">
          <span className="ps-1 text-mobile-ui-caption text-text-secondary">تعداد</span>
          <button type="button" aria-label="افزایش تعداد گل‌آرایی" disabled={pending || !purchase.canBuy || purchase.quantity >= purchase.availableStock} onClick={() => setQuantity(purchase.quantity + 1)}>+</button>
          <output data-arrangement-quantity aria-live="polite" className="numeric-ltr">{toPersianDigits(purchase.quantity)}</output>
          <button type="button" aria-label="کاهش تعداد گل‌آرایی" disabled={pending || !purchase.canBuy || purchase.quantity <= purchase.minimumQuantity} onClick={() => setQuantity(purchase.quantity - 1)}>−</button>
        </div>
      </div>
      <p className="sr-only">تعداد گل‌آرایی کامل؛ قیمت هر گل‌آرایی {toPersianDigits(product.price.toLocaleString("en-US"))} تومان</p>
      {purchase.minimumQuantity > 1 && <p className="text-mobile-body-small text-text-secondary">حداقل سفارش {toPersianDigits(purchase.minimumQuantity)} گل‌آرایی کامل</p>}
      {rows.length > 0 && <dl className={styles.specifications}>
        {rows.map(row => <div key={row.label}><dt>{row.label}</dt><dd>{toPersianDigits(row.value)}</dd></div>)}
      </dl>}
    </section>

    {composition.length > 0 && <section className={styles.composition} aria-labelledby={`${id}-composition`}>
      <h2 id={`${id}-composition`} className="text-mobile-heading-h4 font-semibold">ترکیب این طراحی</h2>
      <ul className={styles.compositionCard}>
        {composition.map(entry => <li key={entry.id}>
          <span>{entry.label}</span>
          {entry.stem_count !== null && <span className="shrink-0 text-mobile-body-small text-text-secondary"><bdi>{toPersianDigits(entry.stem_count)}</bdi> شاخه</span>}
        </li>)}
      </ul>
    </section>}

    <ProductDescription text={product.description || product.short_description} assetDirectory="arrangement-detail" />
    <ProductReviews reviews={showAllLoadedReviews ? props.reviews : props.reviews.slice(0, 3)} reviewCount={product.review_count} ratingAverage={product.rating_average} isLoading={props.areReviewsLoading} error={props.reviewsError} hasMore={props.hasMoreReviews || (!showAllLoadedReviews && props.reviews.length > 3)} isLoadingMore={props.areMoreReviewsLoading} moreError={props.moreReviewsError} onLoadMore={() => {
      if (!showAllLoadedReviews && props.reviews.length > 3) setShowAllLoadedReviews(true);
      else props.onLoadMoreReviews();
    }} mobilePlant mobileArrangement />
    <RelatedProducts products={props.relatedProducts} isLoading={props.areRelatedProductsLoading} onSelectProduct={props.onSelectProduct} onAddToCart={related => props.onAddToCart(related, Math.max(1, related.minimum_order_quantity))} mobilePlant title="محصولات پیشنهادی" viewAllHref={`/shop?category=${encodeURIComponent(product.category.slug)}`} />
    <PurchaseBar total={purchase.total} canBuy={purchase.canBuy} onPendingChange={setPending} onAdd={() => props.onAddToCart(product, purchase.quantity)} />
  </div>;
}
