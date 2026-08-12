"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

import type { HomeExperiencePresentationProps } from "./homeExperience.types";
import { MobileHomeExperience } from "./MobileHomeExperience";

const DESKTOP_QUERY = "(min-width: 1024px)";

const DesktopHomeExperience = dynamic(
  () =>
    import("./DesktopHomeExperience").then(
      (module) => module.DesktopHomeExperience,
    ),
  { ssr: false },
);

function subscribeToDesktopQuery(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(DESKTOP_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);

  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getDesktopSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function ResponsiveHomeExperience(
  props: HomeExperiencePresentationProps,
) {
  const isDesktop = useSyncExternalStore(
    subscribeToDesktopQuery,
    getDesktopSnapshot,
    getServerSnapshot,
  );

  return isDesktop ? (
    <DesktopHomeExperience {...props} />
  ) : (
    <MobileHomeExperience {...props} />
  );
}
