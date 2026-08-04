"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Banknote, LoaderCircle, MapPin, Plus, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart/hooks/CartProvider";
import { CatalogImage } from "@/features/catalog/components/CatalogImage";
import { getProductImageUrl } from "@/features/catalog/utils/images";
import { formatToman, toPersianDigits } from "@/features/home/utils/persian";
import {
  createAddress,
  listAddresses,
  mapCartToCheckoutItems,
  previewCart,
  submitOrder,
} from "@/features/orders/api/orders";
import type { AddressInput, CartPreview, UserAddress } from "@/features/orders/types";
import { clearCheckoutAttempt, getCheckoutAttemptKey } from "@/features/orders/utils/checkoutAttempt";
import { completeCheckout } from "@/features/orders/utils/request";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";

const EMPTY_ADDRESS: AddressInput = {
  title: "خانه",
  recipient_name: "",
  recipient_phone: "",
  province: "تهران",
  city: "تهران",
  district: "",
  address_line: "",
  plaque: "",
  unit: "",
  postal_code: "",
  delivery_note: "",
  is_default: true,
};

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function CheckoutExperience() {
  const router = useRouter();
  const cart = useCart();
  const checkoutItems = useMemo(() => mapCartToCheckoutItems(cart.items), [cart.items]);
  const attemptKey = useRef("");
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [preview, setPreview] = useState<CartPreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressInput, setAddressInput] = useState<AddressInput>(EMPTY_ADDRESS);
  const [customerNote, setCustomerNote] = useState("");
  const [error, setError] = useState("");
  const [itemErrors, setItemErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    let current = true;
    attemptKey.current = getCheckoutAttemptKey(checkoutItems);
    Promise.all([listAddresses(), previewCart(checkoutItems)])
      .then(([savedAddresses, result]) => {
        if (!current) return;
        setAddresses(savedAddresses);
        setSelectedAddressId(savedAddresses.find((address) => address.is_default)?.id ?? savedAddresses[0]?.id ?? null);
        setShowAddressForm(savedAddresses.length === 0);
        setPreview(result);
      })
      .catch((requestError) => {
        if (current) setError(getApiErrorMessage(requestError));
      })
      .finally(() => {
        if (current) setIsLoading(false);
      });
    return () => { current = false; };
  }, [checkoutItems]);

  const saveAddress = async (event: FormEvent) => {
    event.preventDefault();
    if (isSavingAddress) return;
    setError("");
    setIsSavingAddress(true);
    try {
      const address = await createAddress(addressInput);
      setAddresses((current) => [address, ...current.map((item) => ({ ...item, is_default: address.is_default ? false : item.is_default }))]);
      setSelectedAddressId(address.id);
      setShowAddressForm(false);
      setAddressInput(EMPTY_ADDRESS);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, ["recipient_name", "recipient_phone", "address_line", "postal_code"]));
    } finally {
      setIsSavingAddress(false);
    }
  };

  const submit = async () => {
    if (isSubmitting || !selectedAddressId || !preview) return;
    setError("");
    setItemErrors({});
    setIsSubmitting(true);
    try {
      const order = await completeCheckout(
        () => submitOrder({
          address_id: selectedAddressId,
          items: checkoutItems,
          idempotency_key: attemptKey.current,
          ...(customerNote.trim() ? { customer_note: customerNote.trim() } : {}),
        }),
        cart.clearCart,
      );
      clearCheckoutAttempt();
      router.replace(`/orders/${encodeURIComponent(order.public_number)}/success`);
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        const raw = record(requestError.rawData);
        const errors = raw?.item_errors;
        if (Array.isArray(errors)) {
          const mapped: Record<number, string> = {};
          for (const item of errors) {
            const value = record(item);
            const productId = Number(value?.product_id);
            if (Number.isInteger(productId) && typeof value?.message === "string") mapped[productId] = value.message;
          }
          setItemErrors(mapped);
        }
      }
      setError(getApiErrorMessage(requestError, ["address_id", "items"]));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div dir="rtl" className="flex min-h-screen items-center justify-center bg-[#0d0e12] text-emerald-400"><LoaderCircle className="h-10 w-10 animate-spin" aria-label="در حال بارگذاری" /></div>;
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#0d0e12] pb-36 text-zinc-100">
      <header className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-5">
        <button type="button" onClick={() => router.push("/cart")} className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[#191b23]" aria-label="بازگشت به سبد خرید"><ArrowRight className="h-5 w-5" /></button>
        <div><h1 className="text-lg font-black">تسویه حساب</h1><p className="text-xs text-zinc-500">ثبت سفارش با پرداخت در محل</p></div>
      </header>

      <div className="mx-auto max-w-2xl space-y-5 px-4">
        {error ? <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-xs leading-6 text-rose-300">{error}</p> : null}

        <section className="rounded-3xl border border-white/10 bg-[#171921] p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold"><MapPin className="h-5 w-5 text-emerald-400" />نشانی تحویل</h2>
            <button type="button" onClick={() => setShowAddressForm((value) => !value)} className="flex items-center gap-1 text-xs font-bold text-amber-400"><Plus className="h-4 w-4" />نشانی جدید</button>
          </div>
          <p className="mb-3 rounded-xl bg-amber-400/10 px-3 py-2 text-[11px] leading-5 text-amber-200">ارسال در نسخه فعلی فقط در شهر تهران انجام می‌شود.</p>
          <div className="space-y-2">
            {addresses.map((address) => (
              <label key={address.id} className={`block cursor-pointer rounded-2xl border p-3 ${selectedAddressId === address.id ? "border-amber-400/50 bg-amber-400/5" : "border-white/10 bg-black/10"}`}>
                <div className="flex gap-3"><input type="radio" name="address" checked={selectedAddressId === address.id} onChange={() => setSelectedAddressId(address.id)} className="accent-amber-400" /><div><p className="text-sm font-bold">{address.title || "نشانی"} · {address.recipient_name}</p><p className="mt-1 text-xs leading-6 text-zinc-400">{address.district ? `${address.district}، ` : ""}{address.address_line}{address.plaque ? `، پلاک ${address.plaque}` : ""}</p></div></div>
              </label>
            ))}
          </div>
          {showAddressForm ? <AddressForm value={addressInput} onChange={setAddressInput} onSubmit={saveAddress} isSaving={isSavingAddress} /> : null}
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#171921] p-4">
          <h2 className="mb-4 text-sm font-bold">خلاصه سفارش</h2>
          {preview ? <div className="space-y-3">
            {preview.items.map((item) => <div key={item.product_id} className="flex gap-3 border-b border-white/5 pb-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-black/30"><CatalogImage src={getProductImageUrl(item.cover_image)} alt={item.product_name} sizes="64px" /></div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.product_name}</p><p className="mt-1 text-xs text-zinc-400">{toPersianDigits(item.quantity)} {item.sale_unit_display} × {formatToman(Number(item.unit_price))}</p><p className="mt-1 text-sm font-black text-amber-400">{formatToman(Number(item.line_total))}</p>{itemErrors[item.product_id] ? <p className="mt-1 text-xs text-rose-300">{itemErrors[item.product_id]}</p> : null}</div>
            </div>)}
            <MoneyRow label="جمع کالاها" value={preview.subtotal} /><MoneyRow label="هزینه ارسال" value={preview.delivery_fee} /><MoneyRow label="مبلغ نهایی" value={preview.total} strong />
          </div> : null}
        </section>

        <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-4">
          <div className="flex items-center gap-3"><Banknote className="h-6 w-6 text-emerald-400" /><div><h2 className="text-sm font-bold">پرداخت در محل</h2><p className="mt-1 text-xs text-zinc-400">مبلغ سفارش هنگام تحویل دریافت می‌شود.</p></div></div>
        </section>

        <label className="block text-xs text-zinc-400">یادداشت سفارش (اختیاری)<textarea value={customerNote} onChange={(event) => setCustomerNote(event.target.value)} maxLength={500} rows={3} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#171921] p-3 text-sm text-white outline-none focus:border-amber-400/50" /></label>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#121319]/95 p-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-4"><button type="button" onClick={submit} disabled={isSubmitting || !selectedAddressId || !preview} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3.5 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}ثبت نهایی سفارش</button><div><p className="text-[10px] text-zinc-500">مبلغ نهایی</p><p className="font-black text-amber-400">{preview ? formatToman(Number(preview.total)) : "—"}</p></div></div>
      </div>
    </main>
  );
}

