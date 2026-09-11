"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { withNext } from "@/features/auth/utils/redirect";

interface RequireCompleteProfileResult {
  isReady: boolean;
  isInitializing: boolean;
  error: string | null;
}

export function useRequireCompleteProfile(
  nextPath: string,
): RequireCompleteProfileResult {
  const router = useRouter();

  const {
    isAuthenticated,
    isInitializing,
    isProfileComplete,
    initializationError,
  } = useAuth();

  useEffect(() => {
    if (isInitializing || initializationError) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(withNext("/auth", nextPath));
      return;
    }

    if (!isProfileComplete) {
      router.replace(withNext("/auth/register", nextPath));
    }
  }, [
    initializationError,
    isAuthenticated,
    isInitializing,
    isProfileComplete,
    nextPath,
    router,
  ]);

  const isReady =
    !isInitializing &&
    !initializationError &&
    isAuthenticated &&
    isProfileComplete;

  return {
    isReady,
    isInitializing,
    error: initializationError,
  };
}
