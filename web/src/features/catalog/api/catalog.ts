import type {
  CatalogCategory,
  CatalogProductDetail,
  PaginatedCatalogProducts,
  ProductQuery,
} from "@/features/catalog/types";
import { apiRequest } from "@/lib/api/client";

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

export function getProductDetail(
  slug: string,
  force = false,
): Promise<CatalogProductDetail> {
  return cachedRequest<CatalogProductDetail>(
    `/api/products/${encodeURIComponent(slug)}/`,
    force,
  );
}