function AddressForm({ value, onChange, onSubmit, isSaving }: { value: AddressInput; onChange: (value: AddressInput) => void; onSubmit: (event: FormEvent) => void; isSaving: boolean }) {
  const field = (name: keyof AddressInput, label: string, required = false) => <label className="text-[11px] text-zinc-400">{label}<input required={required} value={String(value[name] ?? "")} onChange={(event) => onChange({ ...value, [name]: event.target.value })} className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/50" /></label>;
  return <form onSubmit={onSubmit} className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-black/10 p-3">
    {field("title", "عنوان")}{field("recipient_name", "نام تحویل‌گیرنده", true)}{field("recipient_phone", "شماره موبایل", true)}{field("district", "منطقه یا محله")}
    <div className="col-span-2">{field("address_line", "نشانی کامل", true)}</div>{field("plaque", "پلاک")}{field("unit", "واحد")}{field("postal_code", "کد پستی ۱۰ رقمی")}
    <label className="flex items-center gap-2 self-end py-3 text-xs"><input type="checkbox" checked={Boolean(value.is_default)} onChange={(event) => onChange({ ...value, is_default: event.target.checked })} className="accent-amber-400" />نشانی پیش‌فرض</label>
    <button disabled={isSaving} className="col-span-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{isSaving ? "در حال ذخیره..." : "ذخیره و انتخاب نشانی"}</button>
  </form>;
}

function MoneyRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className={`flex items-center justify-between text-sm ${strong ? "border-t border-white/10 pt-3 font-black" : "text-zinc-400"}`}><span>{label}</span><span className={strong ? "text-lg text-amber-400" : "text-zinc-200"}>{formatToman(Number(value))}</span></div>;
}
