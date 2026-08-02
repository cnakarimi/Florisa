"use client";

import { useRouter } from "next/navigation";

import { ScrollNavbar } from "./ScrollNavbar";

export function ShopNavigationScrollNavbar() {
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
    <ScrollNavbar
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
