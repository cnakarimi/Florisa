import type { Metadata } from "next";
import { CheckoutGate } from "@/features/cart/components/CheckoutGate";

export const metadata: Metadata = {
  title: "تسویه حساب | فلوریسا",
  description: "ورود امن به مرحله تسویه حساب فلوریسا",
};

export default function CheckoutPage() {
  return <CheckoutGate />;
}
