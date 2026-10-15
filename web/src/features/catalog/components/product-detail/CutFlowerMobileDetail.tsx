"use client";

import { useId, useState } from "react";
import type { ProductDetailViewProps } from "./ProductDetailView";
import { ProductGallery, type GalleryImage } from "./ProductGallery";
import { ProductInfo } from "./ProductInfo";
import { ProductDescription } from "./ProductDescription";
import { ProductReviews } from "./ProductReviews";
import { RelatedProducts } from "./RelatedProducts";
import { PurchaseBar } from "./PurchaseBar";
import { cutFlowerAttributes, cutFlowerLineError, getCutFlowerPurchase, stepBundleQuantity } from "../../utils/cut-flower-detail";
import { formatTomanAmount, toPersianDigits } from "@/utils/persian";
import mobileStyles from "./PlantMobileDetail.module.css";
import styles from "./CutFlowerMobileDetail.module.css";

interface Props extends ProductDetailViewProps {
  gallery: GalleryImage[];
  selectedImage: number;
  onSelectImage: (index: number) => void;
  onOpenZoom: () => void;
}

export function CutFlowerMobileDetail(props: Props) {
  const { product } = props;
  const id = useId();
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [pending, setPending] = useState(false);
  const [showAllLoadedReviews, setShowAllLoadedReviews] = useState(false);
  if (product.product_type !== "cut_flower") return null;
  const variants = product.details?.variants ?? [];
  const purchase = getCutFlowerPurchase(product, quantities);
  const attributes = cutFlowerAttributes(product);
  const details = product.details;
  const additional = [
    { label: "ماندگاری در گلدان", value: details?.vase_life_days != null ? `${details.vase_life_days} روز` : "" },
    { label: "مبدأ", value: details?.origin },
    { label: "میزان رایحه", value: details?.fragrance_level_display },
    { label: "فصل عرضه", value: details?.seasonal_availability_display },
  ].filter(row => row.value);
  const available = variants.some(variant => !cutFlowerLineError(product, variant, product.minimum_order_quantity));
  const change = (variantId: number, quantity: number) => setQuantities(current => ({ ...current, [variantId]: quantity }));

  return <div data-cut-flower-mobile-detail className={`${mobileStyles.page} ${styles.page}`}>
    <ProductGallery gallery={props.gallery} selectedImage={props.selectedImage} onSelectImage={props.onSelectImage} onOpenZoom={props.onOpenZoom} cartCount={props.cartCount} onBack={props.onBack} onNavigateToCart={props.onNavigateToCart} mobilePlant assetDirectory="arrangement-detail" showArrows={false} />
    <div className="px-4 py-4"><ProductInfo product={product} subtitle={`دسته ${toPersianDigits(product.unit_size)} تایی`} isFavorite={props.isFavorite} onToggleFavorite={props.onToggleFavorite} mobilePlant assetDirectory="arrangement-detail" /></div>

    <section className={styles.picker} aria-labelledby={`${id}-picker`}>
      <h2 id={`${id}-picker`}>{product.name}</h2>
      <p className={styles.hint}>رنگ مورد نظر خود را انتخاب کرده و تعداد دسته را برای هر رنگ مشخص کنید.{product.minimum_order_quantity > 1 && <span className="block">حداقل سفارش هر رنگ {toPersianDigits(product.minimum_order_quantity)} دسته است.</span>}</p>
      <div className={styles.rows}>
        {variants.map(variant => {
          const quantity = quantities[variant.id] ?? 0;
          const unavailable = Boolean(cutFlowerLineError(product, variant, product.minimum_order_quantity));
          const error = quantity > 0 ? cutFlowerLineError(product, variant, quantity) : "";
          return <div key={variant.id} data-cut-flower-variant={variant.id} className={`${styles.row} ${quantity > 0 ? styles.selected : ""}`}>
            <div className={styles.info}>
              <p className={styles.color}><span>{variant.color}</span>{quantity > 0 && <span className={styles.badge}>انتخاب شده</span>}</p>
              <p className={styles.price}><bdi>{formatTomanAmount(variant.price)}</bdi><small>ت / دسته</small></p>
              {unavailable && !error && <p className={styles.hint}>ناموجود</p>}
              {error && <p role="status" className={styles.error}>{toPersianDigits(error)}</p>}
              <output className="sr-only" data-variant-line-total aria-label={`مجموع قیمت رنگ ${variant.color}`}>{formatTomanAmount(quantity * variant.price)} تومان</output>
            </div>
            <div className={styles.quantity}>
              <div className={styles.controls} role="group" aria-label={`تعداد دسته ${variant.color}`}>
                <button type="button" aria-label={`کاهش دسته ${variant.color}`} disabled={pending || quantity === 0} onClick={() => change(variant.id, stepBundleQuantity(quantity, -1, product.minimum_order_quantity, variant.stock_quantity))}>−</button>
                <output data-bundle-quantity aria-live="polite" className="numeric-ltr">{toPersianDigits(quantity)}</output>
                <button type="button" aria-label={`افزایش دسته ${variant.color}`} disabled={pending || unavailable || quantity >= variant.stock_quantity} onClick={() => change(variant.id, stepBundleQuantity(quantity, 1, product.minimum_order_quantity, variant.stock_quantity))}>+</button>
              </div>
              <p><bdi>{toPersianDigits(quantity * product.unit_size)}</bdi> شاخه</p>
            </div>
          </div>;
        })}
      </div>
      {variants.length === 0 && <p className={styles.hint}>در حال حاضر رنگی برای سفارش موجود نیست.</p>}
      {purchase.lines.filter(line => !line.variant).map(line => <div key={line.variantId} role="status" className={styles.error}>
        {line.error}<button type="button" disabled={pending} onClick={() => change(line.variantId, 0)} className="ms-2 underline">پاک کردن انتخاب ناموجود</button>
      </div>)}
      <dl className={styles.summary} aria-live="polite">
        <div><dt>مجموع انتخاب شده:</dt><dd><span data-cut-flower-bundles>{toPersianDigits(purchase.bundles)} دسته</span><small>(معادل <bdi data-cut-flower-stems>{toPersianDigits(purchase.stems)}</bdi> شاخه گل)</small></dd></div>
        <div><dt>مجموع قیمت رنگ‌ها:</dt><dd><strong data-cut-flower-total>{formatTomanAmount(purchase.total)} تومان</strong></dd></div>
      </dl>
    </section>

    <section className={styles.attributes} aria-labelledby={`${id}-attributes`}>
      <h2 id={`${id}-attributes`}>مشخصات فنی شاخه</h2>
      <dl className={styles.strip}>{attributes.map(row => <div key={row.label}><dt>{row.label}</dt><dd className={row.emphasized ? "text-text-brand" : ""}>{toPersianDigits(row.value)}</dd></div>)}</dl>
      {additional.length > 0 && <dl className={styles.additional}>{additional.map(row => <div key={row.label}><dt>{row.label}</dt><dd>{toPersianDigits(row.value!)}</dd></div>)}</dl>}
    </section>
    <ProductDescription text={product.description || product.short_description} assetDirectory="arrangement-detail" />
    {details?.care_notes && <ProductDescription title="راهنمای نگهداری" text={details.care_notes} assetDirectory="arrangement-detail" />}
    {details?.shipping_notes && <ProductDescription title="نکات ارسال" text={details.shipping_notes} assetDirectory="arrangement-detail" />}
    <ProductReviews reviews={showAllLoadedReviews ? props.reviews : props.reviews.slice(0, 3)} reviewCount={product.review_count} ratingAverage={product.rating_average} isLoading={props.areReviewsLoading} error={props.reviewsError} hasMore={props.hasMoreReviews || (!showAllLoadedReviews && props.reviews.length > 3)} isLoadingMore={props.areMoreReviewsLoading} moreError={props.moreReviewsError} onLoadMore={() => {
      if (!showAllLoadedReviews && props.reviews.length > 3) setShowAllLoadedReviews(true);
      else props.onLoadMoreReviews();
    }} mobilePlant mobileArrangement />
    <RelatedProducts products={props.relatedProducts} isLoading={props.areRelatedProductsLoading} onSelectProduct={props.onSelectProduct} onAddToCart={related => props.onAddToCart(related, Math.max(1, related.minimum_order_quantity))} mobilePlant title="گل‌های پیشنهادی" viewAllHref="/shop?product_type=cut_flower" />
    <PurchaseBar total={purchase.total} canBuy={purchase.canAdd} mutedDisabled disabledLabel={available ? "افزودن به سبد" : "ناموجود"} onPendingChange={setPending} onAdd={() => props.onAddCutFlowerSelection(product, purchase.selection)} summary={<div className={styles.barSummary}>
      {purchase.bundles > 0 ? <><span><bdi>{toPersianDigits(purchase.bundles)}</bdi> دسته · <bdi>{toPersianDigits(purchase.stems)}</bdi> شاخه</span><strong><bdi data-purchase-total>{formatTomanAmount(purchase.total)}</bdi> تومان</strong></> : <span>تعداد دسته‌ها را انتخاب کنید</span>}
    </div>} />
  </div>;
}
