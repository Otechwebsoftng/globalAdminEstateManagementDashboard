export type EntityStatus = "ACTIVE" | "PENDING" | "SUSPENDED" | "INACTIVE";

export const statusLabel = (s: EntityStatus) =>
  ({ ACTIVE: "Active", PENDING: "Pending", SUSPENDED: "Suspended", INACTIVE: "Inactive" }[s]);

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  estateId?: string;
  shift?: string;
}

/** Shared by every board's activity/duty/access log table. */
export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actor?: string;
  meta?: string;
}
