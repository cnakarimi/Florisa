"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { getCategories, getProducts } from "@/features/catalog/api/catalog";
import type { CatalogCategory, CatalogProduct, ProductQuery } from "@/features/catalog/types";
import { getApiErrorMessage } from "@/lib/api/client";

const PAGE_SIZE = 8;

interface CatalogState {
  categories: CatalogCategory[];
  products: CatalogProduct[];
  totalProducts: number;
  hasNextPage: boolean;
  isCategoriesLoading: boolean;
  isProductsLoading: boolean;
  isLoadingMore: boolean;
  categoriesError: string | null;
  productsError: string | null;
  retryCategories: () => void;
  retryProducts: () => void;
  loadMore: () => void;
}

export function useCatalog(options: ProductQuery): CatalogState {
  const deferredSearch = useDeferredValue(options.search?.trim() ?? "");
  const requestQuery = useMemo(
    () => ({ ...options, search: deferredSearch || undefined }),
    // All query values are primitives and the serialized form gives the effect a stable key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(options), deferredSearch],
  );
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [categoriesRetry, setCategoriesRetry] = useState(0);
  const [productsRetry, setProductsRetry] = useState(0);

  useEffect(() => {
    let current = true;
    Promise.resolve().then(() => {
      if (current) {
        setIsCategoriesLoading(true);
        setCategoriesError(null);
      }
    });
    getCategories(categoriesRetry > 0)
      .then((result) => current && setCategories(result))
      .catch((error: unknown) => current && setCategoriesError(getApiErrorMessage(error)))
      .finally(() => current && setIsCategoriesLoading(false));
    return () => {
      current = false;
    };
  }, [categoriesRetry]);

  useEffect(() => {
    let current = true;
    Promise.resolve().then(() => {
      if (current) {
        setIsProductsLoading(true);
        setProductsError(null);
        setProducts([]);
        setNextPage(null);
      }
    });
    getProducts({ ...requestQuery, page: 1, page_size: PAGE_SIZE }, productsRetry > 0)
      .then((result) => {
        if (!current) return;
        setProducts(result.results);
        setTotalProducts(result.count);
        setNextPage(result.next ? 2 : null);
      })
      .catch((error: unknown) => current && setProductsError(getApiErrorMessage(error)))
      .finally(() => current && setIsProductsLoading(false));
    return () => {
      current = false;
    };
  }, [requestQuery, productsRetry]);

  const loadMore = useCallback(() => {
    if (nextPage === null || isLoadingMore) return;
    setIsLoadingMore(true);
    setProductsError(null);
    getProducts({ ...requestQuery, page: nextPage, page_size: PAGE_SIZE })
      .then((result) => {
        setProducts((current) => {
          const ids = new Set(current.map((product) => product.id));
          return [...current, ...result.results.filter((product) => !ids.has(product.id))];
        });
        setTotalProducts(result.count);
        setNextPage(result.next ? nextPage + 1 : null);
      })
      .catch((error: unknown) => setProductsError(getApiErrorMessage(error)))
      .finally(() => setIsLoadingMore(false));
  }, [isLoadingMore, nextPage, requestQuery]);

  return {
    categories,
    products,
    totalProducts,
    hasNextPage: nextPage !== null,
    isCategoriesLoading,
    isProductsLoading,
    isLoadingMore,
    categoriesError,
    productsError,
    retryCategories: () => setCategoriesRetry((value) => value + 1),
    retryProducts: () => setProductsRetry((value) => value + 1),
    loadMore,
  };
}
