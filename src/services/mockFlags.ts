/**
 * Master switch for the mock service seam.
 *
 * Defaults to ON because most modules (security, staff, properties, visitors)
 * have no backend endpoints yet — without mocks a fresh checkout is blank.
 * Set VITE_USE_MOCKS=false to force every resolver onto the real client.
 */
export const USE_MOCKS = (import.meta.env.VITE_USE_MOCKS ?? "true") !== "false";
