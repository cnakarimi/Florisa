"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Home, LoaderCircle, MapPin, Pencil, Plus, RefreshCw, Star, Trash2, X } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { AddressForm } from "@/features/orders/components/AddressForm";
import { createAddress, deleteAddress, listAddresses, updateAddress } from "@/features/orders/api/orders";
import type { AddressInput, UserAddress } from "@/features/orders/types";
import { emptyAddressInput } from "@/features/orders/utils/address";
import { addressToInput, removeAddressAfterSuccess, upsertAddress } from "@/features/orders/utils/addressState";
import { ApiError, type ApiFieldErrors, getApiErrorMessage } from "@/lib/api/client";
import { AccountPageShell } from "./AccountPageShell";
import { AccountRouteGuard } from "./AccountRouteGuard";

export function AddressesExperience() {
  return <AccountRouteGuard nextPath="/profile/addresses"><AddressesContent /></AccountRouteGuard>;
}

function AddressesContent() {
  const auth = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [input, setInput] = useState<AddressInput>(() => emptyAddressInput());
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors>({});
  const [formError, setFormError] = useState("");
  const [pendingAction, setPendingAction] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<UserAddress | null>(null);
  const [notice, setNotice] = useState("");

  const refreshAuthIfUnauthorized = (reason: unknown) => {
    if (reason instanceof ApiError && (reason.status === 401 || reason.status === 403)) {
      auth.refreshCurrentUser().catch(() => undefined);
    }
  };

  const load = useCallback(() => {
    setLoading(true);
    setLoadError("");
    let active = true;
    listAddresses().then((items) => { if (active) setAddresses(items); }).catch((reason) => {
      if (!active) return;
      setLoadError(getApiErrorMessage(reason));
      if (reason instanceof ApiError && (reason.status === 401 || reason.status === 403)) auth.refreshCurrentUser().catch(() => undefined);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [auth]);

  useEffect(() => load(), [load]);

  const openCreate = () => {
    setFormMode("create"); setEditingId(null); setFieldErrors({}); setFormError(""); setNotice("");
    setInput(emptyAddressInput({ recipient_name: auth.user?.full_name ?? "", recipient_phone: auth.user?.phone ?? "", is_default: addresses.length === 0 }));
  };
  const openEdit = (address: UserAddress) => {
    setFormMode("edit"); setEditingId(address.id); setFieldErrors({}); setFormError(""); setNotice(""); setInput(addressToInput(address));
  };
  const closeForm = () => { if (!pendingAction) { setFormMode(null); setEditingId(null); setFieldErrors({}); setFormError(""); } };

  const save = async (payload: AddressInput) => {
    if (pendingAction) return;
    setPendingAction("save"); setFieldErrors({}); setFormError(""); setNotice("");
    try {
      const saved = formMode === "edit" && editingId ? await updateAddress(editingId, payload) : await createAddress(payload);
      setAddresses((current) => upsertAddress(current, saved));
      setNotice(formMode === "edit" ? "آدرس با موفقیت ویرایش شد." : "آدرس جدید با موفقیت اضافه شد.");
      setFormMode(null); setEditingId(null);
    } catch (reason) {
      refreshAuthIfUnauthorized(reason);
      if (reason instanceof ApiError) {
        setFieldErrors(reason.fieldErrors);
        setFormError(reason.fieldErrors.non_field_errors?.[0] ?? reason.fieldErrors.detail?.[0] ?? (Object.keys(reason.fieldErrors).length ? "" : getApiErrorMessage(reason)));
      } else setFormError(getApiErrorMessage(reason));
    } finally { setPendingAction(""); }
  };

  const makeDefault = async (address: UserAddress) => {
    if (pendingAction || address.is_default) return;
    setPendingAction(`default-${address.id}`); setNotice("");
    try {
      const saved = await updateAddress(address.id, { is_default: true });
      setAddresses((current) => upsertAddress(current, saved));
      setNotice("آدرس پیش‌فرض تغییر کرد.");
    } catch (reason) { refreshAuthIfUnauthorized(reason); setNotice(`خطا: ${getApiErrorMessage(reason)}`); }
    finally { setPendingAction(""); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || pendingAction) return;
    const target = deleteTarget;
    setPendingAction(`delete-${target.id}`); setNotice("");
    try {
      const next = await removeAddressAfterSuccess(addresses, target.id, () => deleteAddress(target.id));
      setAddresses(target.is_default && next.length ? next.map((item, index) => ({ ...item, is_default: index === 0 })) : next);
      setDeleteTarget(null);
      setNotice("آدرس با موفقیت حذف شد.");
    } catch (reason) { refreshAuthIfUnauthorized(reason); setNotice(`خطا: ${getApiErrorMessage(reason)}`); }
    finally { setPendingAction(""); }
  };

  return (
    <AccountPageShell title="آدرس‌های من" description="آدرس‌های تحویل مشترک با تسویه‌حساب را مدیریت کنید.">
      <div className="space-y-5">
        <div className="flex flex-col gap-3 rounded-3xl border border-amber-400/20 bg-amber-400/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-xs leading-6 text-amber-100"><MapPin className="mt-0.5 size-5 shrink-0 text-amber-400" aria-hidden="true" />ارسال در نسخه فعلی فقط در شهر تهران انجام می‌شود.</p>
          <button type="button" onClick={openCreate} disabled={Boolean(pendingAction)} className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 text-xs font-black text-black outline-none hover:bg-amber-300 focus-visible:ring-2 focus-visible:ring-amber-200 disabled:opacity-50"><Plus className="size-4" aria-hidden="true" />افزودن آدرس</button>
        </div>

        {notice ? <p role="status" className={`rounded-2xl border px-4 py-3 text-xs leading-6 ${notice.startsWith("خطا:") ? "border-rose-400/20 bg-rose-500/10 text-rose-300" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"}`}>{notice}</p> : null}

        {formMode ? <section aria-labelledby="address-form-title" className="rounded-3xl border border-white/10 bg-[#15171e] p-4 shadow-xl sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 id="address-form-title" className="font-black">{formMode === "edit" ? "ویرایش آدرس" : "افزودن آدرس جدید"}</h2><p className="mt-1 text-[11px] text-zinc-500">فیلدهای ستاره‌دار الزامی هستند.</p></div><button type="button" onClick={closeForm} disabled={Boolean(pendingAction)} aria-label="بستن فرم آدرس" className="grid size-10 place-items-center rounded-xl text-zinc-400 outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-amber-400"><X className="size-5" aria-hidden="true" /></button></div><AddressForm mode={formMode} value={input} onChange={setInput} onSubmit={save} isSaving={pendingAction === "save"} serverFieldErrors={fieldErrors} formError={formError} onFieldChange={(field) => setFieldErrors((current) => { const next = { ...current }; delete next[field]; return next; })} onCancel={closeForm} /></section> : null}

        {loading ? <div aria-live="polite" className="py-20 text-center"><LoaderCircle className="mx-auto size-9 animate-spin text-emerald-400" aria-hidden="true" /><p className="mt-3 text-xs text-zinc-400">در حال دریافت آدرس‌ها...</p></div> : null}
        {!loading && loadError ? <div className="rounded-3xl border border-rose-400/20 bg-[#15171e] p-8 text-center"><p role="alert" className="text-sm leading-7 text-rose-300">{loadError}</p><button type="button" onClick={load} className="mx-auto mt-5 flex min-h-11 items-center gap-2 rounded-xl bg-amber-400 px-5 text-xs font-black text-black"><RefreshCw className="size-4" aria-hidden="true" />تلاش دوباره</button></div> : null}
        {!loading && !loadError && addresses.length === 0 ? <div className="rounded-3xl border border-dashed border-white/15 bg-[#15171e] px-6 py-16 text-center"><Home className="mx-auto size-14 text-zinc-600" aria-hidden="true" /><h2 className="mt-4 font-black">هنوز آدرسی ذخیره نکرده‌اید</h2><p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-zinc-500">اولین آدرس شما به‌صورت خودکار آدرس پیش‌فرض خواهد بود.</p><button type="button" onClick={openCreate} className="mt-5 min-h-11 rounded-xl bg-amber-400 px-5 text-xs font-black text-black">افزودن اولین آدرس</button></div> : null}
        {!loading && !loadError && addresses.length ? <div className="grid gap-4 xl:grid-cols-2">{addresses.map((address) => <AddressCard key={address.id} address={address} pending={Boolean(pendingAction)} onEdit={() => openEdit(address)} onDelete={() => setDeleteTarget(address)} onDefault={() => makeDefault(address)} />)}</div> : null}
      </div>
      {deleteTarget ? <DeleteAddressDialog address={deleteTarget} pending={pendingAction === `delete-${deleteTarget.id}`} onCancel={() => { if (!pendingAction) setDeleteTarget(null); }} onConfirm={confirmDelete} /> : null}
    </AccountPageShell>
  );
}

function AddressCard({ address, pending, onEdit, onDelete, onDefault }: { address: UserAddress; pending: boolean; onEdit: () => void; onDelete: () => void; onDefault: () => void }) {
  return <article className={`min-w-0 rounded-3xl border bg-[#15171e] p-4 shadow-xl shadow-black/10 sm:p-5 ${address.is_default ? "border-amber-400/35" : "border-white/10"}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="break-words font-black">{address.title || "آدرس"}</h2>{address.is_default ? <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-[10px] font-bold text-amber-300">پیش‌فرض</span> : null}</div><p className="mt-2 text-xs font-bold text-zinc-300">{address.recipient_name}</p><bdi dir="ltr" className="numeric-ltr mt-1 block text-xs text-zinc-500">{address.recipient_phone}</bdi></div><MapPin className="size-6 shrink-0 text-emerald-400" aria-hidden="true" /></div><p className="mt-4 break-words text-xs leading-7 text-zinc-400">تهران، تهران{address.district ? `، ${address.district}` : ""}، {address.address_line}{address.plaque ? `، پلاک ${address.plaque}` : ""}{address.unit ? `، واحد ${address.unit}` : ""}</p>{address.postal_code ? <p className="mt-2 text-[11px] text-zinc-500">کد پستی: <bdi dir="ltr" className="numeric-ltr">{address.postal_code}</bdi></p> : null}{address.delivery_note ? <p className="mt-3 break-words rounded-xl bg-black/15 p-3 text-[11px] leading-6 text-zinc-500">توضیحات تحویل: {address.delivery_note}</p> : null}<div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/5 pt-4"><Action label="ویرایش" icon={<Pencil className="size-4" />} onClick={onEdit} disabled={pending} /><Action label="حذف" icon={<Trash2 className="size-4" />} onClick={onDelete} disabled={pending} danger /><Action label={address.is_default ? "پیش‌فرض" : "انتخاب پیش‌فرض"} icon={pending && !address.is_default ? <LoaderCircle className="size-4 animate-spin" /> : <Star className="size-4" />} onClick={onDefault} disabled={pending || address.is_default} /></div></article>;
}

function Action({ label, icon, onClick, disabled, danger = false }: { label: string; icon: ReactNode; onClick: () => void; disabled: boolean; danger?: boolean }) {
  return <button type="button" onClick={onClick} disabled={disabled} aria-label={label} className={`flex min-h-11 items-center justify-center gap-1 rounded-xl border px-2 text-[10px] font-bold outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:cursor-not-allowed disabled:opacity-45 ${danger ? "border-rose-400/15 text-rose-300 hover:bg-rose-500/10" : "border-white/10 text-zinc-300 hover:bg-white/5"}`}>{icon}<span className="truncate">{label}</span></button>;
}

function DeleteAddressDialog({ address, pending, onCancel, onConfirm }: { address: UserAddress; pending: boolean; onCancel: () => void; onConfirm: () => void }) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { confirmRef.current?.focus(); }, []);
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-address-title" onKeyDown={(event) => { if (event.key === "Escape" && !pending) onCancel(); }}><div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#181a22] p-5 shadow-2xl sm:p-6"><h2 id="delete-address-title" className="font-black">حذف «{address.title || "این آدرس"}»؟</h2><p className="mt-3 text-xs leading-7 text-zinc-400">این آدرس فقط پس از تأیید سرور حذف می‌شود. این عملیات قابل بازگشت نیست.</p>{address.is_default ? <p className="mt-3 rounded-xl bg-amber-400/10 p-3 text-[11px] leading-6 text-amber-200">این آدرس پیش‌فرض است؛ انتخاب جایگزین مطابق رفتار فعلی سرور انجام می‌شود.</p> : null}<div className="mt-5 flex gap-2"><button ref={confirmRef} type="button" onClick={onConfirm} disabled={pending} aria-busy={pending} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-500 text-sm font-black text-white outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:opacity-60">{pending ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : <Trash2 className="size-5" aria-hidden="true" />}{pending ? "در حال حذف..." : "بله، حذف شود"}</button><button type="button" onClick={onCancel} disabled={pending} className="min-h-12 flex-1 rounded-2xl border border-white/10 text-sm font-bold text-zinc-300 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-50">انصراف</button></div></div></div>;
}
