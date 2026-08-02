"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthStateScreen } from "@/features/auth/components/AuthStateScreen";
import {
  RegisterView,
  type RegistrationFieldErrors,
  type RegistrationFormData,
} from "@/features/auth/components/RegisterView";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { createRegistrationSuccessToken } from "@/features/auth/utils/registrationSuccess";
import { withNext } from "@/features/auth/utils/redirect";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";

interface RegisterExperienceProps {
  nextPath?: string;
}

export function RegisterExperience({
  nextPath = "/",
}: RegisterExperienceProps) {
  const router = useRouter();
  const auth = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<RegistrationFieldErrors>({});
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    if (auth.isInitializing || auth.initializationError || isSubmitting) {
      return;
    }

    if (!auth.isAuthenticated) {
      router.replace(withNext("/auth", nextPath));
      return;
    }

    if (auth.isProfileComplete) {
      router.replace(nextPath);
    }
  }, [
    auth.initializationError,
    auth.isAuthenticated,
    auth.isInitializing,
    auth.isProfileComplete,
    isSubmitting,
    nextPath,
    router,
  ]);

  const handleComplete = async ({ fullName, email }: RegistrationFormData) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setGeneralError("");

    try {
      const user = await auth.completeRegistration({
        full_name: fullName,
        ...(email ? { email } : {}),
      });

      if (!user.is_profile_complete) {
        setGeneralError("تکمیل حساب کاربری تأیید نشد. دوباره تلاش کنید.");
        setIsSubmitting(false);
        return;
      }

      if (nextPath !== "/") {
        router.replace(nextPath);
        return;
      }

      const flowToken = createRegistrationSuccessToken();
      router.replace(
        `/auth/registration-success?flow=${encodeURIComponent(flowToken)}`,
      );
    } catch (error) {
      let nextFieldErrors: RegistrationFieldErrors = {};
      if (error instanceof ApiError) {
        nextFieldErrors = {
          full_name: error.fieldErrors.full_name?.[0],
          email: error.fieldErrors.email?.[0],
        };
        setFieldErrors(nextFieldErrors);

        if (error.status === 401 || error.status === 403) {
          auth.refreshCurrentUser().catch(() => undefined);
        }
      }
      setGeneralError(
        nextFieldErrors.full_name || nextFieldErrors.email
          ? ""
          : getApiErrorMessage(error),
      );
      setIsSubmitting(false);
    }
  };

  if (
    auth.isInitializing ||
    auth.initializationError ||
    !auth.isAuthenticated ||
    auth.isProfileComplete
  ) {
    return (
      <AuthStateScreen
        error={auth.initializationError}
        onRetry={() => {
          auth.refreshCurrentUser().catch(() => undefined);
        }}
      />
    );
  }

  return (
    <RegisterView
      onComplete={handleComplete}
      onSkip={() => router.replace("/")}
      onClose={() => router.replace("/")}
      onFieldChange={(field) => {
        setFieldErrors((errors) => ({
          ...errors,
          [field]: undefined,
        }));
        setGeneralError("");
      }}
      isSubmitting={isSubmitting}
      fieldErrors={fieldErrors}
      generalError={generalError}
    />
  );
}
