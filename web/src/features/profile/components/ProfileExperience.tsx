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
import { withNext } from "@/features/auth/utils/redirect";
import { AccountNavigation } from "./AccountNavigation";

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
      router.replace(withNext("/auth", "/profile"));
      return;
    }

    if (!auth.isProfileComplete) {
      router.replace(withNext("/auth/register", "/profile"));
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
    <div className="min-h-dvh overflow-x-hidden bg-[#0d0e12] text-zinc-100 md:pb-24">
      <main className="mx-auto grid max-w-5xl gap-6 px-4 sm:px-6 md:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
        <aside className="hidden pt-5 md:block"><div className="sticky top-5"><AccountNavigation /></div></aside>
        <ProfileView
          phone={auth.user.phone}
          fullName={auth.user.full_name}
          email={auth.user.email}
          onLogout={handleLogout}
          logoutPending={isLoggingOut}
          logoutError={logoutError}
          cartCount={cart.isHydrated ? cart.totalQuantity : 0}
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
