const DEFAULT_API_BASE_URL = "http://localhost:8000";

function normalizeApiBaseUrl(value: string): string {
  const normalized = value.trim().replace(/\/+$/, "");

  try {
    const url = new URL(normalized);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Unsupported API protocol");
    }
  } catch {
    throw new Error("NEXT_PUBLIC_API_BASE_URL معتبر نیست.");
  }

  return normalized;
}

export const API_BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL,
);
