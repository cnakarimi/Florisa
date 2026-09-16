"use client";

import { useRouter } from "next/navigation";

import { MobileTopNavbar } from "@/components/navigation/MobileTopNavbar";
export function ShopTopNavbar() {
  const router = useRouter();
  const searchQuery = "";

  const handleSearch = (query: string) => {
    const normalizedQuery = query.trim();
    const search = normalizedQuery
      ? `?search=${encodeURIComponent(normalizedQuery)}`
      : "";

    router.push(`/shop${search}`);
  };

  return (
    <MobileTopNavbar
      searchQuery={searchQuery}
      onSearch={handleSearch}
      onLogoClick={() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }}
    />
  );
}
