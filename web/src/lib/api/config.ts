export function browserApiUrl(path: string): string {
  if (!path.startsWith("/api/")) {
    throw new Error("Browser API paths must start with /api/.");
  }

  const suffixIndex = path.search(/[?#]/);
  const pathname = suffixIndex === -1 ? path : path.slice(0, suffixIndex);

  if (pathname.endsWith("/")) {
    return path;
  }

  const suffix = suffixIndex === -1 ? "" : path.slice(suffixIndex);
  return `${pathname}/${suffix}`;
}
