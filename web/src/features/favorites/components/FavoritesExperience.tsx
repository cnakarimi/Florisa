"use client";

import { useRouter } from "next/navigation";

import { BottomNav } from "@/components/navigation/BottomNav";
import { useCart } from "@/features/cart/hooks/CartProvider";
import type { CatalogProduct } from "@/features/catalog/types";
import { FavoritesView } from "@/features/favorites/components/FavoritesView";
import { useFavorites } from "@/features/favorites/hooks/FavoritesProvider";

export function FavoritesExperience() {
  const router = useRouter();
  const cart = useCart();
  const { favorites, toggleFavorite } = useFavorites();

  const openProduct = (product: CatalogProduct) => {
    router.push(`/products/${encodeURIComponent(product.slug)}`);
  };

  return (
    <div className="min-h-dvh bg-background-primary text-text-primary selection:bg-action-primary/30 selection:text-text-inverse">
      <div className="relative mx-auto min-h-dvh w-full max-w-screen-lg overflow-x-hidden bg-background-secondary shadow-large md:pb-24">
        <main className="px-4 sm:px-6 md:px-8">
          <FavoritesView
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onAddToCart={cart.addItem}
            onSelectProduct={openProduct}
          />
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
