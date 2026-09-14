/**
 * Master switch for the mock service seam.
 *
 * Defaults to the real API. Set VITE_USE_MOCKS=true only when intentionally
 * developing without the backend.
 */
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";
