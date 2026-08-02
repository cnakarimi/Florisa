import assert from "node:assert/strict";
import test from "node:test";

import { isProduct } from "./api/runtime.ts";
import {
  getProductImageUrl,
  resolveCatalogImageUrl,
} from "./utils/images.ts";

function plantPayload(coverImage) {
  return {
    id: 12,
    name: "Golden pothos",
    slug: "golden-pothos",
    product_type: "plant",
    product_type_display: "Plant",
    short_description: "",
    price: 450000,
    stock_quantity: 8,
    sale_unit: "pot",
    sale_unit_display: "Pot",
    unit_size: 1,
    minimum_order_quantity: 1,
    cover_image: coverImage,
    is_featured: false,
    is_in_stock: true,
    category: { id: 1, name: "Plants", slug: "plants" },
    details: { plant_type: "Pothos" },
  };
}

test("runtime product parser retains a raw plant image filename", () => {
  assert.equal(isProduct(plantPayload("golden-pothos.jpg")), true);
  assert.equal(isProduct(plantPayload(null)), true);
  assert.equal(isProduct(plantPayload({ filename: "golden-pothos.jpg" })), false);
});

test("product image filename resolves to the public product directory", () => {
  assert.equal(
    getProductImageUrl("golden-pothos.jpg"),
    "/images/products/golden-pothos.jpg",
  );
});

test("missing image values resolve to the CatalogImage fallback path", () => {
  assert.equal(getProductImageUrl(null), null);
  assert.equal(getProductImageUrl("   "), null);
  assert.equal(resolveCatalogImageUrl(null), null);
});
