import type { Metadata } from "next";
import { AddressesExperience } from "@/features/profile/components/AddressesExperience";

export const metadata: Metadata = { title: "آدرس‌های من | فلوریسا" };

export default function AddressesPage() {
  return <AddressesExperience />;
}
