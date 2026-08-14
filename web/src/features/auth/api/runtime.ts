import type { User } from "@/features/auth/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isUser(value: unknown): value is User {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.phone === "string" &&
    typeof value.full_name === "string" &&
    (typeof value.email === "string" || value.email === null) &&
    typeof value.is_profile_complete === "boolean"
  );
}

export function isUserResponse(value: unknown): value is { user: User } {
  return isRecord(value) && isUser(value.user);
}

export function isDetailResponse(value: unknown): value is { detail: string } {
  return isRecord(value) && typeof value.detail === "string";
}
