const PRODUCT_IMAGE_BASE_PATH = "/images/products";

export function getProductImageUrl(
  filename: string | null | undefined,
): string | null {
  const normalized = filename?.trim().replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized) {
    return null;
  }

  const segments = normalized.split("/").filter(Boolean);
  if (segments.some((segment) => segment === "." || segment === "..")) {
    return null;
  }

  return `${PRODUCT_IMAGE_BASE_PATH}/${segments.map(encodeURIComponent).join("/")}`;
}
