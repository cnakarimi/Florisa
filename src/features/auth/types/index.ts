export type AuthStatus = "idle" | "submitting" | "success";

export interface OtpInputProps {
  value: string[];
  onChange: (digits: string[]) => void;
  disabled?: boolean;
  hasError?: boolean;
}

