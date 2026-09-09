import assert from "node:assert/strict";
import test from "node:test";
import { getProductImageUrl, getCategoryImageUrl } from "./images.ts";

test("product uploads retain absolute media URLs, including signed queries", () => {
  const url = "https://media.example.com/products/rose.webp?signature=abc";
  assert.equal(getProductImageUrl(url), url);
  assert.equal(getProductImageUrl("/media/products/rose.webp"), "/media/products/rose.webp");
});

test("repository product and category filenames keep their existing URLs", () => {
  assert.equal(getProductImageUrl("rose.webp"), "/images/products/rose.webp");
  assert.equal(getCategoryImageUrl("plants.webp"), "/images/categories/plants.webp");
  assert.equal(getProductImageUrl(null), null);
  assert.equal(getProductImageUrl("../rose.webp"), null);
});
