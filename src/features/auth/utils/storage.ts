const PHONE_STORAGE_KEY = "sina-flower.auth.phone";

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined";
}

export function storePhone(phone: string): void {
  if (canUseSessionStorage()) {
    window.sessionStorage.setItem(PHONE_STORAGE_KEY, phone);
  }
}

export function readPhone(): string | null {
  if (!canUseSessionStorage()) {
    return null;
  }

  return window.sessionStorage.getItem(PHONE_STORAGE_KEY);
}

