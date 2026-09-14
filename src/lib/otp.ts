/**
 * Normalizes a text OTP without discarding letters or symbols. Whitespace is
 * removed because mail clients commonly wrap or separate copied codes.
 */
export function normalizeOtpText(raw: string, maxLength = 6): string {
  return raw.replace(/\s/g, "").slice(0, maxLength);
}
