"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/features/auth/api/auth";
import {
  clearCurrentUserCache,
  useCurrentUser,
} from "@/features/auth/hooks/useCurrentUser";
import { clearPendingPhone } from "@/features/auth/utils/storage";
import { BottomNav } from "@/features/home/components/BottomNav";
import { ProfileView } from "@/features/home/components/ProfileView";
import type { TabType } from "@/features/home/types";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";

export function ProfileExperience() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (currentUser.status === "unauthenticated") {
      router.replace("/auth");
    }
  }, [currentUser.status, router]);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    setLogoutError("");

    try {
      await logout();
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
    clearCurrentUserCache();
    router.replace("/auth");
  };

  const handleNavigation = (tab: TabType) => {
    if (tab === "profile") {
      return;
    }

    router.push("/");
  };

  if (currentUser.status !== "authenticated") {
    return (
      <div
        className="min-h-dvh bg-[#0d0e12]"
        aria-label={
          currentUser.status === "error"
            ? currentUser.error
            : "در حال بررسی حساب کاربری"
        }
      />
    );
  }

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#0d0e12] pb-24 text-zinc-100">
      <main className="mx-auto max-w-6xl px-4">
        <ProfileView
          phone={currentUser.user.phone}
          fullName={currentUser.user.full_name}
          onLogout={handleLogout}
          logoutPending={isLoggingOut}
          logoutError={logoutError}
          onNavigateToTab={handleNavigation}
        />
      </main>

      <BottomNav
        activeTab="profile"
        setActiveTab={handleNavigation}
        favoritesCount={0}
      />
    </div>
  );
}
