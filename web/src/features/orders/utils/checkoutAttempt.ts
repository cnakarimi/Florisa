import type { CheckoutItemInput } from "@/features/orders/types";

const KEY = "florisa_checkout_attempt_v1";

export function cartFingerprint(items: CheckoutItemInput[]): string {
  return [...items]
    .sort((a, b) => a.product_id - b.product_id)
    .map((item) => `${item.product_id}:${item.quantity}`)
    .join("|");
}

export function getCheckoutAttemptKey(items: CheckoutItemInput[]): string {
  const fingerprint = cartFingerprint(items);
  if (typeof window !== "undefined") {
    try {
      const raw = window.sessionStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { fingerprint?: unknown; key?: unknown };
        if (parsed.fingerprint === fingerprint && typeof parsed.key === "string") return parsed.key;
      }
    } catch {
      // A stable in-memory key is still used for this mounted attempt.
    }
  }
  const key = crypto.randomUUID();
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(KEY, JSON.stringify({ fingerprint, key }));
    } catch {}
  }
  return key;
}

export function clearCheckoutAttempt(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {}
}
