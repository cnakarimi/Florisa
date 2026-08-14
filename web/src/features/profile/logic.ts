export interface ProfileFormValues {
  fullName: string;
  email: string;
}

export interface ProfileFieldErrors {
  full_name?: string;
  email?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateProfileForm(values: ProfileFormValues): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};
  if (!values.fullName.trim()) errors.full_name = "نام و نام خانوادگی را وارد کنید.";
  if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "یک ایمیل معتبر وارد کنید.";
  }
  return errors;
}

export function mapProfileUpdatePayload(values: ProfileFormValues) {
  return {
    full_name: values.fullName.trim(),
    email: values.email.trim(),
  };
}
