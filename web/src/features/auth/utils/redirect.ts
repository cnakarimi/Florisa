export function sanitizeNextPath(
  value: string | string[] | undefined,
): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  try {
    const parsed = new URL(value, "https://florisa.local");
    if (parsed.origin !== "https://florisa.local") {
      return "/";
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/";
  }
}

export function withNext(path: string, nextPath: string): string {
  return nextPath === "/"
    ? path
    : `${path}?next=${encodeURIComponent(nextPath)}`;
}
