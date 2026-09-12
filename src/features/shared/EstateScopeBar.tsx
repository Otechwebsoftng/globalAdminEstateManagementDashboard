import { Building2 } from "lucide-react";
import { FloatingSelect } from "../../components/ui/Select";
import type { EstateOption } from "../../hooks/useEstateScope";

/**
 * Estate picker for the global admin. Estate admins are pinned to their own
 * estate, so the bar renders as a read-only label instead.
 */
export default function EstateScopeBar({
  estates, estateId, onSelect, isPinned, currentName,
}: {
  estates: EstateOption[];
  estateId: string | null;
  onSelect: (id: string) => void;
  isPinned: boolean;
  currentName?: string | null;
}) {
  if (isPinned) {
    return (
      <div className="flex items-center gap-2 text-[11px] font-black text-slate-600 bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-fit">
        <Building2 className="h-3.5 w-3.5 text-blue-600" />
        {currentName ?? "Your estate"}
      </div>
    );
  }

  return (
    <div className="w-72">
      <FloatingSelect
        label="Estate"
        placeholder={estates.length ? "Select an estate..." : "No estates available"}
        value={estateId ?? ""}
        options={estates.map((e) => ({ value: e.id, label: e.name }))}
        onChange={onSelect}
        disabled={estates.length === 0}
      />
    </div>
  );
}
