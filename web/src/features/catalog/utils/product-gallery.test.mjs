import test from "node:test";
import assert from "node:assert/strict";
import { buildProductGallery, galleryIndex } from "./product-gallery.ts";

const basic = { id: null, name: "plastic", is_baseline: true, configuration_image: "nursery.webp" };
const paid = { id: 1, name: "ceramic", is_baseline: false, configuration_image: "/media/combination.webp" };
const product = { name: "Plant", product_type: "plant", cover_image: "nursery.webp", images: [], pot_options: [basic, paid] };

test("one original image produces exactly one slide", () => {
  assert.equal(buildProductGallery(product, basic).length, 1);
});
test("decorative to baseline to decorative uses the selected configuration first", () => {
  assert.equal(buildProductGallery(product, paid)[0].src, paid.configuration_image);
  assert.equal(buildProductGallery(product, basic)[0].src, "/images/products/nursery.webp");
  assert.equal(buildProductGallery(product, paid)[0].src, paid.configuration_image);
});
test("absolute and relative media paths do not create duplicate slides", () => {
  const slides = buildProductGallery({ ...product, cover_image: "http://127.0.0.1:8000/media/combination.webp", images: [{ id: 2, image: paid.configuration_image }] }, paid);
  assert.equal(slides.length, 1);
  assert.equal(slides[0].isConfiguration, true);
});
test("repository filenames and resolved paths are deduplicated", () => {
  assert.equal(buildProductGallery({ ...product, images: [{ id: 2, image: "/images/products/nursery.webp" }] }, basic).length, 1);
});
test("baseline wins over a decorative general cover and never uses the empty pot image", () => {
  const option = { ...basic, image: "/media/empty-pot.webp" };
  const slides = buildProductGallery({ ...product, cover_image: paid.configuration_image }, option);
  assert.deepEqual(slides.map(slide => slide.src), ["/images/products/nursery.webp"]);
});
test("multiple originals remain navigable and active indices are bounded", () => {
  assert.equal(buildProductGallery({ ...product, images: [{ id: 2, image: "detail.webp" }] }, paid).length, 3);
  assert.equal(galleryIndex(7, 1), 0);
  assert.equal(galleryIndex(-1, 3), 0);
  assert.equal(galleryIndex(1, 3), 1);
});

test("different hosts and different query variants remain distinct images", () => {
  const selected = { ...paid, configuration_image: "https://one.example/media/photo.webp" };
  const slides = buildProductGallery({ ...product, pot_options: [basic, selected], cover_image: "https://two.example/media/photo.webp", images: [{ id: 3, image: "https://one.example/media/photo.webp?variant=2" }] }, selected);
  assert.equal(slides.length, 3);
});

test("other saved pot configurations are not generic gallery slides", () => {
  const black = { ...paid, id: 2, configuration_image: "/media/black.webp" };
  const slides = buildProductGallery({ ...product, cover_image: black.configuration_image, pot_options: [basic, paid, black] }, paid);
  assert.deepEqual(slides.map(slide => slide.src), [paid.configuration_image]);
});
