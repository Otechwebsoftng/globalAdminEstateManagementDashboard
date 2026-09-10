/**
 * Extracts an array from a backend response whose envelope shape varies.
 *
 * Responses come back as any of `{ data: [] }`, `{ estates: [] }`,
 * `{ data: { admins: [] } }`, or a bare array, so this walks the likely paths
 * rather than assuming a `{ success, data }` wrapper. Pass the domain keys you
 * expect (e.g. "estates", "residents", "result") in priority order.
 */
export function parseList<T = any>(res: any, ...keys: string[]): T[] {
  if (!res) return [];

  for (const key of keys) {
    if (Array.isArray(res?.[key])) return res[key];
  }

  if (Array.isArray(res?.data)) return res.data;

  if (res?.data && typeof res.data === "object" && !Array.isArray(res.data)) {
    for (const key of keys) {
      if (Array.isArray(res.data?.[key])) return res.data[key];
    }
    // Last resort: any array nested one level inside `data`.
    for (const innerKey of Object.keys(res.data)) {
      if (Array.isArray(res.data[innerKey])) return res.data[innerKey];
    }
  }

  if (Array.isArray(res)) return res;
  return [];
}
