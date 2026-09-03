import type { Metadata } from "next";

import { FavoritesExperience } from "@/features/favorites/components/FavoritesExperience";

export const metadata: Metadata = {
  title: "علاقه‌مندی‌ها | فلوریسا",
  description: "محصولات مورد علاقه شما در فلوریسا",
};

export default function FavoritesPage() {
  return <FavoritesExperience />;
}
