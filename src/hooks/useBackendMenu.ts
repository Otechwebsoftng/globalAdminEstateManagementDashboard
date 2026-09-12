import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Building2, Users, HardHat, ShieldCheck, LayoutDashboard, CreditCard, Receipt,
  LifeBuoy, FileText, Settings as SettingsIcon, Car, KeyRound, type LucideIcon,
} from "lucide-react";
import { menuApi } from "../services/api";
import { parseList } from "../lib/parseList";
import { qk } from "../lib/queryKeys";
import type { MenuItem } from "../types/api";

export interface NavNode {
  key: string;
  label: string;
  path: string;
  icon: LucideIcon;
  order: number;
  children: NavNode[];
}

/**
 * Resolves the backend's free-text `icon` onto a lucide component. Matching is
 * loose because the field is not an enum — unknown icons fall back rather than
 * breaking the nav.
 */
const ICONS: Array<[RegExp, LucideIcon]> = [
  [/dash|home|overview/i, LayoutDashboard],
  [/estate|building|propert/i, Building2],
  [/resident|user|people/i, Users],
  [/staff|worker|domestic/i, HardHat],
  [/security|shield|guard/i, ShieldCheck],
  [/asset|vehicle|car|mobile/i, Car],
  [/plan|subscription|card/i, CreditCard],
  [/billing|revenue|invoice|receipt/i, Receipt],
  [/ticket|support|help/i, LifeBuoy],
  [/log|audit|file/i, FileText],
  [/setting|config|gear/i, SettingsIcon],
  [/role|permission|key/i, KeyRound],
];

export function resolveIcon(name?: string, label?: string): LucideIcon {
  const hay = `${name ?? ""} ${label ?? ""}`;
  for (const [re, icon] of ICONS) if (re.test(hay)) return icon;
  return LayoutDashboard;
}

/** Normalises a backend URL onto an in-app route. */
function toPath(url?: string): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return "";
  return url.startsWith("/") ? url : `/${url}`;
}

function toNode(m: MenuItem): NavNode {
  return {
    key: m.id ?? m.name,
    label: m.name,
    path: toPath(m.url),
    icon: resolveIcon(m.icon, m.name),
    order: typeof m.order === "number" ? m.order : 0,
    children: (m.children ?? []).map(toNode).sort((a, b) => a.order - b.order),
  };
}

/**
 * The backend returns the menu filtered by the caller's permissions
 * (`GET /menu`), so it is the authority on what a user may see. Callers should
 * fall back to their static nav when `items` is empty — the endpoint can return
 * nothing if no menu rows have been seeded.
 */
export function useBackendMenu() {
  const { data, isLoading, isError } = useQuery({
    queryKey: qk.menu(),
    queryFn: () => menuApi.list(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const items = useMemo(() => {
    const rows = parseList<MenuItem>(data, "menus", "menu", "result", "data");
    // Build the tree ourselves if the API returns a flat list with parentId.
    const byId = new Map(rows.map((r) => [r.id, { ...r, children: [...(r.children ?? [])] }]));
    const roots: MenuItem[] = [];
    for (const row of byId.values()) {
      if (row.parentId && byId.has(row.parentId)) byId.get(row.parentId)!.children!.push(row);
      else roots.push(row);
    }
    return roots.map(toNode).sort((a, b) => a.order - b.order);
  }, [data]);

  return { items, isLoading, isError, hasMenu: items.length > 0 };
}
