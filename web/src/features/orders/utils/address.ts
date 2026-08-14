import { normalizeDigits } from "@/features/auth/utils/digits";
import { normalizeIranianPhone } from "@/features/auth/utils/phone";
import type { AddressInput } from "@/features/orders/types";

export type AddressFieldErrors = Partial<Record<keyof AddressInput, string>>;

export function emptyAddressInput(defaults: Partial<AddressInput> = {}): AddressInput {
  return {
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
    is_default: false,
    ...defaults,
  };
}

export function normalizeAddressInput(input: AddressInput): AddressInput {
  const clean = (value: string | undefined) => value?.trim() ?? "";
  return {
    title: clean(input.title),
    recipient_name: clean(input.recipient_name),
    recipient_phone: normalizeIranianPhone(input.recipient_phone),
    province: "تهران",
    city: "تهران",
    district: clean(input.district),
    address_line: clean(input.address_line),
    plaque: clean(input.plaque),
    unit: clean(input.unit),
    postal_code: normalizeDigits(input.postal_code ?? "").replace(/[\s-]/g, ""),
    delivery_note: clean(input.delivery_note),
    is_default: Boolean(input.is_default),
  };
}

export function validateAddressInput(input: AddressInput): AddressFieldErrors {
  const normalized = normalizeAddressInput(input);
  const errors: AddressFieldErrors = {};
  if (!normalized.recipient_name) errors.recipient_name = "نام تحویل‌گیرنده را وارد کنید.";
  if (!/^09\d{9}$/.test(normalized.recipient_phone)) errors.recipient_phone = "یک شماره موبایل معتبر ۱۱ رقمی وارد کنید.";
  if (!normalized.address_line) errors.address_line = "نشانی کامل را وارد کنید.";
  if (normalized.postal_code && !/^\d{10}$/.test(normalized.postal_code)) errors.postal_code = "کد پستی باید ۱۰ رقم باشد.";
  return errors;
}
