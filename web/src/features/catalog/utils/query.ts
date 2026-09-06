import type { ProductQuery } from "@/features/catalog/types";

export function getCatalogFilters(query: ProductQuery): ProductQuery {
  const filters = { ...query };

  delete filters.category;
  delete filters.search;
  delete filters.ordering;
  delete filters.page;
  delete filters.page_size;

  return filters;
}

export function serializeShopQuery(query: ProductQuery): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    if (key === "ordering" && value === "newest") {
      continue;
    }

    if (key === "page" || key === "page_size") {
      continue;
    }

    params.set(key, String(value));
  }

  return params.toString();
}
