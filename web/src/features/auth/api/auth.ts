import {
  apiRequest,
  readBrowserCookie,
} from "@/lib/api/client";

export interface AuthUser {
  id: number;
  phone: string;
  full_name: string;
  date_joined: string;
}

export interface UserResponse {
  user: AuthUser;
}

export interface DetailResponse {
  detail: string;
}

let csrfInitializationPromise: Promise<void> | null = null;

export async function initializeCsrf(): Promise<void> {
  if (readBrowserCookie("csrftoken")) {
    return;
  }

  if (!csrfInitializationPromise) {
    csrfInitializationPromise = apiRequest<DetailResponse>(
      "/api/auth/csrf/",
    )
      .then(() => undefined)
      .finally(() => {
        csrfInitializationPromise = null;
      });
  }

  await csrfInitializationPromise;
}

export async function requestOtp(phone: string): Promise<DetailResponse> {
  await initializeCsrf();
  return apiRequest<DetailResponse>("/api/auth/request-otp/", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export async function verifyOtp(
  phone: string,
  code: string,
): Promise<UserResponse> {
  await initializeCsrf();
  return apiRequest<UserResponse>("/api/auth/verify-otp/", {
    method: "POST",
    body: JSON.stringify({ phone, code }),
  });
}

export function getCurrentUser(): Promise<UserResponse> {
  return apiRequest<UserResponse>("/api/auth/me/");
}

export async function logout(): Promise<void> {
  await initializeCsrf();
  return apiRequest<void>("/api/auth/logout/", {
    method: "POST",
  });
}
