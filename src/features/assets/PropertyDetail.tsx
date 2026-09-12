import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, ChevronRight, Pencil, Trash2, MapPin, Phone, CalendarDays,
  Info, Home, Layers, User, ExternalLink, DoorOpen,
} from "lucide-react";
import { useState } from "react";
import ActionMenu from "../../components/ActionMenu";
import Badge from "../../components/ui/Badge";
import MockBadge from "../../components/ui/MockBadge";
import { CardSkeleton } from "../../components/Skeleton";
import TemporarilyDeleteModal from "./TemporarilyDeleteModal";
import { useToast } from "../../components/Toast";
import { queryClient } from "../../lib/queryClient";
import { assetApi, ASSETS_IS_MOCK } from "../../services/assetApi";
import { availabilityLabel, propertyTypeLabel, type AssetKind } from "../../types/asset";

function Row({
  label, value, pill, pillTone = "blue",
}: { label: string; value: React.ReactNode; pill?: boolean; pillTone?: "blue" | "slate" }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3.5 border-b border-gray-50 last:border-0">
      <span className="text-[11px] font-bold text-gray-400">{label}</span>
      {pill ? (
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${
          pillTone === "slate"
            ? "text-slate-500 bg-slate-100 border-slate-200"
            : "text-blue-600 bg-blue-50 border-blue-100"
        }`}>{value}</span>
      ) : (
        <span className="text-xs font-black text-slate-900">{value}</span>
      )}
    </div>
  );
}

export default function PropertyDetail({
  propertyId, estateId, kind, onBack,
}: { propertyId: string; estateId: string; kind: AssetKind; onBack: () => void }) {
  const { showToast } = useToast();
  const [isRemoving, setIsRemoving] = useState(false);

  const { data: p, isLoading } = useQuery({
    queryKey: ["assets", "detail", propertyId, estateId],
    queryFn: () => assetApi.getById(propertyId, estateId),
    retry: false,
  });

  if (isLoading) return <CardSkeleton />;
  if (!p) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center space-y-3">
        <p className="text-sm font-black text-slate-900">Property not found.</p>
        <button onClick={onBack} className="text-xs font-black text-blue-600 hover:underline">Back</button>
      </div>
    );
  }

  const handleRemove = async (reason: string) => {
    await assetApi.temporarilyRemove(p.id, estateId, reason);
    queryClient.invalidateQueries({ queryKey: ["assets"] });
    showToast("Property temporarily removed", "success");
  };

  const listLabel = kind === "fixed" ? "Fixed Assets" : "Mobile Assets";
  const initials = (p.propertyName || "").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="h-10 w-10 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{listLabel}</span>
              <ChevronRight className="h-3 w-3 text-gray-300" />
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">View Property</span>
            </div>
            <div className="flex items-center gap-2.5 mt-0.5">
              <h2 className="text-2xl font-black text-slate-900">Property Details</h2>
              {ASSETS_IS_MOCK && <MockBadge />}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Edit opens the same three sections the Add Property wizard uses. */}
          <ActionMenu
            trigger={
              <span className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-slate-700 hover:text-slate-900 cursor-pointer">
                <Pencil className="h-3.5 w-3.5" />
                Edit Property
              </span>
            }
            width="w-60"
          >
            {["Edit Property Details", "Edit Property Location", "Edit Property Contact & Availability"].map((label) => (
              <button
                key={label}
                onClick={() => showToast("Editing is not wired yet.")}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-[11px] font-black text-slate-700 hover:bg-slate-50"
              >
                <Pencil className="h-3.5 w-3.5 text-slate-400" />
                {label}
              </button>
            ))}
          </ActionMenu>

          <button
            onClick={() => setIsRemoving(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-100 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Temporarily Remove
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 space-y-5">
          {/* Gallery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative bg-blue-50 rounded-2xl border border-blue-100 min-h-[190px] flex items-center justify-center overflow-hidden">
              {p.images[0]
                ? <img src={p.images[0].url} alt="" className="h-full w-full object-cover absolute inset-0" />
                : <span className="text-5xl font-black text-blue-400">{initials}</span>}
              <div className="absolute left-4 bottom-4 space-y-2">
                <Badge status={p.status === "REMOVED" ? "REVOKED" : "ACTIVE"}>
                  {p.status === "REMOVED" ? "Removed" : "Active"}
                </Badge>
                <p className="text-xs font-bold text-slate-800">
                  {p.propertyName.toUpperCase()} <span className="text-gray-400">•</span>{" "}
                  <span className="text-blue-600">{availabilityLabel(p.availability)}</span>
                </p>
              </div>
            </div>
            <div className="grid grid-rows-2 gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-blue-50 rounded-2xl border border-blue-100 min-h-[89px] flex items-center justify-center overflow-hidden">
                  {p.images[i]
                    ? <img src={p.images[i].url} alt="" className="h-full w-full object-cover" />
                    : <span className="text-2xl font-black text-blue-300">{initials}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Location / contact / created strip */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <MapPin className="h-3.5 w-3.5 text-blue-600" /> Location
              </span>
              <p className="text-xs font-bold text-slate-800 mt-2 leading-relaxed">
                {p.houseNumber}, {p.address}, {p.city},<br />{p.state}, NG
              </p>
            </div>
            <div>
              <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <Phone className="h-3.5 w-3.5 text-blue-600" /> Contact
              </span>
              <p className="text-xs font-bold text-slate-800 mt-2 leading-relaxed break-all">
                ({p.contactCountryCode}){p.contactPhone}<br />{p.contactEmail}
              </p>
            </div>
            <div>
              <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <CalendarDays className="h-3.5 w-3.5 text-blue-600" /> Created
              </span>
              <p className="text-xs font-bold text-slate-800 mt-2">{p.createdAt}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <span className="flex items-center gap-1.5 text-[11px] font-black text-slate-700">
              <Info className="h-3.5 w-3.5 text-blue-600" /> Description
            </span>
            <p className="text-xs text-gray-500 leading-relaxed mt-2.5">{p.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <DoorOpen className="h-4 w-4" />
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[11px] font-bold text-gray-400">Number of Rooms</span>
                <span className="text-lg font-black text-slate-900 leading-none">{p.noOfRooms}</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Layers className="h-4 w-4" />
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[11px] font-bold text-gray-400">Number of Floors</span>
                <span className="text-lg font-black text-slate-900 leading-none">{p.totalNoOfFloors}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 mb-3">Recent Activities</h3>
            <div className="space-y-2.5">
              {p.activities.map((a) => (
                <div key={a.id} className="flex items-center gap-6 text-xs">
                  <span className="font-bold text-gray-400 w-28 shrink-0">{a.date}</span>
                  <span className="font-bold text-slate-800">{a.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-black text-slate-900">Property Overview</h3>
              <Home className="h-4 w-4 text-gray-300" />
            </div>
            <Row
              label="Availability"
              value={availabilityLabel(p.availability)}
              pill
              pillTone={p.availability === "FOR_RENT" || p.availability === "FOR_SALE" ? "blue" : "slate"}
            />
            <Row label="Property Type" value={propertyTypeLabel(p.propertyType)} />
            <Row label="Property No" value={p.houseNumber} />
            <Row label="Floor No" value={p.floorNumber} />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-black text-slate-900">Property Location</h3>
              <MapPin className="h-4 w-4 text-gray-300" />
            </div>
            <Row label="Address" value={p.address} />
            <Row label="House No" value={p.houseNumber} />
            <Row label="City" value={p.city} />
            <Row label="State" value={p.state} />
            <Row label="Country" value={p.country} />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-slate-900">Current Occupant</h3>
              <User className="h-4 w-4 text-gray-300" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black text-slate-900">{p.occupantName ?? "NIL"}</p>
                <p className="text-[11px] font-bold text-gray-400">
                  {p.occupantPhone ?? "-- -- --"}
                </p>
              </div>
              <button
                disabled={!p.occupantName}
                onClick={() => showToast("Resident linking is not wired yet.")}
                className="flex items-center gap-1.5 px-3 py-2 border border-blue-200 rounded-xl text-[11px] font-black text-blue-600 hover:bg-blue-50 disabled:text-slate-300 disabled:border-gray-200 disabled:hover:bg-transparent transition-colors"
              >
                View Resident
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <TemporarilyDeleteModal
        open={isRemoving}
        onClose={() => setIsRemoving(false)}
        onConfirm={handleRemove}
      />
    </div>
  );
}
