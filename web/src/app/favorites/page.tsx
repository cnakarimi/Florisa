import type { Metadata } from "next";

import { HomeExperience } from "@/features/home/components/HomeExperience";

export const metadata: Metadata = {
  title: "علاقه‌مندی‌ها | فلوریسا",
  description: "محصولات مورد علاقه شما در فلوریسا",
};

export default function FavoritesPage() {
  return <HomeExperience view="favorites" />;
}
