import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  adjacentSlideIndex,
  classifyCtaUrl,
  correctedSlideIndex,
  parseHomeSlides,
  responsiveImageSources,
} from "./logic.ts";

const validSlide = {
  id: 7,
  eyebrow: "تازه",
  title: "گل‌های امروز",
  description: "انتخاب آرام و تازه برای خانه",
  mobile_image_url: "https://media.example/mobile.webp",
  desktop_image_url: "https://media.example/desktop.webp",
  image_alt: "گلدان گل روی میز",
  cta_label: "مشاهده گل‌ها",
  cta_url: "/shop?category=flowers&ordering=newest",
};

test("runtime parser accepts a valid public slide response", () => {
  assert.deepEqual(parseHomeSlides([validSlide]), [validSlide]);
  assert.deepEqual(parseHomeSlides([]), []);
});

test("runtime parser rejects malformed slide data", () => {
  assert.equal(parseHomeSlides({ results: [validSlide] }), null);
  assert.equal(parseHomeSlides([{ ...validSlide, title: "" }]), null);
  assert.equal(
    parseHomeSlides([{ ...validSlide, mobile_image_url: "javascript:alert(1)" }]),
    null,
  );
  assert.equal(parseHomeSlides([{ ...validSlide, cta_label: "" }]), null);
});

test("CTA classification preserves safe internal routes and query strings", () => {
  assert.deepEqual(classifyCtaUrl(" /shop?category=plants#new "), {
    kind: "internal",
    href: "/shop?category=plants#new",
  });
  assert.equal(classifyCtaUrl("javascript:alert(1)"), null);
  assert.equal(classifyCtaUrl("//attacker.example/path"), null);
  assert.equal(classifyCtaUrl("https://attacker.example/path"), null);
  assert.equal(classifyCtaUrl("/shop\\redirect"), null);
});

test("slide navigation is deterministic for zero, one, and multiple slides", () => {
  assert.equal(correctedSlideIndex(5, 0), 0);
  assert.equal(adjacentSlideIndex(0, "next", 1), 0);
  assert.equal(adjacentSlideIndex(0, "next", 3), 1);
  assert.equal(adjacentSlideIndex(2, "next", 3), 0);
  assert.equal(adjacentSlideIndex(0, "previous", 3), 2);
  assert.equal(correctedSlideIndex(4, 2), 1);
});

test("responsive image mapping uses the project lg breakpoint", () => {
  assert.deepEqual(responsiveImageSources(validSlide), {
    mobile: validSlide.mobile_image_url,
    desktop: validSlide.desktop_image_url,
    desktopMedia: "(min-width: 1024px)",
  });
});

test("Hero hides multi-slide controls for one slide and has no autoplay", async () => {
  const source = await readFile(
    new URL("../components/HomeHero.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /const hasMultipleSlides = slides\.length > 1/);
  assert.match(source, /\{hasMultipleSlides \? \(/);
  assert.doesNotMatch(source, /setInterval|setTimeout|autoplay/i);
  assert.match(source, /<picture>/);
  assert.match(source, /media=\{sources\.desktopMedia\}/);
});
