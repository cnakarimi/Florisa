import type {
  CatalogCategory,
  CatalogProductDetail,
  PaginatedCatalogProducts,
  ProductQuery,
} from "@/features/catalog/types";
import { ApiError, apiRequest } from "@/lib/api/client";

const requestCache = new Map<string, Promise<unknown>>();

function cachedRequest<T>(
  path: string,
  force = false,
): Promise<T> {
  if (force) {
    requestCache.delete(path);
  }

  const cached = requestCache.get(path);
  if (cached) {
    return cached as Promise<T>;
  }

  const request = apiRequest<T>(path).catch((error: unknown) => {
    requestCache.delete(path);
    throw error;
  });
  requestCache.set(path, request);
  return request;
}

function productQueryPath(query: ProductQuery): string {
  const params = new URLSearchParams();

  if (query.category) {
    params.set("category", query.category);
  }
  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }
  if (typeof query.featured === "boolean") {
    params.set("featured", String(query.featured));
  }
  if (query.ordering) {
    params.set("ordering", query.ordering);
  }
  if (query.page) {
    params.set("page", String(query.page));
  }
  if (query.page_size) {
    params.set("page_size", String(query.page_size));
  }

  const queryString = params.toString();
  return `/api/products/${queryString ? `?${queryString}` : ""}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOptionalString(
  value: Record<string, unknown>,
  key: string,
): boolean {
  return !(key in value) || typeof value[key] === "string";
}

function isOptionalNullableNumber(
  value: Record<string, unknown>,
  key: string,
): boolean {
  return (
    !(key in value) ||
    value[key] === null ||
    typeof value[key] === "number"
  );
}

function isOptionalNullableBoolean(
  value: Record<string, unknown>,
  key: string,
): boolean {
  return (
    !(key in value) ||
    value[key] === null ||
    typeof value[key] === "boolean"
  );
}

function isProductDetail(value: unknown): value is CatalogProductDetail {
  if (!isRecord(value) || !isRecord(value.category)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    typeof value.name === "string" &&
    typeof value.slug === "string" &&
    typeof value.flower_type === "string" &&
    typeof value.color === "string" &&
    typeof value.short_description === "string" &&
    isOptionalString(value, "plant_size") &&
    isOptionalNullableNumber(value, "plant_height_cm") &&
    isOptionalString(value, "quality_grade") &&
    isOptionalString(value, "quality_grade_display") &&
    isOptionalNullableBoolean(value, "is_pet_friendly") &&
    (!("pot_included" in value) || typeof value.pot_included === "boolean") &&
    isOptionalString(value, "pot_material") &&
    isOptionalString(value, "pot_color") &&
    isOptionalNullableNumber(value, "pot_size_cm") &&
    isOptionalNullableBoolean(value, "pot_has_drainage") &&
    isOptionalString(value, "light_requirement") &&
    isOptionalString(value, "watering_requirement") &&
    isOptionalString(value, "care_difficulty") &&
    isOptionalString(value, "care_difficulty_display") &&
    isOptionalString(value, "ideal_temperature") &&
    isOptionalString(value, "care_tips") &&
    isOptionalString(value, "delivery_notes") &&
    typeof value.description === "string" &&
    typeof value.stems_per_bundle === "number" &&
    typeof value.price_per_bundle === "number" &&
    typeof value.stock_bundles === "number" &&
    typeof value.minimum_order_bundles === "number" &&
    (typeof value.cover_image === "string" || value.cover_image === null) &&
    typeof value.is_featured === "boolean" &&
    typeof value.is_in_stock === "boolean" &&
    typeof value.category.id === "number" &&
    typeof value.category.name === "string" &&
    typeof value.category.slug === "string" &&
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

export function getCategories(force = false): Promise<CatalogCategory[]> {
  return cachedRequest<CatalogCategory[]>("/api/categories/", force);
}

export function getProducts(
  query: ProductQuery,
  force = false,
): Promise<PaginatedCatalogProducts> {
  return cachedRequest<PaginatedCatalogProducts>(
    productQueryPath(query),
    force,
  );
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
    throw new ApiError(
      "پاسخ جزئیات محصول از سرور معتبر نیست.",
      502,
      {},
      data,
    );
  }

  return data;
}
