import {
  AUTH_PHONE_STORAGE_KEY,
  AUTH_VERIFIED_STORAGE_KEY,
  IRANIAN_MOBILE_PATTERN,
} from "@/features/auth/constants";

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined";
}

export function storePhone(phone: string): void {
  if (canUseSessionStorage()) {
    window.sessionStorage.setItem(AUTH_PHONE_STORAGE_KEY, phone);
  }
}

export function readPhone(): string | null {
  if (!canUseSessionStorage()) {
    return null;
  }

  const phone = window.sessionStorage.getItem(AUTH_PHONE_STORAGE_KEY);

  return phone && IRANIAN_MOBILE_PATTERN.test(phone) ? phone : null;
}

export function storeVerification(isVerified: boolean): void {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.setItem(
    AUTH_VERIFIED_STORAGE_KEY,
    String(isVerified),
  );
}

export function readVerification(): boolean {
  if (!canUseSessionStorage()) {
    return false;
  }

  return window.sessionStorage.getItem(AUTH_VERIFIED_STORAGE_KEY) === "true";
}

export function clearAuthentication(): void {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.removeItem(AUTH_PHONE_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_VERIFIED_STORAGE_KEY);
}
