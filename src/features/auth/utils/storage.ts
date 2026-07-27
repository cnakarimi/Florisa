import {
  AUTH_PHONE_STORAGE_KEY,
  AUTH_VERIFIED_STORAGE_KEY,
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

  return window.sessionStorage.getItem(AUTH_PHONE_STORAGE_KEY);
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
