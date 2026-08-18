import { ApiError, apiRequest } from "@/lib/api/client";

import { parseHomeSlides } from "./logic";
import type { HomeSlide } from "./types";

export async function getHomeSlides(): Promise<HomeSlide[]> {
  const data = await apiRequest<unknown>("/api/home/slides/");
  const slides = parseHomeSlides(data);

  if (!slides) {
    throw new ApiError("پاسخ اسلایدهای خانه از سرور معتبر نیست.", 502, {}, data);
  }

  return slides;
}
