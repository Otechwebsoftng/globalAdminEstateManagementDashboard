import assert from "node:assert/strict";
import { normalizeOtpText } from "./otp";

assert.equal(normalizeOtpText("AbC123"), "AbC123");
assert.equal(normalizeOtpText(" A B C 1 2 3 "), "ABC123");
assert.equal(normalizeOtpText("code: ABC-123", 12), "code:ABC-123");
assert.equal(normalizeOtpText("ABCDEFGHI", 6), "ABCDEF");

console.log("OTP text normalization checks passed.");
