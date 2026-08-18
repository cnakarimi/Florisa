import type { HomeSlide } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafeImageUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;

  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function classifyCtaUrl(
  value: string,
): { kind: "internal"; href: string } | null {
  const href = value.trim();
  if (
    !href.startsWith("/") ||
    href.startsWith("//") ||
    href.includes("\\") ||
    [...href].some((character) => character.charCodeAt(0) < 32)
  ) {
    return null;
  }

  try {
    const parsed = new URL(href, "https://florisa.invalid");
    if (parsed.origin !== "https://florisa.invalid") return null;
  } catch {
    return null;
  }

  return { kind: "internal", href };
}

export function isHomeSlide(value: unknown): value is HomeSlide {
  if (!isRecord(value)) return false;

  const hasCtaLabel = typeof value.cta_label === "string" && value.cta_label.length > 0;
  const hasCtaUrl = typeof value.cta_url === "string" && value.cta_url.length > 0;

  return (
    typeof value.id === "number" &&
    Number.isSafeInteger(value.id) &&
    value.id > 0 &&
    typeof value.eyebrow === "string" &&
    typeof value.title === "string" &&
    value.title.length > 0 &&
    typeof value.description === "string" &&
    isSafeImageUrl(value.mobile_image_url) &&
    isSafeImageUrl(value.desktop_image_url) &&
    typeof value.image_alt === "string" &&
    value.image_alt.length > 0 &&
    typeof value.cta_label === "string" &&
    typeof value.cta_url === "string" &&
    hasCtaLabel === hasCtaUrl &&
    (!hasCtaUrl || classifyCtaUrl(value.cta_url) !== null)
  );
}

export function parseHomeSlides(value: unknown): HomeSlide[] | null {
  return Array.isArray(value) && value.every(isHomeSlide) ? value : null;
}

export function correctedSlideIndex(currentIndex: number, slideCount: number): number {
  if (slideCount <= 0) return 0;
  return Math.min(Math.max(currentIndex, 0), slideCount - 1);
}

export function adjacentSlideIndex(
  currentIndex: number,
  direction: "previous" | "next",
  slideCount: number,
): number {
  if (slideCount <= 1) return 0;
  const delta = direction === "next" ? 1 : -1;
  return (correctedSlideIndex(currentIndex, slideCount) + delta + slideCount) % slideCount;
}

export function responsiveImageSources(slide: HomeSlide) {
  return {
    mobile: slide.mobile_image_url,
    desktop: slide.desktop_image_url,
    desktopMedia: "(min-width: 1024px)",
  } as const;
}
