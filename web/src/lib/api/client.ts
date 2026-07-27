import { API_BASE_URL } from "@/lib/api/config";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
export const NETWORK_ERROR_MESSAGE =
  "ارتباط با سرور برقرار نشد. دوباره تلاش کنید.";
const MALFORMED_RESPONSE_MESSAGE = "پاسخ دریافتی از سرور معتبر نیست.";

export type ApiFieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: ApiFieldErrors;
  readonly rawData: unknown;

  constructor(
    message: string,
    status: number,
    fieldErrors: ApiFieldErrors = {},
    rawData: unknown = null,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.rawData = rawData;
  }
}

export function readBrowserCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix = `${encodeURIComponent(name)}=`;
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractFieldErrors(data: unknown): ApiFieldErrors {
  if (!isRecord(data)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(data).flatMap(([field, value]) => {
      if (field === "detail") {
        return [];
      }

      if (typeof value === "string") {
        return [[field, [value]]];
      }

      if (Array.isArray(value)) {
        const messages = value.filter(
          (item): item is string => typeof item === "string",
        );
        return messages.length > 0 ? [[field, messages]] : [];
      }

      return [];
    }),
  );
}

function extractMessage(data: unknown, fieldErrors: ApiFieldErrors): string {
  if (isRecord(data) && typeof data.detail === "string") {
    return data.detail;
  }

  const firstFieldMessage = Object.values(fieldErrors)[0]?.[0];
  return firstFieldMessage ?? NETWORK_ERROR_MESSAGE;
}

async function parseResponseData(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return text;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError(
      MALFORMED_RESPONSE_MESSAGE,
      response.status,
      {},
      text,
    );
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!SAFE_METHODS.has(method)) {
    const csrfToken = readBrowserCookie("csrftoken");
    if (csrfToken) {
      headers.set("X-CSRFToken", csrfToken);
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      method,
      headers,
      credentials: "include",
      cache: "no-store",
    });
  } catch (error) {
    throw new ApiError(NETWORK_ERROR_MESSAGE, 0, {}, error);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await parseResponseData(response);

  if (!response.ok) {
    const fieldErrors = extractFieldErrors(data);
    throw new ApiError(
      extractMessage(data, fieldErrors),
      response.status,
      fieldErrors,
      data,
    );
  }

  if (data === null) {
    throw new ApiError(MALFORMED_RESPONSE_MESSAGE, response.status);
  }

  return data as T;
}

export function getApiErrorMessage(
  error: unknown,
  preferredFields: string[] = [],
): string {
  if (!(error instanceof ApiError)) {
    return NETWORK_ERROR_MESSAGE;
  }

  for (const field of preferredFields) {
    const fieldMessage = error.fieldErrors[field]?.[0];
    if (fieldMessage) {
      return fieldMessage;
    }
  }

  return error.message || NETWORK_ERROR_MESSAGE;
}
