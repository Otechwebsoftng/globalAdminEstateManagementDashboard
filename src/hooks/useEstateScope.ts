import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { estateApi } from "../services/api";
import { parseList } from "../lib/parseList";
import { qk } from "../lib/queryKeys";
import { useAuth } from "../context/AuthContext";

const STORAGE_KEY = "global_estates_scope";

export interface EstateOption {
  id: string;
  name: string;
}

/**
 * Security personnel, residents and assets are all estate-scoped on the backend
 * (`/security-personnel/estate/{estateId}`), but the global admin's tree has no
 * single estate. This resolves one:
 *  - estate admins are pinned to their own `user.estateId`
 *  - global admins pick one, and the choice is remembered
 */
export function useEstateScope() {
  const { user } = useAuth();
  const isEstateAdmin = user?.persona === "ESTATE_ADMIN";
  const pinnedId = isEstateAdmin ? user?.estateId ?? null : null;

  const [chosenId, setChosenId] = useState<string | null>(() => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  });

  const { data: raw, isLoading } = useQuery({
    queryKey: qk.estates(),
    queryFn: () => estateApi.list({ pageSize: 200 }),
    enabled: !isEstateAdmin,
  });

  const estates: EstateOption[] = useMemo(() => {
    const rows = parseList(raw, "estates", "result", "data");
    return rows
      .map((e: any) => ({ id: e?.id ?? e?._id ?? "", name: e?.estateName ?? e?.name ?? "Untitled estate" }))
      .filter((e: EstateOption) => e.id);
  }, [raw]);

  // Fall back to the first estate so the page isn't blank on a fresh session.
  useEffect(() => {
    if (isEstateAdmin || chosenId || estates.length === 0) return;
    setChosenId(estates[0].id);
  }, [isEstateAdmin, chosenId, estates]);

  const select = useCallback((id: string) => {
    setChosenId(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch { /* storage blocked */ }
  }, []);

  const estateId = pinnedId ?? chosenId;
  const current = estates.find((e) => e.id === estateId) ?? null;

  return { estateId, estates, current, select, isLoading, isPinned: isEstateAdmin };
}
