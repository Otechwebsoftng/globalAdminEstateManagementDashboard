import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Home, CheckCircle2, KeyRound, DollarSign, Search, Download, PlusCircle,
  MoreVertical, Eye, Pencil, Trash2, Filter, RotateCcw,
} from "lucide-react";
import ActionMenu from "../../components/ActionMenu";
import { TableSkeleton } from "../../components/Skeleton";
import { FloatingSelect } from "../../components/ui/Select";
import Pagination from "../../components/ui/Pagination";
import Badge from "../../components/ui/Badge";
import MockBadge from "../../components/ui/MockBadge";
import AddPropertyWizard from "./AddPropertyWizard";
import TemporarilyDeleteModal from "./TemporarilyDeleteModal";
import { useToast } from "../../components/Toast";
import { useEstateScope } from "../../hooks/useEstateScope";
import EstateScopeBar from "../shared/EstateScopeBar";
import { queryClient } from "../../lib/queryClient";
import { useConfirm } from "../../components/ui/ConfirmDialog";
import { assetApi, ASSETS_IS_MOCK } from "../../services/assetApi";
import {
  PROPERTY_TYPES, propertyTypeLabel, availabilityLabel,
  type AssetKind, type CreatePropertyDto, type Property,
} from "../../types/asset";

const PAGE_SIZE = 10;

const COPY: Record<AssetKind, { title: string; subtitle: string; addLabel: string }> = {
  fixed: {
    title: "Fixed Assets",
    subtitle: "Manage fixed assets(Properties) across the estate.",
    addLabel: "Add Fixed Asset",
  },
  mobile: {
    title: "Mobile Assets",
    subtitle: "Manage vehicles and other movable assets across estates.",
    addLabel: "Add Mobile Asset",
  },
};

const TYPE_OPTIONS = [
  { value: "All", label: "All" },
  ...PROPERTY_TYPES.map((t) => ({ value: t, label: propertyTypeLabel(t) })),
];
const STATUS_OPTIONS = [
  { value: "All", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "REMOVED", label: "Removed" },
];
const AVAILABILITY_OPTIONS = [
  { value: "All", label: "All" },
  { value: "FOR_RENT", label: "For Rent" },
  { value: "FOR_SALE", label: "For Sale" },
  { value: "OCCUPIED", label: "Occupied" },
];

const STAT_TONES = {
  slate: { box: "bg-slate-50 text-slate-500", caption: "text-gray-400" },
  emerald: { box: "bg-emerald-50 text-emerald-600", caption: "text-gray-400" },
  blue: { box: "bg-blue-50 text-blue-600", caption: "text-blue-600" },
  green: { box: "bg-emerald-50 text-emerald-600", caption: "text-emerald-600" },
} as const;

function StatCard({
  icon: Icon, label, value, caption, tone,
}: {
  icon: typeof Home; label: string; value: number | string;
  caption: string; tone: keyof typeof STAT_TONES;
}) {
  const t = STAT_TONES[tone];
  return (
    <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${t.box}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[11px] font-bold text-gray-500">{label}</span>
      </div>
      <span className="text-2xl font-black text-slate-950 block mt-3">{value}</span>
      <span className={`text-[10px] font-bold mt-1 block ${t.caption}`}>{caption}</span>
    </div>
  );
}

