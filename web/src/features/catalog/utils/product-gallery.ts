import type { CatalogProductDetail, PlantPotOption } from "../types";
import { getProductImageUrl } from "./images.ts";

export interface GalleryImage {
  key: string;
  src: string | null;
  alt: string;
  isConfiguration?: boolean;
}

function imageIdentity(src: string, mediaOrigin?: string): string {
  const pageOrigin = typeof window === "undefined" ? "http://gallery.local" : window.location.origin;
  const url = new URL(src, src.startsWith("/media/") && mediaOrigin ? mediaOrigin : pageOrigin);
  // Relative media paths refer to the API's storage origin. Never erase the
  // origin of an absolute URL: two hosts can serve different files at one path.
  return url.origin + decodeURI(url.pathname) + url.search;
}

export function buildProductGallery(product: CatalogProductDetail, selected: PlantPotOption | null): GalleryImage[] {
  const slides: GalleryImage[] = [];
  const seen = new Set<string>();
  const mediaSource = [selected?.configuration_image, product.cover_image,
    ...(product.pot_options ?? []).map(option => option.configuration_image)]
    .find(src => src && /^https?:\/\/[^/]+\/media\//i.test(src));
  const mediaOrigin = mediaSource ? new URL(mediaSource).origin : undefined;
  const add = (source: string | null | undefined, alt: string, configuration = false) => {
    const src = getProductImageUrl(source);
    if (!src) return;
    const key = imageIdentity(src, mediaOrigin);
    if (seen.has(key)) return;
    seen.add(key);
    slides.push({ key, src, alt, isConfiguration: configuration });
  };
  if (product.product_type === "plant") {
    add(selected?.configuration_image, `${product.name} در ${selected?.name}`, true);
  }
  const decorative = new Set((product.pot_options ?? [])
    .filter(option => !option.is_baseline && option.configuration_image)
    .map(option => imageIdentity(getProductImageUrl(option.configuration_image)!, mediaOrigin)));
  const addOriginal = (source: string | null | undefined, alt: string) => {
    const src = getProductImageUrl(source);
    if (src && decorative.has(imageIdentity(src, mediaOrigin))) return;
    add(source, alt);
  };
  addOriginal(product.cover_image, product.name);
  for (const image of product.images) addOriginal(image.image, image.alt_text || product.name);
  return slides.length ? slides : [{ key: "fallback", src: null, alt: product.name }];
}

export function galleryIndex(index: number, length: number): number {
  return Math.max(0, Math.min(index, Math.max(0, length - 1)));
}
