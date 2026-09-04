"use client";

import { useRouter } from "next/navigation";

import { useCart } from "@/features/cart/hooks/CartProvider";
import type { CatalogProduct } from "@/features/catalog/types";
import { BottomNav } from "@/components/layout/BottomNav";
import { FavoritesView } from "@/features/favorites/components/FavoritesView";

import { useFavorites } from "../hooks/FavoritesProvider";

export function FavoritesExperience() {
  const router = useRouter();

  const cart = useCart();
  const { favorites, toggleFavorite } = useFavorites();

  const openProduct = (product: CatalogProduct) => {
    router.push(`/products/${encodeURIComponent(product.slug)}`);
  };

  return (
    <div className="min-h-dvh bg-black text-zinc-100 selection:bg-[#c7a23c]/30 selection:text-white">
      <div className="relative mx-auto min-h-dvh w-full max-w-screen-lg overflow-x-hidden bg-[#111211] shadow-2xl shadow-black md:pb-24">
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
