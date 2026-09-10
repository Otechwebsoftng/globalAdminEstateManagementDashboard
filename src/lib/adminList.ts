import { parseList } from "./parseList";

const ADMIN_STATUSES = ["active", "inactive", "suspended", "flagged"];

interface AdminListApi {
  list(params?: { status?: string }): Promise<any>;
}

/**
 * Fan out one list call per user status and merge, deduplicating by id.
 *
 * `GET /global-admin` and `GET /estate-admin` accept an optional `userStatus`
 * filter, and without it the backend may return only `active` users — so a
 * newly onboarded admin who hasn't verified their OTP is invisible.
 *
 * Downsides, which are why this is not the default everywhere:
 *  - `Promise.allSettled` silently swallows a rejected status call.
 *  - Each call is capped at pageSize=500; anything beyond that is dropped.
 *  - 4x the network cost, which hurts on Render cold starts.
 */
export async function fetchAdminsByStatus(api: AdminListApi, keys: string[]): Promise<any[]> {
  const results = await Promise.allSettled(
    ADMIN_STATUSES.map((status) => api.list({ status }))
  );

  const seen = new Map<string, any>();
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const item of parseList(result.value, ...keys)) {
      if (item?.id && !seen.has(item.id)) seen.set(item.id, item);
    }
  }
  return Array.from(seen.values());
}

/**
 * Preferred strategy: one unfiltered call, falling back to the per-status fan-out
 * only when it comes back empty. Cheaper and lossless when the backend honours
 * an unfiltered list, while still surfacing non-active admins when it doesn't.
 */
export async function fetchAllAdmins(api: AdminListApi, keys: string[]): Promise<any[]> {
  const res = await api.list();
  const items = parseList(res, ...keys);
  if (items.length > 0) return items;
  return fetchAdminsByStatus(api, keys);
}
