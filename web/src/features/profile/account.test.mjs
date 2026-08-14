import assert from "node:assert/strict";
import test from "node:test";

import { isUserResponse } from "../auth/api/runtime.ts";
import { sanitizeNextPath, withNext } from "../auth/utils/redirect.ts";
import { mapProfileUpdatePayload, validateProfileForm } from "./logic.ts";

test("current-user responses are parsed and malformed data is rejected", () => {
  assert.equal(isUserResponse({ user: { id: 1, phone: "09123456789", full_name: "سینا", email: null, is_profile_complete: true } }), true);
  assert.equal(isUserResponse({ user: { id: 1, is_staff: true } }), false);
});

test("profile update mapping trims allowed fields and never sends phone", () => {
  const payload = mapProfileUpdatePayload({ fullName: "  سینا رضایی  ", email: "  " });
  assert.deepEqual(payload, { full_name: "سینا رضایی", email: "" });
  assert.equal("phone" in payload, false);
  assert.deepEqual(validateProfileForm({ fullName: " ", email: "invalid" }), {
    full_name: "نام و نام خانوادگی را وارد کنید.",
    email: "یک ایمیل معتبر وارد کنید.",
  });
});

test("account return paths reject external and protocol-relative redirects", () => {
  assert.equal(sanitizeNextPath("/profile/addresses?edit=1"), "/profile/addresses?edit=1");
  assert.equal(sanitizeNextPath("//evil.example"), "/");
  assert.equal(sanitizeNextPath("https://evil.example"), "/");
  assert.equal(withNext("/auth", "/profile/edit"), "/auth?next=%2Fprofile%2Fedit");
});
