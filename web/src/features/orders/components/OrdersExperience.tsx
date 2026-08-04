"use client";

import { useEffect, useState } from "react";
import { ArrowRight, LoaderCircle, PackageOpen, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { BottomNav } from "@/features/home/components/BottomNav";
import { formatToman, toPersianDigits } from "@/features/home/utils/persian";
import { listOrders } from "@/features/orders/api/orders";
import type { Order } from "@/features/orders/types";
import { getApiErrorMessage } from "@/lib/api/client";

function date(value: string): string {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function OrdersExperience() {
  const router = useRouter();
  const auth = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const visibleError = error || auth.initializationError;

  useEffect(() => {
    if (auth.isInitializing || auth.initializationError) return;
    if (!auth.isAuthenticated) {
      router.replace("/auth?next=%2Forders");
      return;
    }
    if (!auth.isProfileComplete) {
      router.replace("/auth/register?next=%2Forders");
      return;
    }
    listOrders().then(setOrders).catch((reason) => setError(getApiErrorMessage(reason))).finally(() => setLoading(false));
  }, [auth.isAuthenticated, auth.isInitializing, auth.isProfileComplete, auth.initializationError, router]);

  return <main dir="rtl" className="min-h-screen bg-[#0d0e12] pb-24 text-zinc-100">
    <header className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-5"><button type="button" onClick={() => router.push("/profile")} className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[#191b23]" aria-label="بازگشت"><ArrowRight className="h-5 w-5" /></button><div><h1 className="text-lg font-black">سفارش‌های من</h1><p className="text-xs text-zinc-500">تاریخچه و وضعیت سفارش‌ها</p></div></header>
    <div className="mx-auto max-w-2xl space-y-3 px-4">
      {(loading || auth.isInitializing) && !visibleError ? <div className="py-24 text-center text-emerald-400"><LoaderCircle className="mx-auto h-9 w-9 animate-spin" /><p className="mt-3 text-xs text-zinc-400">در حال دریافت سفارش‌ها...</p></div> : null}
      {visibleError ? <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-xs text-rose-300">{visibleError}</p> : null}
      {!loading && !visibleError && orders.length === 0 ? <div className="rounded-3xl border border-white/10 bg-[#171921] px-6 py-20 text-center"><PackageOpen className="mx-auto h-14 w-14 text-zinc-600" /><h2 className="mt-4 font-bold">هنوز سفارشی ندارید</h2><button onClick={() => router.push("/shop")} className="mt-5 rounded-xl bg-amber-400 px-5 py-3 text-xs font-black text-black">مشاهده فروشگاه</button></div> : null}
      {orders.map((order) => <button type="button" key={order.public_number} onClick={() => router.push(`/orders/${order.public_number}`)} className="block w-full rounded-2xl border border-white/10 bg-[#171921] p-4 text-right transition hover:border-amber-400/30">
        <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-amber-400" /><div><p className="text-xs text-zinc-500">شماره سفارش</p><bdi dir="ltr" className="mt-1 block font-mono text-xs text-white">{order.public_number}</bdi></div></div><span className="rounded-lg bg-emerald-400/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300">{order.status_display}</span></div>
        <div className="mt-4 flex items-end justify-between border-t border-white/5 pt-3"><div><p className="text-[11px] text-zinc-500">{date(order.created_at)}</p><p className="mt-1 text-xs text-zinc-400">{toPersianDigits(order.items.length)} قلم</p></div><p className="font-black text-amber-400">{formatToman(Number(order.total))}</p></div>
      </button>)}
    </div>
    <BottomNav />
  </main>;
}
