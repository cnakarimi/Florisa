import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import type { ReactNode } from "react";
import { AuthProvider } from "@/features/auth/hooks/AuthProvider";
import { CartProvider } from "@/features/cart/hooks/CartProvider";
import { FavoritesProvider } from "@/features/favorites/hooks/FavoritesProvider";
import { Footer } from "@/features/home/components/Footer";
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
            <AuthProvider>
              <div className="flex min-h-dvh min-w-0 flex-col">
                <div className="min-w-0 flex-1">{children}</div>
                <Footer />
              </div>
            </AuthProvider>
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  );
}
