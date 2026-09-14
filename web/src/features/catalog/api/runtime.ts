import type {
  CatalogCategory,
  CatalogProduct,
  CatalogProductDetail,
  CatalogProductReview,
  PaginatedCatalogProducts,
  PaginatedProductReviews,
} from "@/features/catalog/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isCategory(value: unknown): value is CatalogCategory {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.name === "string" &&
    typeof value.slug === "string" &&
    typeof value.sort_order === "number"
  );
}

function hasSharedProductFields(value: Record<string, unknown>): boolean {
  return (
    typeof value.id === "number" &&
    typeof value.name === "string" &&
    typeof value.slug === "string" &&
    typeof value.product_type_display === "string" &&
    typeof value.short_description === "string" &&
    typeof value.price === "number" &&
    typeof value.stock_quantity === "number" &&
    typeof value.sale_unit === "string" &&
    typeof value.sale_unit_display === "string" &&
    typeof value.unit_size === "number" &&
    typeof value.minimum_order_quantity === "number" &&
    (typeof value.cover_image === "string" || value.cover_image === null) &&
    typeof value.is_featured === "boolean" &&
    typeof value.is_in_stock === "boolean" &&
    isRecord(value.category) &&
    typeof value.category.id === "number" &&
    typeof value.category.name === "string" &&
    typeof value.category.slug === "string"
  );
}

export function isProduct(value: unknown): value is CatalogProduct {
  if (!isRecord(value) || !hasSharedProductFields(value)) {
    return false;
  }

  if (value.details !== null && !isRecord(value.details)) {
    return false;
  }

  if (value.product_type === "plant") {
    return (
      value.details === null || typeof value.details.plant_type === "string"
    );
  }

  if (value.product_type === "cut_flower") {
    return (
      value.details === null || typeof value.details.flower_type === "string"
    );
  }

  return false;
}

export function isProductList(value: unknown): value is CatalogProduct[] {
  return Array.isArray(value) && value.every(isProduct);
}

export function isProductDetail(value: unknown): value is CatalogProductDetail {
  if (!isRecord(value) || !isProduct(value)) {
    return false;
  }

  return (
    typeof value.description === "string" &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string" &&
    (value.rating_average === null ||
      typeof value.rating_average === "number") &&
    typeof value.review_count === "number" &&
    Array.isArray(value.images) &&
    value.images.every(
      (image) =>
        isRecord(image) &&
        typeof image.id === "number" &&
        typeof image.image === "string" &&
        typeof image.alt_text === "string" &&
        typeof image.sort_order === "number",
    )
  );
}

export function isPaginatedProducts(
  value: unknown,
): value is PaginatedCatalogProducts {
  return (
    isRecord(value) &&
    typeof value.count === "number" &&
    (typeof value.next === "string" || value.next === null) &&
    (typeof value.previous === "string" || value.previous === null) &&
    Array.isArray(value.results) &&
    value.results.every(isProduct)
  );
}

export function isProductReview(value: unknown): value is CatalogProductReview {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    typeof value.reviewer_name === "string" &&
    typeof value.rating === "number" &&
    value.rating >= 1 &&
    value.rating <= 5 &&
    typeof value.comment === "string" &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string"
  );
}

export function isPaginatedProductReviews(
  value: unknown,
): value is PaginatedProductReviews {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.count === "number" &&
    (value.next === null || typeof value.next === "string") &&
    (value.previous === null || typeof value.previous === "string") &&
    Array.isArray(value.results) &&
    value.results.every(isProductReview)
  );
}
