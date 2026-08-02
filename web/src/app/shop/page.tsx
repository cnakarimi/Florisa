import type { Metadata } from "next";

import { HomeExperience } from "@/features/home/components/HomeExperience";

export const metadata: Metadata = {
  title: "فروشگاه | فلوریسا",
  description: "مشاهده و خرید گل‌ها و گیاهان فلوریسا",
};

interface ShopPageProps {
  searchParams: Promise<{
    search?: string | string[];
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { search } = await searchParams;
  const initialSearch = typeof search === "string" ? search : "";

  return <HomeExperience view="shop" initialSearch={initialSearch} />;
}