export default function AssetsListPage({
  kind, onView,
}: { kind: AssetKind; onView?: (p: Property) => void }) {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const scope = useEstateScope();
  const estateId = scope.estateId ?? "";
  const copy = COPY[kind];

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("All");
  const [availability, setAvailability] = useState("All");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [removing, setRemoving] = useState<Property | null>(null);

  const params = useMemo(
    () => ({ kind, estateId, page, pageSize: PAGE_SIZE, search, type, status, availability }),
    [kind, estateId, page, search, type, status, availability],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["assets", "list", params],
    queryFn: () => assetApi.list(params),
    enabled: !!estateId,
    retry: false,
  });

  const { data: stats } = useQuery({
    queryKey: ["assets", "stats", kind, estateId],
    queryFn: () => assetApi.stats(kind, estateId),
    enabled: !!estateId,
    retry: false,
  });

  const rows = data?.items ?? [];
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["assets"] });
  const onFilter = (fn: () => void) => { fn(); setPage(1); };
  const clearAll = () => {
    setSearch(""); setType("All"); setStatus("All"); setAvailability("All"); setPage(1);
  };

  const handleAdd = async (dto: CreatePropertyDto) => {
    await assetApi.create(dto, estateId);
    invalidate();
    showToast("Property added", "success");
  };

  const handleRemove = async (reason: string) => {
    if (!removing) return;
    try {
      await assetApi.temporarilyRemove(removing.id, estateId, reason);
      invalidate();
      showToast("Property temporarily removed", "success");
      setRemoving(null);
    } catch (err: any) {
      showToast(err?.message || "Could not remove the property");
    }
  };

  const restore = async (p: Property) => {
    try {
      await assetApi.restore(p.id, estateId);
      invalidate();
      showToast("Property restored", "success");
    } catch (err: any) {
      showToast(err?.message || "Could not restore the property");
    }
  };

  const destroy = async (p: Property) => {
    const ok = await confirm({
      title: "Delete this property permanently?",
      description: `${p.propertyName} will be removed for good. This cannot be undone.`,
      confirmLabel: "Delete", tone: "danger",
    });
    if (!ok) return;
    try {
      await assetApi.remove(p.id, estateId);
      invalidate();
      showToast("Property deleted", "success");
    } catch (err: any) {
      showToast(err?.message || "Could not delete the property");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-display">{copy.title}</h2>
            {ASSETS_IS_MOCK && <MockBadge />}
          </div>
          <p className="text-xs text-gray-400 font-bold tracking-tight">{copy.subtitle}</p>
          <div className="mt-3">
            <EstateScopeBar
              estates={scope.estates} estateId={scope.estateId}
              onSelect={scope.select} isPinned={scope.isPinned}
              currentName={scope.current?.name}
            />
          </div>
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
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-lg shadow-blue-100 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            {copy.addLabel}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Home} label={`Total ${copy.title}`} value={stats?.total ?? "--"} caption="Across the estate" tone="slate" />
        <StatCard icon={CheckCircle2} label="Active" value={stats?.active ?? "--"} caption="Currently active" tone="emerald" />
        <StatCard icon={KeyRound} label="For Rent" value={stats?.forRent ?? "--"} caption="Available for rental" tone="blue" />
        <StatCard icon={DollarSign} label="For Sale" value={stats?.forSale ?? "--"} caption="Available for purchase" tone="green" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <h3 className="text-sm font-black text-slate-900">Property List</h3>
        </div>

        <div className="px-6 pb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Properties..."
              value={search}
              onChange={(e) => onFilter(() => setSearch(e.target.value))}
              className="w-full sm:w-80 text-xs pl-9 pr-3 py-2.5 border border-gray-100 rounded-xl bg-slate-50/60 outline-none focus:border-blue-600 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-44">
              <FloatingSelect label="Property type" value={type} options={TYPE_OPTIONS}
                onChange={(v) => onFilter(() => setType(v))} />
            </div>
            <div className="w-40">
              <FloatingSelect label="Status" value={status} options={STATUS_OPTIONS}
                onChange={(v) => onFilter(() => setStatus(v))} />
            </div>
            <div className="w-44">
              <FloatingSelect label="Availability" value={availability} options={AVAILABILITY_OPTIONS}
                onChange={(v) => onFilter(() => setAvailability(v))} />
            </div>
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors"
            >
              <Filter className="h-3.5 w-3.5" />
              Clear All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-y border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-widest bg-slate-50/30">
                <th className="py-4 px-6">Property Name</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Address</th>
                <th className="py-4 px-6 text-center">House No</th>
                <th className="py-4 px-6 text-center">Floor No</th>
                <th className="py-4 px-6 text-center">Rooms</th>
                <th className="py-4 px-6">Availability</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!estateId ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center font-bold text-gray-400">
                    Select an estate to see its properties.
                  </td>
                </tr>
              ) : isLoading ? (
                <tr><td colSpan={9}><TableSkeleton rows={6} cols={9} /></td></tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center font-bold text-gray-400">
                    No properties match your filters.
                  </td>
                </tr>
              ) : rows.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <button onClick={() => onView?.(p)} className="font-black text-slate-900 hover:text-blue-600 transition-colors">
                      {p.propertyName}
                    </button>
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-700">{propertyTypeLabel(p.propertyType)}</td>
                  <td className="py-4 px-6 font-bold text-slate-700">{p.address}</td>
                  <td className="py-4 px-6 text-center font-bold text-slate-700">{p.houseNumber}</td>
                  <td className="py-4 px-6 text-center font-bold text-slate-700">{p.floorNumber}</td>
                  <td className="py-4 px-6 text-center font-bold text-slate-700">{p.noOfRooms}</td>
                  <td className={`py-4 px-6 font-bold ${p.availability === "NONE" ? "text-gray-300" : p.availability === "OCCUPIED" ? "text-gray-400" : "text-slate-700"}`}>
                    {availabilityLabel(p.availability)}
                  </td>
                  <td className="py-4 px-6">
                    <Badge status={p.status === "REMOVED" ? "REVOKED" : "ACTIVE"}>
                      {p.status === "REMOVED" ? "Removed" : "Active"}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <ActionMenu trigger={<MoreVertical className="h-4 w-4 text-gray-300 hover:text-slate-900" />} width="w-48">
                      <button onClick={() => onView?.(p)} className="w-full flex items-center gap-2.5 px-4 py-2 text-[11px] font-black text-slate-700 hover:bg-slate-50">
                        <Eye className="h-3.5 w-3.5 text-slate-500" />
                        View Property
                      </button>
                      <button onClick={() => onView?.(p)} className="w-full flex items-center gap-2.5 px-4 py-2 text-[11px] font-black text-slate-700 hover:bg-slate-50">
                        <Pencil className="h-3.5 w-3.5 text-slate-500" />
                        Edit Property
                      </button>
                      {p.status === "REMOVED" ? (
                        <button onClick={() => restore(p)} className="w-full flex items-center gap-2.5 px-4 py-2 text-[11px] font-black text-emerald-700 hover:bg-emerald-50">
                          <RotateCcw className="h-3.5 w-3.5" />
                          Restore Property
                        </button>
                      ) : (
                        <button onClick={() => setRemoving(p)} className="w-full flex items-center gap-2.5 px-4 py-2 text-[11px] font-black text-amber-700 hover:bg-amber-50">
                          <Trash2 className="h-3.5 w-3.5" />
                          Temporarily Remove
                        </button>
                      )}
                      <button onClick={() => destroy(p)} className="w-full flex items-center gap-2.5 px-4 py-2 text-[11px] font-black text-rose-600 hover:bg-rose-50">
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Permanently
                      </button>
                    </ActionMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page} pageSize={PAGE_SIZE} total={data?.total ?? 0}
          onPageChange={setPage} noun={copy.title}
        />
      </div>

      <AddPropertyWizard
        kind={kind}
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAdd}
      />

      <TemporarilyDeleteModal
        open={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={handleRemove}
      />
    </div>
  );
}
