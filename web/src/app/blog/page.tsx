import type { Metadata } from "next";

import { BlogExperience } from "@/features/blog/components/BlogExperience";

export const metadata: Metadata = {
  title: "وبلاگ | فلوریسا",
  description: "مقالات، راهنماها و نکات کاربردی درباره گل‌ها و گیاهان",
};

export default function BlogPage() {
  return <BlogExperience />;
}
