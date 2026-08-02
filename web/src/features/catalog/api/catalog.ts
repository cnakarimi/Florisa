import type {
  CatalogCategory,
  CatalogProductDetail,
  PaginatedCatalogProducts,
  ProductQuery,
} from "@/features/catalog/types";
import { ApiError, apiRequest } from "@/lib/api/client";

import {
  isCategory,
  isPaginatedProducts,
  isProductDetail,
} from "./runtime";

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
