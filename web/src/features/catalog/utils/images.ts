const PRODUCT_IMAGE_BASE_PATH = "/images/products";
const CATEGORY_IMAGE_BASE_PATH = "/images/categories";

function getRepositoryImageUrl(
  basePath: string,
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

  return `${basePath}/${segments.map(encodeURIComponent).join("/")}`;
}

export function getProductImageUrl(
  filename: string | null | undefined,
): string | null {
  return getRepositoryImageUrl(PRODUCT_IMAGE_BASE_PATH, filename);
}

export function getCategoryImageUrl(
  filename: string | null | undefined,
): string | null {
  return getRepositoryImageUrl(CATEGORY_IMAGE_BASE_PATH, filename);
}

export function resolveCatalogImageUrl(
  src: string | null | undefined,
): string | null {
  if (!src) {
    return null;
  }
  if (/^https?:\/\//i.test(src)) {
    return src;
  }
  return src.startsWith("/") ? src : `/${src}`;
}
