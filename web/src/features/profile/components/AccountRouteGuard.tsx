"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthStateScreen } from "@/features/auth/components/AuthStateScreen";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { withNext } from "@/features/auth/utils/redirect";

export function AccountRouteGuard({
  nextPath,
  children,
}: {
  nextPath: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (auth.isInitializing || auth.initializationError) return;
    if (!auth.isAuthenticated) {
      router.replace(withNext("/auth", nextPath));
      return;
    }
    if (!auth.isProfileComplete) {
      router.replace(withNext("/auth/register", nextPath));
    }
  }, [auth.isAuthenticated, auth.isInitializing, auth.isProfileComplete, auth.initializationError, nextPath, router]);

  if (
    auth.isInitializing ||
    auth.initializationError ||
    !auth.isAuthenticated ||
    !auth.isProfileComplete ||
    !auth.user
  ) {
    return (
      <AuthStateScreen
        error={auth.initializationError}
        onRetry={() => auth.refreshCurrentUser().catch(() => undefined)}
      />
    );
  }

  return children;
}
