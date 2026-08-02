"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthStateScreen } from "@/features/auth/components/AuthStateScreen";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { clearPendingPhone } from "@/features/auth/utils/storage";
import { useCart } from "@/features/cart/hooks/CartProvider";
import { BottomNav } from "@/features/home/components/BottomNav";
import { ProfileView } from "@/features/home/components/ProfileView";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";

export function ProfileExperience() {
  const router = useRouter();
  const auth = useAuth();
  const cart = useCart();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (auth.isInitializing || auth.initializationError) {
      return;
    }

    if (!auth.isAuthenticated) {
      router.replace("/auth");
      return;
    }

    if (!auth.isProfileComplete) {
      router.replace("/auth/register?next=/profile");
    }
  }, [
    auth.initializationError,
    auth.isAuthenticated,
    auth.isInitializing,
    auth.isProfileComplete,
    router,
  ]);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    setLogoutError("");

    try {
      await auth.logout();
    } catch (error) {
      if (
        !(error instanceof ApiError) ||
        (error.status !== 401 && error.status !== 403)
      ) {
        if (isMountedRef.current) {
          setIsLoggingOut(false);
          setLogoutError(getApiErrorMessage(error));
        }
        return;
      }
    }

    clearPendingPhone();
    router.replace("/auth");
  };

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
        onRetry={() => {
          auth.refreshCurrentUser().catch(() => undefined);
        }}
      />
    );
  }

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#0d0e12] pb-24 text-zinc-100">
      <main className="mx-auto max-w-6xl px-4">
        <ProfileView
          phone={auth.user.phone}
          fullName={auth.user.full_name}
          email={auth.user.email}
          onLogout={handleLogout}
          logoutPending={isLoggingOut}
          logoutError={logoutError}
          cartCount={cart.totalBundles}
          onNavigateToCart={() => router.push("/cart")}
          onNavigateToTab={(tab) =>
            router.push(tab === "home" ? "/" : `/${tab}`)
          }
        />
      </main>

      <BottomNav />
    </div>
  );
}
