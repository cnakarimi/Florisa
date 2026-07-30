export function browserApiUrl(path: string): string {
  if (!path.startsWith("/api/")) {
    throw new Error("Browser API paths must start with /api/.");
  }

  return path;
}
