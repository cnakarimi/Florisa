import assert from "node:assert/strict";
import test from "node:test";

import { PRODUCT_ORDERINGS, isProductOrdering } from "../catalog/types.ts";
import {
  HOME_FEATURED_PRODUCTS_QUERY,
  HOME_NEWEST_PRODUCTS_QUERY,
  HOME_PRODUCTS_LIMIT,
} from "./queries.ts";

test("catalog ordering contract includes featured and rejects arbitrary values", () => {
  assert.deepEqual(PRODUCT_ORDERINGS, [
    "newest",
    "price",
    "-price",
    "name",
    "-name",
    "featured",
  ]);
  assert.equal(isProductOrdering("featured"), true);
  assert.equal(isProductOrdering("popularity"), false);
});

test("Home requests independent featured and newest collections", () => {
  assert.equal(HOME_PRODUCTS_LIMIT, 8);
  assert.deepEqual(HOME_FEATURED_PRODUCTS_QUERY, {
    is_featured: true,
    ordering: "featured",
    page_size: 8,
  });
  assert.deepEqual(HOME_NEWEST_PRODUCTS_QUERY, {
    ordering: "newest",
    page_size: 8,
  });
  assert.notEqual(HOME_FEATURED_PRODUCTS_QUERY, HOME_NEWEST_PRODUCTS_QUERY);
});
