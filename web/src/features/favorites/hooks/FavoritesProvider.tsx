"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CatalogProduct } from "@/features/catalog/types";

const FAVORITES_STORAGE_KEY = "florisa_favorites_v1";

interface FavoritesContextValue {
  favorites: CatalogProduct[];
  toggleFavorite: (product: CatalogProduct) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<CatalogProduct[]>([]);

  useEffect(() => {
    try {
      const storedFavorites = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!storedFavorites) {
        return;
      }

      const parsedFavorites: unknown = JSON.parse(storedFavorites);
      if (Array.isArray(parsedFavorites)) {
        setFavorites(parsedFavorites as CatalogProduct[]);
      }
    } catch {
      // Favorites remain usable in memory when browser storage is unavailable.
    }
  }, []);

  const toggleFavorite = useCallback((product: CatalogProduct) => {
    setFavorites((current) => {
      const nextFavorites = current.some((item) => item.id === product.id)
        ? current.filter((item) => item.id !== product.id)
        : [...current, product];

      try {
        window.localStorage.setItem(
          FAVORITES_STORAGE_KEY,
          JSON.stringify(nextFavorites),
        );
      } catch {
        // Keep the in-memory update when browser storage is unavailable.
      }

      return nextFavorites;
    });
  }, []);

  const value = useMemo(
    () => ({ favorites, toggleFavorite }),
    [favorites, toggleFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }

  return context;
}
