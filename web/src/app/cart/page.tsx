import type { Metadata } from "next";
import { CartPageExperience } from "@/features/cart/components/CartPageExperience";

export const metadata: Metadata = {
  title: "سبد خرید | فلوریسا",
  description: "مشاهده و مدیریت سبد خرید فلوریسا",
};

interface CartPageProps {
  searchParams: Promise<{
    checkout_error?: string | string[];
  }>;
}

export default async function CartPage({ searchParams }: CartPageProps) {
  const { checkout_error: checkoutError } = await searchParams;
  const initialMessage =
    checkoutError === "empty"
      ? "برای ادامه، ابتدا محصولی به سبد خرید اضافه کنید."
      : checkoutError === "invalid"
        ? "برخی کالاهای سبد خرید ناموجود یا دارای تعداد نامعتبر هستند."
        : "";

  return <CartPageExperience initialMessage={initialMessage} />;
}
