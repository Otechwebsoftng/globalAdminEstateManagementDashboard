import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users, UserCheck, Clock, Search, MoreVertical, Eye, Ban, Filter, Pencil,
} from "lucide-react";
import ActionMenu from "../../components/ActionMenu";
import { TableSkeleton } from "../../components/Skeleton";
import { FloatingSelect } from "../../components/ui/Select";
import Pagination from "../../components/ui/Pagination";
import Badge from "../../components/ui/Badge";
import EstateScopeBar from "../shared/EstateScopeBar";
import EditResidentModal from "./EditResidentModal";
import { useEstateScope } from "../../hooks/useEstateScope";
import { useToast } from "../../components/Toast";
import { residentApi } from "../../services/api";
import { queryClient } from "../../lib/queryClient";
import { parseList } from "../../lib/parseList";
import { getResidentName, getResidentPhone, getResidentJoinedDate } from "../../lib/format";
import type { Resident } from "../../types/api";

const PAGE_SIZE = 10;
const STATUS_OPTIONS = [
  { value: "All", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

function Stat({ icon: Icon, label, value, tone }: {
  icon: typeof Users; label: string; value: number | string; tone: string;
}) {
  return (
    <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[11px] font-bold text-gray-500">{label}</span>
      </div>
      <span className="text-2xl font-black text-slate-950 block mt-3">{value}</span>
    </div>
  );
}

export default function ResidentsPage({
  onView,
}: { onView?: (r: Resident) => void }) {
  const { showToast } = useToast();
  const scope = useEstateScope();
  const estateId = scope.estateId ?? "";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [editing, setEditing] = useState<Resident | null>(null);

  const params = useMemo(
    () => ({ page, pageSize: PAGE_SIZE, search, status }),
    [page, search, status],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["residents", estateId, params],
    queryFn: () => residentApi.list(estateId, params),
    enabled: !!estateId,
    retry: false,
  });

  const rows: Resident[] = useMemo(
    () => parseList(data, "residents", "users", "result", "data"),
    [data],
  );
  const meta = (data as any)?.meta ?? (data as any)?.data?.meta ?? {};
  const total = meta.total ?? meta.totalItems ?? rows.length;

  const onFilter = (fn: () => void) => { fn(); setPage(1); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-display">Residents</h2>
          <p className="text-xs text-gray-400 font-bold tracking-tight">
            Residents registered across the estate
          </p>
          <div className="mt-3">
            <EstateScopeBar
              estates={scope.estates} estateId={scope.estateId}
              onSelect={scope.select} isPinned={scope.isPinned}
              currentName={scope.current?.name}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat icon={Users} label="Total Residents" value={estateId ? total : "--"} tone="bg-blue-50 text-blue-600" />
        <Stat
          icon={UserCheck} label="Active"
          value={estateId ? rows.filter((r) => String(r.status).toLowerCase() === "active").length : "--"}
          tone="bg-emerald-50 text-emerald-600"
        />
        <Stat icon={Clock} label="On This Page" value={estateId ? rows.length : "--"} tone="bg-slate-50 text-slate-500" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">Residents List</h3>
        </div>

        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row gap-3 lg:items-center bg-gray-50/40">
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text" placeholder="Search residents..."
              value={search}
              onChange={(e) => onFilter(() => setSearch(e.target.value))}
              className="w-full text-xs pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white outline-none focus:border-blue-600 transition-colors"
            />
          </div>
          <div className="w-44">
            <FloatingSelect
              label="Status" value={status} options={STATUS_OPTIONS}
              onChange={(v) => onFilter(() => setStatus(v))}
            />
          </div>
          <button
            onClick={() => { setSearch(""); setStatus("All"); setPage(1); }}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <Filter className="h-3.5 w-3.5" />
            Clear All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-widest bg-slate-50/30">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Phone</th>
                <th className="py-4 px-6">House No</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Joined</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!estateId ? (
                <tr><td colSpan={7} className="py-12 text-center font-bold text-gray-400">
                  Select an estate to see its residents.
                </td></tr>
              ) : isLoading ? (
                <tr><td colSpan={7}><TableSkeleton rows={6} cols={7} /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center font-bold text-gray-400">
                  No residents match your filters.
                </td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <button
                      onClick={() => onView?.(r)}
                      className="font-black text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      {getResidentName(r) || "--"}
                    </button>
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-500">{r.email || "--"}</td>
                  <td className="py-4 px-6 font-bold text-gray-500">{getResidentPhone(r) || "--"}</td>
                  <td className="py-4 px-6 font-bold text-slate-700">{r.houseNo || "--"}</td>
                  <td className="py-4 px-6"><Badge status={String(r.status || "active").toUpperCase()} /></td>
                  <td className="py-4 px-6 font-bold text-gray-400">{getResidentJoinedDate(r) || "--"}</td>
                  <td className="py-4 px-6 text-right">
                    <ActionMenu trigger={<MoreVertical className="h-4 w-4 text-gray-300 hover:text-slate-900" />} width="w-48">
                      <button
                        onClick={() => onView?.(r)}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-[11px] font-black text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5 text-blue-600" />
                        View Resident
                      </button>
                      <button
                        onClick={() => setEditing(r)}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-[11px] font-black text-slate-700 hover:bg-slate-50"
                      >
                        <Pencil className="h-3.5 w-3.5 text-slate-500" />
                        Edit Resident
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await residentApi.removeAssignment(r.id, estateId);
                            queryClient.invalidateQueries({ queryKey: ["residents", estateId] });
                            showToast("Assignment removed", "success");
                          } catch (err: any) {
                            showToast(err?.message || "Could not remove the assignment");
                          }
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-[11px] font-black text-amber-700 hover:bg-amber-50"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        Remove Assignment
                      </button>
                    </ActionMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page} pageSize={PAGE_SIZE} total={total}
          onPageChange={setPage} noun="Residents"
        />
      </div>

      <EditResidentModal
        resident={editing}
        estateId={estateId}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}
