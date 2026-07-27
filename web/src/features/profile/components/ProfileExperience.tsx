"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/features/home/components/BottomNav";
import { ProfileView } from "@/features/home/components/ProfileView";
import type { TabType } from "@/features/home/types";
import {
  clearAuthentication,
  readPhone,
  readVerification,
} from "@/features/auth/utils/storage";

type ProfileSession =
  | { status: "checking"; phone: null }
  | { status: "authenticated"; phone: string };

export function ProfileExperience() {
  const router = useRouter();
  const [session, setSession] = useState<ProfileSession>({
    status: "checking",
    phone: null,
  });

  useEffect(() => {
    const phone = readPhone();

    if (!phone || !readVerification()) {
      router.replace("/auth");
      return;
    }

    setSession({ status: "authenticated", phone });
  }, [router]);

  const handleLogout = () => {
    clearAuthentication();
    router.replace("/auth");
  };

  const handleNavigation = (tab: TabType) => {
    if (tab === "profile") {
      return;
    }

    router.push("/");
  };

  if (session.status === "checking") {
    return (
      <div
        className="min-h-dvh bg-[#0d0e12]"
        aria-label="در حال بررسی حساب کاربری"
      />
    );
  }

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#0d0e12] pb-24 text-zinc-100">
      <main className="mx-auto max-w-6xl px-4">
        <ProfileView
          phone={session.phone}
          onLogout={handleLogout}
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
