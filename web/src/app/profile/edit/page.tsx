import type { Metadata } from "next";
import { AccountEditExperience } from "@/features/profile/components/AccountEditExperience";

export const metadata: Metadata = { title: "ویرایش اطلاعات حساب | فلوریسا" };

export default function AccountEditPage() {
  return <AccountEditExperience />;
}
