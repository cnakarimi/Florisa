export type AuthStatus = "idle" | "submitting";

export interface User {
  id: number;
  phone: string;
  full_name: string;
  email: string | null;
  is_profile_complete: boolean;
}

export interface OtpRequestPayload {
  phone: string;
}

export interface OtpVerificationPayload extends OtpRequestPayload {
  code: string;
}

export interface CompleteRegistrationPayload {
  full_name: string;
  email?: string;
}

export type BackendValidationErrors = Record<string, string[]>;

export interface AuthenticationState {
  user: User | null;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  isInitializing: boolean;
  initializationError: string | null;
}

export interface OtpInputProps {
  value: string[];
  onChange: (digits: string[]) => void;
  disabled?: boolean;
  hasError?: boolean;
}
