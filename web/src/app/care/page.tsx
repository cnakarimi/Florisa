import type { Metadata } from "next";

import { HomeExperience } from "@/features/home/components/HomeExperience";

export const metadata: Metadata = {
  title: "گیاه‌پزشک | فلوریسا",
  description: "راهنمای هوشمند نگهداری از گیاهان",
};

export default function CarePage() {
  return <HomeExperience view="care" />;
}
