"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { CatalogFeedback } from "@/features/catalog/components/CatalogFeedback";
import { useCatalog } from "@/features/catalog/hooks/useCatalog";
import type {
  CatalogProduct,
  ProductOrdering,
} from "@/features/catalog/types";
import { Header } from "./Header";
import { HeroSection } from "./HeroSection";
import { CategoriesSection } from "./CategoriesSection";
import { ProductCard } from "./ProductCard";
import { MagazineSection } from "./MagazineSection";
import { BottomNav } from "./BottomNav";
import { ArticleModal } from "./ArticleModal";
import { CartDrawer } from "./CartDrawer";
import { ShopCatalog } from "./ShopCatalog";
import { PlantAICare } from "./PlantAICare";
import { FavoritesView } from "./FavoritesView";
import type { Article, CartItem, TabType } from "../types";

export function HomeExperience() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<CatalogProduct[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [ordering, setOrdering] = useState<ProductOrdering>("newest");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const {
    categories,
    products,
    hasNextPage,
    isCategoriesLoading,
    isProductsLoading,
    isLoadingMore,
    categoriesError,
    productsError,
    retryCategories,
    retryProducts,
    loadMore,
  } = useCatalog({
    category: selectedCategory,
    search: searchQuery,
    ordering,
  });

  const handleAddToCart = (
    product: CatalogProduct,
    quantity = 1,
    selectedPotColor?: string,
  ) => {
    if (!product.is_in_stock) {
      return;
    }

    setCart((current) => {
      const existingIndex = current.findIndex(
        (item) => item.product.id === product.id,
      );
      if (existingIndex > -1) {
        const updated = [...current];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          selectedPotColor:
            selectedPotColor ?? updated[existingIndex].selectedPotColor,
        };
        return updated;
      }
      return [
        ...current,
        { product, quantity, selectedPotColor },
      ];
    });
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    setCart((current) =>
      current.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const handleRemoveItem = (productId: number) => {
    setCart((current) =>
      current.filter((item) => item.product.id !== productId),
    );
  };

  const handleToggleFavorite = (product: CatalogProduct) => {
    setFavorites((current) => {
      const exists = current.some((item) => item.id === product.id);
      return exists
        ? current.filter((item) => item.id !== product.id)
        : [...current, product];
    });
  };

  const openProduct = (product: CatalogProduct) => {
    router.push(`/products/${encodeURIComponent(product.slug)}`);
  };

  const productGrid = isProductsLoading ? (
    <CatalogFeedback kind="loading" />
  ) : productsError && products.length === 0 ? (
    <CatalogFeedback
      kind="error"
      message={productsError}
      onRetry={retryProducts}
    />
  ) : products.length === 0 ? (
    <CatalogFeedback
      kind="empty"
      message={
        searchQuery || selectedCategory
          ? "محصولی مطابق جستجو یا دسته‌بندی انتخاب‌شده پیدا نشد."
          : undefined
      }
    />
  ) : (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isFavorite={favorites.some(
              (favorite) => favorite.id === product.id,
            )}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={(item) => handleAddToCart(item, 1)}
            onSelectProduct={openProduct}
          />
        ))}
      </div>

      {productsError ? (
        <div className="mt-4">
          <CatalogFeedback
            kind="error"
            message={productsError}
            onRetry={retryProducts}
            compact
          />
        </div>
      ) : null}

      {hasNextPage ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="rounded-xl border border-white/10 bg-[#222430] px-6 py-2.5 text-xs font-semibold text-white hover:border-emerald-500/50 disabled:cursor-wait disabled:opacity-60"
          >
            {isLoadingMore ? "در حال دریافت..." : "نمایش محصولات بیشتر"}
          </button>
        </div>
      ) : null}
    </>
  );

  return (
    <div className="min-h-screen bg-[#0d0e12] pb-24 font-['Vazirmatn',sans-serif] text-zinc-100 selection:bg-emerald-600 selection:text-white">
      <Header
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        favoritesCount={favorites.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenFavorites={() => setActiveTab("favorites")}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
      />

      <main className="mx-auto max-w-6xl px-4">
        {activeTab === "home" ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <HeroSection
              onShopClick={() => setActiveTab("shop")}
              onCareClick={() => setActiveTab("care_ai")}
            />

            <CategoriesSection
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              isLoading={isCategoriesLoading}
              error={categoriesError}
              onRetry={retryCategories}
            />

            <section className="my-8">
              <div className="mb-5 flex items-center justify-between px-1">
                <h3 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
                  <span className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-1 text-amber-400">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <span>جدیدترین محصولات</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("shop")}
                  className="text-xs text-amber-400 hover:underline"
                >
                  مشاهده همه
                </button>
              </div>
              {productGrid}
            </section>

            <MagazineSection
              onSelectArticle={(article) => setSelectedArticle(article)}
            />
          </div>
        ) : null}

        {activeTab === "shop" ? (
          <ShopCatalog
            products={products}
            categories={categories}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={(product) => handleAddToCart(product, 1)}
            onSelectProduct={openProduct}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            ordering={ordering}
            onOrderingChange={setOrdering}
            isLoading={isProductsLoading}
            error={productsError}
            onRetry={retryProducts}
            hasNextPage={hasNextPage}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMore}
          />
        ) : null}

        {activeTab === "care_ai" ? <PlantAICare /> : null}

        {activeTab === "favorites" ? (
          <FavoritesView
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={(product) => handleAddToCart(product, 1)}
            onSelectProduct={openProduct}
          />
        ) : null}
      </main>

      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCart([])}
      />

      <BottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === "profile") {
            router.push("/profile");
            return;
          }
          setActiveTab(tab);
        }}
        favoritesCount={favorites.length}
      />
    </div>
  );
}
