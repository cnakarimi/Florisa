"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { CatalogImage } from "@/features/catalog/components/CatalogImage";
import { getProductImageUrl } from "@/features/catalog/utils/images";
import { formatToman, toPersianDigits } from "@/features/home/utils/persian";
import { getOrder } from "@/features/orders/api/orders";
import type { Order } from "@/features/orders/types";
import { getApiErrorMessage } from "@/lib/api/client";

export function OrderDetailExperience({ publicNumber, success = false }: { publicNumber: string; success?: boolean }) {
  const router = useRouter();
  const auth = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (auth.isInitializing || auth.initializationError) return;
    if (!auth.isAuthenticated) {
      router.replace(`/auth?next=${encodeURIComponent(`/orders/${publicNumber}${success ? "/success" : ""}`)}`);
      return;
    }
    if (!auth.isProfileComplete) {
      router.replace(`/auth/register?next=${encodeURIComponent(`/orders/${publicNumber}${success ? "/success" : ""}`)}`);
      return;
    }
    getOrder(publicNumber).then(setOrder).catch((reason) => setError(getApiErrorMessage(reason)));
  }, [auth.isAuthenticated, auth.isInitializing, auth.isProfileComplete, auth.initializationError, publicNumber, router, success]);

  const visibleError = error || auth.initializationError;
  if (!order && !visibleError) return <div dir="rtl" className="flex min-h-screen items-center justify-center bg-[#0d0e12] text-emerald-400"><LoaderCircle className="h-10 w-10 animate-spin" /></div>;

  return <main dir="rtl" className="min-h-screen bg-[#0d0e12] pb-12 text-zinc-100"><div className="mx-auto max-w-2xl px-4 py-5">
    <button type="button" onClick={() => router.push(success ? "/shop" : "/orders")} className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[#191b23]" aria-label="بازگشت"><ArrowRight className="h-5 w-5" /></button>
    {visibleError ? <p role="alert" className="mt-8 rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-300">{visibleError}</p> : null}
    {order ? <div className="space-y-5">
      {success ? <section className="mt-7 rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-6 text-center"><CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" /><h1 className="mt-4 text-xl font-black">سفارش شما با موفقیت ثبت شد</h1><p className="mt-2 text-sm text-zinc-400">به‌زودی برای هماهنگی ارسال با شما تماس می‌گیریم.</p></section> : <h1 className="mt-7 text-xl font-black">جزئیات سفارش</h1>}
      <section className="rounded-3xl border border-white/10 bg-[#171921] p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-zinc-500">شماره سفارش</p><bdi dir="ltr" className="mt-1 block break-all font-mono text-sm">{order.public_number}</bdi></div><span className="rounded-lg bg-emerald-400/10 px-2.5 py-1 text-xs font-bold text-emerald-300">{order.status_display}</span></div><p className="mt-3 text-xs text-zinc-500">{new Intl.DateTimeFormat("fa-IR", { dateStyle: "full", timeStyle: "short" }).format(new Date(order.created_at))}</p></section>
      <section className="rounded-3xl border border-white/10 bg-[#171921] p-4"><h2 className="mb-3 flex items-center gap-2 text-sm font-bold"><MapPin className="h-5 w-5 text-emerald-400" />نشانی تحویل</h2><p className="text-sm font-bold">{order.recipient_name} · {order.recipient_phone}</p><p className="mt-2 text-xs leading-6 text-zinc-400">{order.province}، {order.city}{order.district ? `، ${order.district}` : ""}، {order.address_line}{order.plaque ? `، پلاک ${order.plaque}` : ""}{order.unit ? `، واحد ${order.unit}` : ""}</p></section>
      <section className="rounded-3xl border border-white/10 bg-[#171921] p-4"><h2 className="mb-4 text-sm font-bold">اقلام سفارش</h2><div className="space-y-3">{order.items.map((item) => <div key={item.id} className="flex gap-3 border-b border-white/5 pb-3 last:border-0"><div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-black/30"><CatalogImage src={getProductImageUrl(item.cover_image)} alt={item.product_name} sizes="64px" /></div><div className="flex-1"><p className="text-sm font-bold">{item.product_name}</p><p className="mt-1 text-xs text-zinc-400">{toPersianDigits(item.quantity)} {item.sale_unit_display} × {formatToman(Number(item.unit_price))}</p><p className="mt-1 text-sm font-black text-amber-400">{formatToman(Number(item.line_total))}</p></div></div>)}</div><div className="mt-3 space-y-2 border-t border-white/10 pt-3"><Row label="جمع کالاها" value={order.subtotal} /><Row label="هزینه ارسال" value={order.delivery_fee} /><Row label="مبلغ نهایی" value={order.total} strong /><div className="flex justify-between text-xs text-zinc-400"><span>روش پرداخت</span><span>{order.payment_method_display}</span></div></div></section>
      <div className="grid grid-cols-2 gap-3"><button onClick={() => router.push(`/orders/${order.public_number}`)} className="rounded-xl border border-white/10 px-4 py-3 text-xs font-bold">مشاهده جزئیات</button><button onClick={() => router.push("/shop")} className="rounded-xl bg-amber-400 px-4 py-3 text-xs font-black text-black">ادامه خرید</button></div>
    </div> : null}
  </div></main>;
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className={`flex justify-between text-sm ${strong ? "font-black" : "text-zinc-400"}`}><span>{label}</span><span className={strong ? "text-lg text-amber-400" : "text-zinc-200"}>{formatToman(Number(value))}</span></div>;
}
