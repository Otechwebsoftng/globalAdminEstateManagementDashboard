/**
 * Central react-query key factory.
 *
 * Key strings match what the dashboards used before they were hoisted here, so
 * cache behaviour is unchanged. Pages and mutations must agree on these — an
 * invalidate that misses is the usual cause of a stale list after a write.
 */
export const qk = {
  dashboard: () => ["dashboard"] as const,
  estates: () => ["estates"] as const,
  estate: (id: string) => ["estate", id] as const,
  estateResidents: (estateId?: string) => ["estateResidents", estateId] as const,
  estateAdmins: (estateId?: string) => ["estateAdmins", estateId] as const,
  admins: () => ["admins"] as const,
  roles: () => ["roles"] as const,
  menu: () => ["menu"] as const,
  permissions: () => ["permissions"] as const,
} as const;
