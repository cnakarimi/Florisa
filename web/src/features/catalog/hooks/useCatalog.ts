"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useState,
} from "react";
import {
  getCategories,
  getProducts,
} from "@/features/catalog/api/catalog";
import type {
  CatalogCategory,
  CatalogProduct,
  ProductOrdering,
} from "@/features/catalog/types";
import { getApiErrorMessage } from "@/lib/api/client";

const PAGE_SIZE = 8;

interface UseCatalogOptions {
  category: string | null;
  search: string;
  ordering: ProductOrdering;
}

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

export function useCatalog({
  category,
  search,
  ordering,
}: UseCatalogOptions): CatalogState {
  const deferredSearch = useDeferredValue(search.trim());
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
    let isCurrent = true;

    Promise.resolve().then(() => {
      if (!isCurrent) {
        return;
      }
      setIsCategoriesLoading(true);
      setCategoriesError(null);
    });

    getCategories(categoriesRetry > 0)
      .then((result) => {
        if (isCurrent) {
          setCategories(result);
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setCategoriesError(getApiErrorMessage(error));
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsCategoriesLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [categoriesRetry]);

  useEffect(() => {
    let isCurrent = true;

    Promise.resolve().then(() => {
      if (!isCurrent) {
        return;
      }
      setIsProductsLoading(true);
      setProductsError(null);
      setProducts([]);
      setNextPage(null);
    });

    getProducts(
      {
        category,
        search: deferredSearch,
        ordering,
        page: 1,
        page_size: PAGE_SIZE,
      },
      productsRetry > 0,
    )
      .then((result) => {
        if (!isCurrent) {
          return;
        }
        setProducts(result.results);
        setTotalProducts(result.count);
        setNextPage(result.next ? 2 : null);
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setProductsError(getApiErrorMessage(error));
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsProductsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [category, deferredSearch, ordering, productsRetry]);

  const loadMore = useCallback(() => {
    if (nextPage === null || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setProductsError(null);

    getProducts({
      category,
      search: deferredSearch,
      ordering,
      page: nextPage,
      page_size: PAGE_SIZE,
    })
      .then((result) => {
        setProducts((current) => {
          const existingIds = new Set(current.map((product) => product.id));
          return [
            ...current,
            ...result.results.filter(
              (product) => !existingIds.has(product.id),
            ),
          ];
        });
        setTotalProducts(result.count);
        setNextPage(result.next ? nextPage + 1 : null);
      })
      .catch((error: unknown) => {
        setProductsError(getApiErrorMessage(error));
      })
      .finally(() => {
        setIsLoadingMore(false);
      });
  }, [
    category,
    deferredSearch,
    isLoadingMore,
    nextPage,
    ordering,
  ]);

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
