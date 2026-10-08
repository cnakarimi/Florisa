import assert from "node:assert/strict";
import test from "node:test";
import { getPlantPurchase, getPlantSpecificationGroups } from "./plant-detail.ts";

test("pot quantity respects minimum and stock and calculates the full price", () => {
  assert.deepEqual(getPlantPurchase(1, 3, 7, true, 250000), { minimumQuantity: 3, availableStock: 7, canBuy: true, quantity: 3, total: 750000 });
  assert.equal(getPlantPurchase(99, 3, 7, true, 250000).total, 1750000);
  assert.equal(getPlantPurchase(4, 3, 7, true, 250000).quantity, 4);
});
test("stock below the minimum and explicitly unavailable plants cannot be bought", () => {
  assert.equal(getPlantPurchase(3, 3, 2, true, 100).canBuy, false);
  assert.equal(getPlantPurchase(1, 1, 20, false, 100).canBuy, false);
  assert.equal(getPlantPurchase(1, 1, 0, true, 100).canBuy, false);
});
test("missing optional specifications are omitted while false and zero remain real values", () => {
  const details = { plant_type: "", approximate_height_cm: null, plant_size_display: "", care_difficulty_display: "", color: "", quality_grade_display: "", pet_friendly: false, pot_included: true, pot_size_cm: 0, pot_material: "", pot_color: "", has_drainage: false, shipping_notes: "" };
  const groups = getPlantSpecificationGroups(details);
  assert.equal(groups.length, 2);
  assert.deepEqual(groups[0].rows, [{ label: "سازگار با حیوانات خانگی", value: false }]);
  assert.equal(groups[1].rows.length, 3);
  assert.equal(groups[1].rows[1].value, "0 سانتی‌متر");
});
