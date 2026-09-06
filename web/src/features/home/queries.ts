import type { ProductQuery } from "@/features/catalog/types";

export const HOME_PRODUCTS_LIMIT = 8;

export const HOME_FEATURED_PRODUCTS_QUERY = {
  is_featured: true,
  ordering: "featured",
  page_size: HOME_PRODUCTS_LIMIT,
} satisfies ProductQuery;

export const HOME_NEWEST_PRODUCTS_QUERY = {
  ordering: "newest",
  page_size: HOME_PRODUCTS_LIMIT,
} satisfies ProductQuery;
