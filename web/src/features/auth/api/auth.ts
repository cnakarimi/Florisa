import { apiRequest, ApiError } from "@/lib/api/client";
import type {
  CompleteRegistrationPayload,
  OtpRequestPayload,
  OtpVerificationPayload,
  ProfileUpdatePayload,
  User,
} from "@/features/auth/types";
import { isDetailResponse, isUserResponse } from "./runtime";

const INVALID_RESPONSE = "پاسخ دریافتی از سرور معتبر نیست.";

export type AuthUser = User;

export interface UserResponse {
  user: User;
}

export interface DetailResponse {
  detail: string;
}

export async function requestOtp(phone: string): Promise<DetailResponse> {
  const payload: OtpRequestPayload = { phone };
  const data = await apiRequest<unknown>("/api/auth/request-otp/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!isDetailResponse(data)) throw new ApiError(INVALID_RESPONSE, 502);
  return data;
}

export async function verifyOtp(
  phone: string,
  code: string,
): Promise<UserResponse> {
  const payload: OtpVerificationPayload = { phone, code };
  const data = await apiRequest<unknown>("/api/auth/verify-otp/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!isUserResponse(data)) throw new ApiError(INVALID_RESPONSE, 502);
  return data;
}

export async function getCurrentUser(): Promise<UserResponse> {
  const data = await apiRequest<unknown>("/api/auth/me/");
  if (!isUserResponse(data)) throw new ApiError(INVALID_RESPONSE, 502);
  return data;
}

export function completeRegistration(
  payload: CompleteRegistrationPayload,
): Promise<UserResponse> {
  return checkedUserRequest("/api/auth/complete-registration/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function checkedUserRequest(
  path: string,
  init: RequestInit,
): Promise<UserResponse> {
  const data = await apiRequest<unknown>(path, init);
  if (!isUserResponse(data)) throw new ApiError(INVALID_RESPONSE, 502);
  return data;
}

export function updateProfile(
  payload: ProfileUpdatePayload,
): Promise<UserResponse> {
  return checkedUserRequest("/api/auth/me/", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function logout(): Promise<void> {
  return apiRequest<void>("/api/auth/logout/", {
    method: "POST",
  });
}
