import {
  IRANIAN_MOBILE_PATTERN,
  PENDING_AUTH_PHONE_STORAGE_KEY,
} from "@/features/auth/constants";

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined";
}

export function storePendingPhone(phone: string): void {
  if (canUseSessionStorage()) {
    window.sessionStorage.setItem(PENDING_AUTH_PHONE_STORAGE_KEY, phone);
  }
}

export function readPendingPhone(): string | null {
  if (!canUseSessionStorage()) {
    return null;
  }

  const phone = window.sessionStorage.getItem(
    PENDING_AUTH_PHONE_STORAGE_KEY,
  );

  return phone && IRANIAN_MOBILE_PATTERN.test(phone) ? phone : null;
}

export function clearPendingPhone(): void {
  if (canUseSessionStorage()) {
    window.sessionStorage.removeItem(PENDING_AUTH_PHONE_STORAGE_KEY);
  }
}
