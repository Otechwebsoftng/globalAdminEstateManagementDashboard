import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, ChevronRight, Download, Ban, ShieldCheck, Clock, Activity,
  CalendarDays, Phone, Mail, RotateCcw,
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import ReasonDialog from "../../components/ui/ReasonDialog";
import MockBadge from "../../components/ui/MockBadge";
import { CardSkeleton } from "../../components/Skeleton";
import { useToast } from "../../components/Toast";
import { queryClient } from "../../lib/queryClient";
import { securityApi, SECURITY_IS_MOCK } from "../../services/securityApi";
import { gateLabel, shiftLabel, type SecurityPersonnel } from "../../types/security";

const initials = (p: SecurityPersonnel) =>
  `${p.firstName?.[0] ?? ""}${p.lastName?.[0] ?? ""}`.toUpperCase();

function Stat({
  icon: Icon, label, value, tone,
}: { icon: typeof ShieldCheck; label: string; value: string | number; tone: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-4 ${tone}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-[11px] font-bold text-gray-400">{label}</span>
        <span className="text-lg font-black text-slate-900 leading-none">{value}</span>
      </div>
    </div>
  );
}

export default function SecurityPersonnelDetail({
  personnelId, estateId, onBack,
}: { personnelId: string; estateId: string; onBack: () => void }) {
  const { showToast } = useToast();
  const [isSuspending, setIsSuspending] = useState(false);

  const { data: p, isLoading } = useQuery({
    queryKey: ["security", "detail", personnelId, estateId],
    queryFn: () => securityApi.getById(personnelId, estateId),
    retry: false,
  });

  if (isLoading) return <CardSkeleton />;
  if (!p) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center space-y-3">
        <p className="text-sm font-black text-slate-900">Security personnel not found.</p>
        <button onClick={onBack} className="text-xs font-black text-blue-600 hover:underline">
          Back to Security Personnel
        </button>
      </div>
    );
  }

  const toggleSuspend = async (reason?: string) => {
    const next = p.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    try {
      await securityApi.setStatus(p.id, next, estateId, reason);
      queryClient.invalidateQueries({ queryKey: ["security"] });
      showToast(next === "SUSPENDED" ? "Personnel suspended" : "Personnel restored", "success");
    } catch (err: any) {
      showToast(err?.message || "Could not update status");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="h-10 w-10 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Security Personnel</span>
              <ChevronRight className="h-3 w-3 text-gray-300" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">View Security Personnel</span>
            </div>
            <div className="flex items-center gap-2.5 mt-0.5">
              <h2 className="text-2xl font-black text-slate-900">Security Personnel Details</h2>
              {SECURITY_IS_MOCK && <MockBadge />}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast("Export is not available yet — no reporting endpoint.")}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            Export Logs
          </button>
          <button
            onClick={() => p.status === "SUSPENDED" ? toggleSuspend() : setIsSuspending(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl text-xs font-black text-amber-700 hover:bg-amber-100 transition-all"
          >
            {p.status === "SUSPENDED"
              ? <><RotateCcw className="h-3.5 w-3.5" />Restore</>
              : <><Ban className="h-3.5 w-3.5" />Suspend</>}
          </button>
        </div>
      </div>

      <ReasonDialog
        open={isSuspending}
        onClose={() => setIsSuspending(false)}
        onConfirm={toggleSuspend}
        title="Suspend this personnel?"
        description="Suspension requires a reason and can be reversed later."
        confirmLabel="Suspend Personnel"
        tone="warning"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-black text-sm shrink-0">
              {initials(p)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg font-black text-slate-900 leading-none">
                  {p.firstName} {p.lastName}
                </h3>
                <Badge status={p.status} />
              </div>
              <p className="text-xs font-bold text-gray-400 mt-1.5">
                {p.reference} — {p.estateName}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Stat icon={ShieldCheck} label="Total Verifications" value={p.totalVerifications} tone="bg-blue-50 text-blue-600" />
            <Stat icon={Activity} label="Today's Verification" value={p.todaysVerifications} tone="bg-amber-50 text-amber-600" />
            <Stat icon={Activity} label="Attendance Rate" value={`${p.attendanceRate}%`} tone="bg-blue-50 text-blue-600" />
            <Stat icon={Clock} label="Last Active" value={p.lastActiveAt} tone="bg-slate-50 text-slate-500" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">Verification Logs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest bg-slate-50/30">
                    <th className="py-3.5 px-6">Visitor Name</th>
                    <th className="py-3.5 px-6">Code</th>
                    <th className="py-3.5 px-6">Time</th>
                    <th className="py-3.5 px-6">Gate</th>
                    <th className="py-3.5 px-6 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {p.verificationLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center font-bold text-gray-400">
                        No verifications recorded yet.
                      </td>
                    </tr>
                  ) : p.verificationLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-6 font-black text-slate-900">{log.visitorName}</td>
                      <td className="py-3.5 px-6 font-bold text-gray-500 font-mono">{log.code}</td>
                      <td className="py-3.5 px-6 font-bold text-gray-400">{log.time}</td>
                      <td className="py-3.5 px-6 font-bold text-slate-700">{gateLabel(log.gate)}</td>
                      <td className="py-3.5 px-6 text-right"><Badge status={log.result} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Basic info panel */}
        <div className="lg:col-span-4">
          <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-200/50 space-y-5">
            <div>
              <h3 className="text-sm font-black">Basic Info</h3>
              <p className="text-[10px] font-bold text-blue-200 mt-0.5">Internal assignment</p>
            </div>

            <div className="space-y-0">
              {[
                { label: "Assigned Gate", value: gateLabel(p.assignedGate), pill: true },
                { label: "Shift", value: shiftLabel(p.shift) },
                { label: "Identity", value: `${p.documentType} · ${p.documentNumber}` },
                { label: "Date Added", value: p.dateAdded },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 py-3 border-b border-white/15 last:border-0">
                  <span className="text-[11px] font-bold text-blue-100">{row.label}</span>
                  {row.pill ? (
                    <span className="text-[10px] font-black bg-white/20 px-2.5 py-1 rounded-lg">{row.value}</span>
                  ) : (
                    <span className="text-[11px] font-black">{row.value}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-4 space-y-2.5">
              <span className="text-[11px] font-black text-slate-900 flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
                Contact Details
              </span>
              <a
                href={`tel:${p.countryCode}${p.phoneNumber}`}
                className="flex items-center gap-2 text-[11px] font-bold text-slate-600 hover:text-blue-600 transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                {p.countryCode} {p.phoneNumber}
              </a>
              <a
                href={`mailto:${p.email}`}
                className="flex items-center gap-2 text-[11px] font-bold text-slate-600 hover:text-blue-600 transition-colors break-all"
              >
                <Mail className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                {p.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
