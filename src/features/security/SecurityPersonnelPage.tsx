import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck, Search, Download, UserPlus, MoreVertical, Eye, Ban, RotateCcw, Filter,
} from "lucide-react";
import ActionMenu from "../../components/ActionMenu";
import { TableSkeleton } from "../../components/Skeleton";
import { FloatingSelect } from "../../components/ui/Select";
import Pagination from "../../components/ui/Pagination";
import Badge from "../../components/ui/Badge";
import MockBadge from "../../components/ui/MockBadge";
import OnboardSecurityPersonnelModal from "./OnboardSecurityPersonnelModal";
import { useToast } from "../../components/Toast";
import { queryClient } from "../../lib/queryClient";
import { securityApi, SECURITY_IS_MOCK } from "../../services/securityApi";
import { SHIFTS, shiftLabel, gateLabel, type SecurityPersonnel } from "../../types/security";
import type { CreateSecurityPersonnelDto } from "../../types/security";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: "All", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING", label: "Pending" },
  { value: "SUSPENDED", label: "Suspended" },
];
const SHIFT_OPTIONS = [
  { value: "All", label: "All shifts" },
  ...SHIFTS.map((s) => ({ value: s, label: shiftLabel(s) })),
];

const STAT_TONES = {
  slate: "bg-slate-50 text-slate-600",
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
} as const;
const CAPTION_TONES = {
  slate: "text-gray-400",
  blue: "text-blue-600",
  emerald: "text-emerald-600",
  amber: "text-amber-600",
} as const;

function StatCard({
  label, value, caption, tone,
}: { label: string; value: number | string; caption: string; tone: keyof typeof STAT_TONES }) {
  return (
    <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${STAT_TONES[tone]}`}>
          <ShieldCheck className="h-4 w-4" />
        </div>
        <span className="text-[11px] font-bold text-gray-500">{label}</span>
      </div>
      <span className="text-2xl font-black text-slate-950 block mt-3">{value}</span>
      <span className={`text-[10px] font-bold mt-1 block ${CAPTION_TONES[tone]}`}>{caption}</span>
    </div>
  );
}

export default function SecurityPersonnelPage({
  onView,
}: { onView?: (p: SecurityPersonnel) => void }) {
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [shift, setShift] = useState("All");
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);

  const params = useMemo(
    () => ({ page, pageSize: PAGE_SIZE, search, status, shift }),
    [page, search, status, shift],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["security", "list", params],
    queryFn: () => securityApi.list(params),
    retry: false, // mock-backed: a thrown error should surface, not retry 3x
  });

  const { data: stats } = useQuery({
    queryKey: ["security", "stats"],
    queryFn: () => securityApi.stats(),
    retry: false,
  });

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;

  const resetFilters = () => { setSearch(""); setStatus("All"); setShift("All"); setPage(1); };
  const onFilter = (fn: () => void) => { fn(); setPage(1); };

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["security"] });

  const handleOnboard = async (dto: CreateSecurityPersonnelDto) => {
    await securityApi.create(dto);
    invalidate();
    showToast("Invitation sent", "success");
  };

  const toggleSuspend = async (p: SecurityPersonnel) => {
    const next = p.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    try {
      await securityApi.setStatus(p.id, next);
      invalidate();
      showToast(next === "SUSPENDED" ? "Personnel suspended" : "Personnel restored", "success");
    } catch (err: any) {
      showToast(err?.message || "Could not update status");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-display">Security Personnel</h2>
            {SECURITY_IS_MOCK && <MockBadge />}
          </div>
          <p className="text-xs text-gray-400 font-bold tracking-tight">
            Monitor security personnel across estates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast("Export is not available yet — no reporting endpoint.")}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button
            onClick={() => setIsOnboardOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-lg shadow-blue-100 transition-all"
          >
            <UserPlus className="h-4 w-4" />
            Onboard Security Personnel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Guards" value={stats?.totalGuards ?? "--"} caption="Across all estates" tone="slate" />
        <StatCard label="Active Guards" value={stats?.activeGuards ?? "--"} caption="Currently enrolled" tone="blue" />
        <StatCard label="On Duty" value={stats?.onDuty ?? "--"} caption="On shift now" tone="emerald" />
        <StatCard label="Suspended" value={stats?.suspended ?? "--"} caption="Requires review" tone="amber" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">Security Personnel List</h3>
        </div>

        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row gap-3 lg:items-center bg-gray-50/40">
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search personnel..."
              value={search}
              onChange={(e) => onFilter(() => setSearch(e.target.value))}
              className="w-full text-xs pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white outline-none focus:border-blue-600 transition-colors"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-44">
              <FloatingSelect
                label="Status" value={status} options={STATUS_OPTIONS}
                onChange={(v) => onFilter(() => setStatus(v))}
              />
            </div>
            <div className="w-44">
              <FloatingSelect
                label="Shift" value={shift} options={SHIFT_OPTIONS}
                onChange={(v) => onFilter(() => setShift(v))}
              />
            </div>
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Filter className="h-3.5 w-3.5" />
              Clear All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-widest bg-slate-50/30">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Assigned Gate</th>
                <th className="py-4 px-6">Shift</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Last Activity</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={7}><TableSkeleton rows={6} cols={7} /></td></tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center font-bold text-gray-400">
                    No security personnel match your filters.
                  </td>
                </tr>
              ) : rows.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-gray-500">{p.reference}</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => onView?.(p)}
                      className="font-black text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      {p.firstName} {p.lastName}
                    </button>
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-700">{gateLabel(p.assignedGate)}</td>
                  <td className="py-4 px-6 font-bold text-slate-700">{shiftLabel(p.shift)}</td>
                  <td className="py-4 px-6"><Badge status={p.status} /></td>
                  <td className="py-4 px-6 font-bold text-gray-400">{p.lastActivity}</td>
                  <td className="py-4 px-6 text-right">
                    <ActionMenu trigger={<MoreVertical className="h-4 w-4 text-gray-300 hover:text-slate-900" />} width="w-44">
                      <button
                        onClick={() => onView?.(p)}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-[11px] font-black text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5 text-blue-600" />
                        View Details
                      </button>
                      <button
                        onClick={() => toggleSuspend(p)}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-[11px] font-black text-slate-700 hover:bg-slate-50"
                      >
                        {p.status === "SUSPENDED"
                          ? <><RotateCcw className="h-3.5 w-3.5 text-emerald-600" />Restore</>
                          : <><Ban className="h-3.5 w-3.5 text-amber-600" />Suspend</>}
                      </button>
                    </ActionMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={setPage}
          noun="Security Personnel"
        />
      </div>

      <OnboardSecurityPersonnelModal
        open={isOnboardOpen}
        onClose={() => setIsOnboardOpen(false)}
        onSubmit={handleOnboard}
      />
    </div>
  );
}
