"use client";

import { type FormEvent, type InputHTMLAttributes, useState } from "react";
import { LoaderCircle } from "lucide-react";
import type { ApiFieldErrors } from "@/lib/api/client";
import type { AddressInput } from "@/features/orders/types";
import { normalizeAddressInput, type AddressFieldErrors, validateAddressInput } from "@/features/orders/utils/address";

export function AddressForm({ value, onChange, onSubmit, isSaving, mode, serverFieldErrors = {}, formError = "", onFieldChange, onCancel }: {
  value: AddressInput;
  onChange: (value: AddressInput) => void;
  onSubmit: (value: AddressInput) => void | Promise<void>;
  isSaving: boolean;
  mode: "create" | "edit";
  serverFieldErrors?: ApiFieldErrors;
  formError?: string;
  onFieldChange?: (field: keyof AddressInput) => void;
  onCancel?: () => void;
}) {
  const [localErrors, setLocalErrors] = useState<AddressFieldErrors>({});
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;
    const errors = validateAddressInput(value);
    setLocalErrors(errors);
    if (Object.keys(errors).length) return;
    void onSubmit(normalizeAddressInput(value));
  };
  const set = (name: keyof AddressInput, next: string | boolean) => {
    onChange({ ...value, [name]: next });
    setLocalErrors((current) => ({ ...current, [name]: undefined }));
    onFieldChange?.(name);
  };
  const errorFor = (name: keyof AddressInput) => localErrors[name] ?? serverFieldErrors[name]?.[0];

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <InputField name="title" label="عنوان آدرس" value={value.title ?? ""} onChange={set} error={errorFor("title")} autoComplete="off" maxLength={80} placeholder="مثلاً خانه یا محل کار" />
      <InputField name="recipient_name" label="نام تحویل‌گیرنده" required value={value.recipient_name} onChange={set} error={errorFor("recipient_name")} autoComplete="name" maxLength={150} />
      <InputField name="recipient_phone" label="شماره موبایل تحویل‌گیرنده" required value={value.recipient_phone} onChange={set} error={errorFor("recipient_phone")} autoComplete="tel" inputMode="numeric" dir="ltr" maxLength={11} />
      <InputField name="district" label="منطقه یا محله" value={value.district ?? ""} onChange={set} error={errorFor("district")} autoComplete="address-level3" maxLength={120} />
      <InputField name="province" label="استان" value="تهران" onChange={set} readOnly error={errorFor("province")} autoComplete="address-level1" />
      <InputField name="city" label="شهر" value="تهران" onChange={set} readOnly error={errorFor("city")} autoComplete="address-level2" />
      <div className="sm:col-span-2"><TextAreaField name="address_line" label="نشانی کامل" required value={value.address_line} onChange={set} error={errorFor("address_line")} autoComplete="street-address" /></div>
      <InputField name="plaque" label="پلاک" value={value.plaque ?? ""} onChange={set} error={errorFor("plaque")} inputMode="numeric" maxLength={20} />
      <InputField name="unit" label="واحد" value={value.unit ?? ""} onChange={set} error={errorFor("unit")} inputMode="numeric" maxLength={20} />
      <InputField name="postal_code" label="کد پستی ۱۰ رقمی (اختیاری)" value={value.postal_code ?? ""} onChange={set} error={errorFor("postal_code")} autoComplete="postal-code" inputMode="numeric" dir="ltr" maxLength={12} />
      <label className="flex min-h-14 items-center gap-3 self-end rounded-2xl border border-white/10 bg-black/10 px-4 text-xs font-bold text-zinc-300"><input type="checkbox" checked={Boolean(value.is_default)} onChange={(event) => set("is_default", event.target.checked)} className="size-4 accent-amber-400" />استفاده به‌عنوان آدرس پیش‌فرض</label>
      <div className="sm:col-span-2"><TextAreaField name="delivery_note" label="توضیحات تحویل (اختیاری)" value={value.delivery_note ?? ""} onChange={set} error={errorFor("delivery_note")} autoComplete="off" /></div>
      {formError ? <p role="alert" className="sm:col-span-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-xs leading-6 text-rose-300">{formError}</p> : null}
      <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row">
        {onCancel ? <button type="button" onClick={onCancel} disabled={isSaving} className="min-h-12 flex-1 rounded-2xl border border-white/10 px-4 text-sm font-bold text-zinc-300 outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-50">انصراف</button> : null}
        <button type="submit" disabled={isSaving} aria-busy={isSaving} className="flex min-h-12 flex-[2] items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 text-sm font-black text-white outline-none transition hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : null}{isSaving ? "در حال ذخیره..." : mode === "edit" ? "ذخیره تغییرات آدرس" : "افزودن آدرس"}</button>
      </div>
    </form>
  );
}

function InputField({ name, label, value, onChange, error, required = false, readOnly = false, ...props }: { name: keyof AddressInput; label: string; value: string; onChange: (name: keyof AddressInput, value: string) => void; error?: string; required?: boolean; readOnly?: boolean } & Pick<InputHTMLAttributes<HTMLInputElement>, "autoComplete" | "inputMode" | "dir" | "maxLength" | "placeholder">) {
  const id = `address-${name}`;
  return <label htmlFor={id} className="block text-xs font-bold text-zinc-300">{label}{required ? <span className="mr-1 text-rose-300">*</span> : null}<input id={id} name={name} value={value} onChange={(event) => onChange(name, event.target.value)} required={required} readOnly={readOnly} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={`account-input mt-2 px-4 ${props.dir === "ltr" ? "numeric-ltr text-left" : ""} ${readOnly ? "cursor-not-allowed text-zinc-500" : ""}`} {...props} />{error ? <span id={`${id}-error`} role="alert" className="mt-1.5 block text-[11px] font-normal text-rose-300">{error}</span> : null}</label>;
}

function TextAreaField({ name, label, value, onChange, error, required = false, autoComplete }: { name: keyof AddressInput; label: string; value: string; onChange: (name: keyof AddressInput, value: string) => void; error?: string; required?: boolean; autoComplete: string }) {
  const id = `address-${name}`;
  return <label htmlFor={id} className="block text-xs font-bold text-zinc-300">{label}{required ? <span className="mr-1 text-rose-300">*</span> : null}<textarea id={id} name={name} value={value} onChange={(event) => onChange(name, event.target.value)} required={required} rows={3} maxLength={500} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-7 text-zinc-100 outline-none transition hover:border-white/15 focus-visible:border-amber-400/70 focus-visible:ring-3 focus-visible:ring-amber-400/10" />{error ? <span id={`${id}-error`} role="alert" className="mt-1.5 block text-[11px] font-normal text-rose-300">{error}</span> : null}</label>;
}
