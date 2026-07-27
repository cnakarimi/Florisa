import { IRANIAN_MOBILE_PATTERN } from "@/features/auth/constants";
import { normalizeDigits } from "@/features/auth/utils/digits";

export function normalizeIranianPhone(value: string): string {
  return normalizeDigits(value).replace(/\D/g, "");
}

export function isValidIranianPhone(value: string): boolean {
  return IRANIAN_MOBILE_PATTERN.test(normalizeIranianPhone(value));
}

export function maskPhone(value: string): string {
  const phone = normalizeIranianPhone(value);

  if (phone.length !== 11) {
    return phone;
  }

  return `${phone.slice(0, 4)}****${phone.slice(-3)}`;
}
