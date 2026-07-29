"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthStateScreen } from "@/features/auth/components/AuthStateScreen";
import { WelcomeView } from "@/features/auth/components/WelcomeView";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import {
  clearRegistrationSuccessToken,
  isRegistrationSuccessToken,
} from "@/features/auth/utils/registrationSuccess";

interface WelcomeExperienceProps {
  flowToken: string | null;
}

export function WelcomeExperience({
  flowToken,
}: WelcomeExperienceProps) {
  const router = useRouter();
  const auth = useAuth();
  const [hasValidFlow] = useState(() =>
    isRegistrationSuccessToken(flowToken),
  );

  useEffect(() => {
    if (auth.isInitializing || auth.initializationError) {
      return;
    }

    if (!auth.isAuthenticated) {
      router.replace("/auth");
      return;
    }

    if (!auth.isProfileComplete || !hasValidFlow) {
      router.replace("/");
    }
  }, [
    auth.initializationError,
    auth.isAuthenticated,
    auth.isInitializing,
    auth.isProfileComplete,
    hasValidFlow,
    router,
  ]);

  if (
    auth.isInitializing ||
    auth.initializationError ||
    !auth.isAuthenticated ||
    !auth.isProfileComplete ||
    !hasValidFlow
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

  const leaveSuccessPage = (destination: string) => {
    clearRegistrationSuccessToken();
    router.replace(destination);
  };

  return (
    <WelcomeView
      onGoToShop={() => leaveSuccessPage("/")}
      onGoToProfile={() => leaveSuccessPage("/profile")}
    />
  );
}
