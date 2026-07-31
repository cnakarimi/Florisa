import "server-only";

const FORWARDED_REQUEST_HEADERS = [
  "accept",
  "accept-language",
  "content-type",
  "cookie",
  "origin",
  "referer",
  "user-agent",
  "x-csrftoken",
] as const;

const EXCLUDED_RESPONSE_HEADERS = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

export const dynamic = "force-dynamic";
export const revalidate = 0;

function backendOrigin(): URL {
  const value =
    process.env.BACKEND_URL?.trim() ||
    (process.env.VERCEL ? "" : "http://127.0.0.1:8000");
  if (!value) {
    throw new Error("BACKEND_URL must be configured for the API proxy.");
  }

  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    (url.pathname !== "/" && url.pathname !== "") ||
    url.search ||
    url.hash
  ) {
    throw new Error("BACKEND_URL must be an HTTP(S) origin without a path.");
  }

  return url;
}

function forwardedRequestHeaders(request: Request): Headers {
  const headers = new Headers();

  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value !== null) {
      headers.set(name, value);
    }
  }

  return headers;
}

function setCookieValues(headers: Headers): string[] {
  const cookieHeaders = headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof cookieHeaders.getSetCookie === "function") {
    return cookieHeaders.getSetCookie();
  }

  const combinedValue = headers.get("set-cookie");
  return combinedValue ? [combinedValue] : [];
}

function forwardedResponseHeaders(
  backendResponse: Response,
  origin: URL,
): Headers {
  const headers = new Headers();

  backendResponse.headers.forEach((value, name) => {
    const normalizedName = name.toLowerCase();
    if (
      normalizedName !== "set-cookie" &&
      !EXCLUDED_RESPONSE_HEADERS.has(normalizedName)
    ) {
      headers.append(name, value);
    }
  });

  for (const cookie of setCookieValues(backendResponse.headers)) {
    headers.append("set-cookie", cookie);
  }

  const location = backendResponse.headers.get("location");
  if (location) {
    const locationUrl = new URL(location, origin);
    headers.set(
      "location",
      locationUrl.origin === origin.origin
        ? `${locationUrl.pathname}${locationUrl.search}${locationUrl.hash}`
        : location,
    );
  }

  headers.set("Cache-Control", "private, no-store, max-age=0");
  return headers;
}

async function proxy(request: Request): Promise<Response> {
  const origin = backendOrigin();
  const incomingUrl = new URL(request.url);
  const backendUrl = new URL(
    `${incomingUrl.pathname}${incomingUrl.search}`,
    origin,
  );
  const method = request.method.toUpperCase();
  const body = ["GET", "HEAD"].includes(method)
    ? undefined
    : await request.arrayBuffer();

  const backendResponse = await fetch(backendUrl, {
    method,
    headers: forwardedRequestHeaders(request),
    body,
    cache: "no-store",
    redirect: "manual",
  });

  return new Response(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: forwardedResponseHeaders(backendResponse, origin),
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
