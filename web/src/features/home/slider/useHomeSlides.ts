"use client";

import { useEffect, useState } from "react";

import { getHomeSlides } from "./api";
import type { HomeSlide, HomeSlidesStatus } from "./types";

export function useHomeSlides() {
  const [slides, setSlides] = useState<HomeSlide[]>([]);
  const [status, setStatus] = useState<HomeSlidesStatus>("loading");

  useEffect(() => {
    let isCurrent = true;
    setStatus("loading");

    getHomeSlides()
      .then((nextSlides) => {
        if (!isCurrent) return;
        setSlides(nextSlides);
        setStatus("ready");
      })
      .catch(() => {
        if (!isCurrent) return;
        setSlides([]);
        setStatus("error");
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return { slides, status };
}
