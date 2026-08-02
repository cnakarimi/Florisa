import type {
  CatalogCategory,
  CatalogProduct,
  CatalogProductDetail,
  PaginatedCatalogProducts,
  ProductQuery,
} from "@/features/catalog/types";
import { ApiError, apiRequest } from "@/lib/api/client";

const requestCache = new Map<string, Promise<unknown>>();

function cachedRequest<T>(path: string, force = false): Promise<T> {
  if (force) requestCache.delete(path);
  const cached = requestCache.get(path);
  if (cached) return cached as Promise<T>;
  const request = apiRequest<T>(path).catch((error: unknown) => {
    requestCache.delete(path);
    throw error;
  });
  requestCache.set(path, request);
  return request;
}

function productQueryPath(query: ProductQuery): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const queryString = params.toString();
  return `/api/products/${queryString ? `?${queryString}` : ""}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCategory(value: unknown): value is CatalogCategory {
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

function isProduct(value: unknown): value is CatalogProduct {
  if (!isRecord(value) || !hasSharedProductFields(value)) return false;
  if (value.details !== null && !isRecord(value.details)) return false;
  if (value.product_type === "plant") {
    return value.details === null || typeof value.details.plant_type === "string";
  }
  if (value.product_type === "cut_flower") {
    return value.details === null || typeof value.details.flower_type === "string";
  }
  return false;
}

function isProductDetail(value: unknown): value is CatalogProductDetail {
  if (!isRecord(value) || !isProduct(value)) return false;
  return (
    typeof value.description === "string" &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string" &&
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

function isPaginatedProducts(
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

export async function getCategories(force = false): Promise<CatalogCategory[]> {
  const data = await cachedRequest<unknown>("/api/categories/", force);
  if (!Array.isArray(data) || !data.every(isCategory)) {
    throw new ApiError("پاسخ دسته‌بندی‌ها از سرور معتبر نیست.", 502, {}, data);
  }
  return data;
}

export async function getProducts(
  query: ProductQuery,
  force = false,
): Promise<PaginatedCatalogProducts> {
  const data = await cachedRequest<unknown>(productQueryPath(query), force);
  if (!isPaginatedProducts(data)) {
    throw new ApiError("پاسخ محصولات از سرور معتبر نیست.", 502, {}, data);
  }
  return data;
}

export async function getProductDetail(
  slug: string,
  force = false,
): Promise<CatalogProductDetail> {
  const data = await cachedRequest<unknown>(
    `/api/products/${encodeURIComponent(slug)}/`,
    force,
  );
  if (!isProductDetail(data)) {
    throw new ApiError("پاسخ جزئیات محصول از سرور معتبر نیست.", 502, {}, data);
  }
  return data;
}
