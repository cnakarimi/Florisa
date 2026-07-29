import { apiRequest } from "@/lib/api/client";
import type {
  CompleteRegistrationPayload,
  OtpRequestPayload,
  OtpVerificationPayload,
  User,
} from "@/features/auth/types";

export type AuthUser = User;

export interface UserResponse {
  user: User;
}

export interface DetailResponse {
  detail: string;
}

export async function requestOtp(phone: string): Promise<DetailResponse> {
  const payload: OtpRequestPayload = { phone };
  return apiRequest<DetailResponse>("/api/auth/request-otp/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyOtp(
  phone: string,
  code: string,
): Promise<UserResponse> {
  const payload: OtpVerificationPayload = { phone, code };
  return apiRequest<UserResponse>("/api/auth/verify-otp/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser(): Promise<UserResponse> {
  return apiRequest<UserResponse>("/api/auth/me/");
}

export function completeRegistration(
  payload: CompleteRegistrationPayload,
): Promise<UserResponse> {
  return apiRequest<UserResponse>("/api/auth/complete-registration/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logout(): Promise<void> {
  return apiRequest<void>("/api/auth/logout/", {
    method: "POST",
  });
}
