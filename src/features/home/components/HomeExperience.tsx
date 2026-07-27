"use client";

import { useState } from 'react';
import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { CategoriesSection } from './CategoriesSection';
import { ProductCard } from './ProductCard';
import { MagazineSection } from './MagazineSection';
import { BottomNav } from './BottomNav';
import { ProductModal } from './ProductModal';
import { ArticleModal } from './ArticleModal';
import { CartDrawer } from './CartDrawer';
import { ShopCatalog } from './ShopCatalog';
import { PlantAICare } from './PlantAICare';
import { FavoritesView } from './FavoritesView';
import { ProfileView } from './ProfileView';
import { PRODUCTS } from '../data/products';
import type { Product, CartItem, Article, TabType } from '../types';
import { Sparkles } from 'lucide-react';

export function HomeExperience() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([PRODUCTS[0]]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1, potColor?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        if (potColor) updated[existingIndex].selectedPotColor = potColor;
        return updated;
      }
      return [...prev, { product, quantity, selectedPotColor: potColor }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Favorite toggle
  const handleToggleFavorite = (product: Product) => {
    setFavorites((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      return [...prev, product];
    });
  };

  // Filter products for homepage
  const homepageProducts = PRODUCTS.filter((p) => {
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (searchQuery) {
      return (
        p.title.includes(searchQuery) ||
        p.description.includes(searchQuery) ||
        (p.titleEnglish && p.titleEnglish.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0d0e12] text-zinc-100 font-['Vazirmatn',sans-serif] pb-24 selection:bg-emerald-600 selection:text-white">
      {/* Top Header */}
      <Header
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        favoritesCount={favorites.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenFavorites={() => setActiveTab('favorites')}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
      />

      {/* Main Screen Container */}
      <main className="max-w-6xl mx-auto px-4">
        {/* Tab 1: HOME (Home Screen matching screenshot) */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Hero Banner Section */}
            <HeroSection
              onShopClick={() => setActiveTab('shop')}
              onCareClick={() => setActiveTab('care_ai')}
            />

            {/* Categories Section ("دسته بندی") */}
            <CategoriesSection
              selectedCategory={selectedCategory}
              onSelectCategory={(catId) => setSelectedCategory(catId)}
            />

            {/* Latest Products Section ("جدیدترین محصولات") matching screenshot */}
            <section className="my-8">
              <div className="flex items-center justify-between mb-5 px-1">
                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <span>جدیدترین محصولات</span>
                </h3>
                <button
                  onClick={() => setActiveTab('shop')}
                  className="text-xs text-amber-400 hover:underline"
                >
                  مشاهده همه
                </button>
              </div>

              {/* Product Cards Grid matching screenshot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {homepageProducts.map((product) => {
                  const isFav = favorites.some((f) => f.id === product.id);
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isFavorite={isFav}
                      onToggleFavorite={handleToggleFavorite}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                      onSelectProduct={(p) => setSelectedProduct(p)}
                    />
                  );
                })}
              </div>
            </section>

            {/* Plant Magazine Section ("مجله گیاهان") matching screenshot */}
            <MagazineSection onSelectArticle={(article) => setSelectedArticle(article)} />
          </div>
        )}

        {/* Tab 2: SHOP CATALOG */}
        {activeTab === 'shop' && (
          <ShopCatalog
            products={PRODUCTS}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onSelectProduct={(p) => setSelectedProduct(p)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {/* Tab 3: AI PLANT DOCTOR */}
        {activeTab === 'care_ai' && <PlantAICare />}

        {/* Tab 4: FAVORITES */}
        {activeTab === 'favorites' && (
          <FavoritesView
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onSelectProduct={(p) => setSelectedProduct(p)}
          />
        )}

        {/* Tab 5: PROFILE */}
        {activeTab === 'profile' && <ProfileView />}
      </main>

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        isFavorite={favorites.some((f) => f?.id === selectedProduct?.id)}
        onToggleFavorite={handleToggleFavorite}
        onAddToCart={handleAddToCart}
      />

      {/* Article Reader Modal */}
      <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />

      {/* Cart Slide-over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCart([])}
      />

      {/* Bottom Sticky Navigation Bar matching screenshot icons */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favoritesCount={favorites.length}
      />
    </div>
  );
}
