import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import type { ReactNode } from "react";
import { AuthProvider } from "@/features/auth/hooks/AuthProvider";
import { CartProvider } from "@/features/cart/hooks/CartProvider";
import { FavoritesProvider } from "@/features/favorites/hooks/FavoritesProvider";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-vazirmatn",
  fallback: ["Tahoma", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "فلوریسا | گل و گیاه برای لحظه‌های شما",
  description: "خرید آنلاین گل، گیاهان خانگی و هدیه‌های سبز از فلوریسا",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#131313",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fa" dir="rtl">
      <body className={vazirmatn.variable}>
        <CartProvider>
          <FavoritesProvider>
            <AuthProvider>{children}</AuthProvider>
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  );
}
