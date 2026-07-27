import { apiRequest } from "@/lib/api/client";

export interface AuthUser {
  id: number;
  phone: string;
  full_name: string;
  date_joined: string;
}

interface UserResponse {
  user: AuthUser;
}

interface DetailResponse {
  detail: string;
}

export function requestOtp(phone: string): Promise<DetailResponse> {
  return apiRequest<DetailResponse>("/api/auth/request-otp/", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export function verifyOtp(
  phone: string,
  code: string,
): Promise<UserResponse> {
  return apiRequest<UserResponse>("/api/auth/verify-otp/", {
    method: "POST",
    body: JSON.stringify({ phone, code }),
  });
}

export function getCurrentUser(): Promise<UserResponse> {
  return apiRequest<UserResponse>("/api/auth/me/");
}

export function logout(): Promise<void> {
  return apiRequest<void>("/api/auth/logout/", {
    method: "POST",
  });
}
