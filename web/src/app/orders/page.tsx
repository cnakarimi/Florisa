import type { Metadata } from "next";
import { OrdersExperience } from "@/features/orders/components/OrdersExperience";

export const metadata: Metadata = { title: "سفارش‌های من | فلوریسا" };

export default function OrdersPage() { return <OrdersExperience />; }
