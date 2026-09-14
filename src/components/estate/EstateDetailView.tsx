import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, Building2, ShieldCheck, UserCheck, Edit, Ban, Trash2, 
  MapPin, Phone, Mail, Clock, Plus, Search, ChevronRight, 
  TrendingUp, ArrowLeft, MoreVertical, LayoutGrid, FileText, RotateCcw
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../Toast";
import { estateApi, estateAdminApi, roleApi, securityPersonnelApi } from "../../services/api";
import { queryClient } from "../../lib/queryClient";
import { qk } from "../../lib/queryKeys";
import { parseList } from "../../lib/parseList";
import { fetchAdminsByStatus } from "../../lib/adminList";
import { matchesSearchTerms } from "../../lib/search";
import { getResidentName } from "../../lib/format";
import ActionMenu from "../ActionMenu";
import { useConfirm } from "../ui/ConfirmDialog";
import ReasonDialog from "../ui/ReasonDialog";
import AdminDetailModal from "../../features/admins/AdminDetailModal";
import type { Resident, Admin, Role } from "../../types/api";

interface EstateDetailViewProps {
  estate: any;
  onBack: () => void;
  onEdit: (estate: any) => void;
}

const visitorTrendData = [
  { name: "Jan 04", visitors: 400 },
  { name: "Jan 08", visitors: 800 },
  { name: "Jan 12", visitors: 600 },
  { name: "Jan 16", visitors: 1100 },
  { name: "Jan 20", visitors: 900 },
  { name: "Jan 24", visitors: 1400 },
  { name: "Jan 28", visitors: 1200 },
];

export default function EstateDetailView({ estate, onBack, onEdit }: EstateDetailViewProps) {
  const auth = useAuth();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const adminName = auth.user?.name || "Administrator";
  const estateId = String(estate?.id ?? estate?._id ?? "");
  const [activeTab, setActiveTab] = useState<"overview" | "residents" | "security" | "visitors" | "admins">("overview");
  const [residentSearchText, setResidentSearchText] = useState("");
  const [securitySearchText, setSecuritySearchText] = useState("");
  const [visitorSearchText, setVisitorSearchText] = useState("");
  const [estateAdminSearchText, setEstateAdminSearchText] = useState("");
  // Admin menu managed by ActionMenu component

  const [isOnboardAdminModalOpen, setIsOnboardAdminModalOpen] = useState(false);
  const [newEstateAdmin, setNewEstateAdmin] = useState({ firstName: "", lastName: "", email: "", roleId: "" });
  const [isSuspending, setIsSuspending] = useState(false);
  const [adminReasonAction, setAdminReasonAction] = useState<null | { type: "suspend" | "delete"; adminId: string }>(null);





  const { data: residentsRaw, isLoading: isResidentsLoading } = useQuery({
    queryKey: qk.estateResidents(estateId),
    queryFn: () => estateApi.getResidents(estateId),
    enabled: !!estateId,
  });

  // GET /estate/{estateId} returns real resident/staff/admin counts.
  const { data: estateDetailRaw } = useQuery({
    queryKey: qk.estate(estateId),
    queryFn: () => estateApi.getById(estateId),
    enabled: !!estateId,
  });

  const counts = useMemo(() => {
    const d: any = (estateDetailRaw as any)?.data ?? estateDetailRaw ?? {};
    const pick = (...keys: string[]) => {
      for (const k of keys) {
        const v = d?.[k] ?? d?.counts?.[k] ?? d?._count?.[k];
        if (typeof v === "number") return v;
      }
      return null;
    };
    return {
      residents: pick("residentCount", "totalResidents", "residents"),
      units: pick("unitCount", "totalUnits", "units", "houseCount"),
      security: pick("securityCount", "totalSecurity", "staffCount", "totalStaff"),
      admins: pick("adminCount", "totalAdmins", "admins"),
    };
  }, [estateDetailRaw]);

  const fetchAllEstateAdmins = async () => {
    if (!estateId) return [];
    return fetchAdminsByStatus(estateAdminApi, ["admins", "result"]);
  };


  const { data: estateAdminsRaw, isLoading: isEstateAdminsLoading } = useQuery({
    queryKey: qk.estateAdmins(estateId),
    queryFn: fetchAllEstateAdmins,
    enabled: !!estateId,
  });

  const { data: rolesRaw } = useQuery({
    queryKey: qk.roles(),
    queryFn: () => roleApi.list(),
  });

  const residentsList: Resident[] = useMemo(() => parseList(residentsRaw, "residents", "result"), [residentsRaw]);
  const estateAdminsList: Admin[] = useMemo(() => {
    const raw = Array.isArray(estateAdminsRaw) ? estateAdminsRaw : parseList(estateAdminsRaw, "admins", "result");
    if (!estateId) return raw;
    const estateSpecific = raw.filter((a: any) => a.estateId === estateId);
    return estateSpecific.length ? estateSpecific : raw;
  }, [estateAdminsRaw, estateId]);
  const rolesList: Role[] = useMemo(() => parseList(rolesRaw, "roles", "result"), [rolesRaw]);

  const filteredResidentsList = useMemo(() => (
    residentsList.filter((resident) =>
      matchesSearchTerms(
        [
          getResidentName(resident),
          resident.email,
          resident.phoneNumber,
          resident.houseNo,
          resident.status,
          resident.createdAt,
        ],
        residentSearchText,
      )
    )
  ), [residentsList, residentSearchText]);

  // Real: GET /security-personnel/estate/{estateId}
  const { data: securityRaw } = useQuery({
    queryKey: ["security", "estate", estateId],
    queryFn: () => securityPersonnelApi.list(estateId, { pageSize: 200 }),
    enabled: !!estateId,
    retry: false,
  });

  const securityStaff = useMemo(() => (
    parseList(securityRaw, "personnel", "users", "result", "data").map((p: any) => ({
      id: p?.id ?? p?._id ?? "",
      name: [p?.firstName, p?.lastName].filter(Boolean).join(" ") || "--",
      // The API exposes no shift or gate field yet.
      shift: p?.shift ?? "--",
      gate: p?.assignedGate ?? "--",
      status: String(p?.status ?? "active").toLowerCase() === "active" ? "Active" : "Inactive",
    }))
  ), [securityRaw]);

  const filteredSecurityStaff = useMemo(() => (
    securityStaff.filter((staff) =>
      matchesSearchTerms([staff.name, staff.shift, staff.gate, staff.status], securitySearchText)
    )
  ), [securityStaff, securitySearchText]);

  const visitorLogs = [
    { id: 1, name: "Emmanuel", host: "Chikwemedu Emmanuel", entry: "10:00PM, Today", status: "In", officer: `Officer ${adminName}` },
    { id: 2, name: "Emmanuel", host: "Chikwemedu Emmanuel", entry: "10:00AM, Tomorrow", status: "Expected", officer: `Officer ${adminName}` },
    { id: 3, name: "Emmanuel", host: "Chikwemedu Emmanuel", entry: "10:00AM, May 14, 2026", status: "Out", officer: `Officer ${adminName}` },
  ];

  const filteredVisitorLogs = useMemo(() => (
    visitorLogs.filter((log) =>
      matchesSearchTerms([log.name, log.host, log.entry, log.status, log.officer], visitorSearchText)
    )
  ), [visitorSearchText]);

  const filteredEstateAdminsList = useMemo(() => (
    estateAdminsList.filter((admin) =>
      matchesSearchTerms(
        [
          `${admin.firstName || ""} ${admin.lastName || ""}`.trim(),
          admin.email,
          admin.role?.name,
          admin.status,
          admin.createdAt,
        ],
        estateAdminSearchText,
      )
    )
  ), [estateAdminsList, estateAdminSearchText]);

  const handleEstateAdminSuspend = (adminId: string) => {
    setAdminReasonAction({ type: "suspend", adminId });
  };

  const handleEstateAdminRestore = async (adminId: string) => {
    try {
      await estateAdminApi.restore(adminId);
      queryClient.invalidateQueries({ queryKey: qk.estateAdmins(estateId) });
      showToast("Estate admin restored");
    } catch (err: any) {
      showToast(err.message || "Failed to restore estate admin");
    }
  };

  const handleEstateAdminDelete = (adminId: string) => {
    setAdminReasonAction({ type: "delete", adminId });
  };

  const handleEstateAdminReasonConfirm = async (reason: string) => {
    if (!adminReasonAction) return;
    const { type, adminId } = adminReasonAction;
    try {
      if (type === "suspend") {
        await estateAdminApi.suspend(adminId, reason);
        showToast("Estate admin suspended");
      } else {
        await estateAdminApi.softDelete(adminId, reason);
        showToast("Estate admin deleted");
      }
      queryClient.invalidateQueries({ queryKey: qk.estateAdmins(estateId) });
      setAdminReasonAction(null);
    } catch (err: any) {
      showToast(err.message || `Failed to ${type} estate admin`);
      throw err;
    }
  };

  const handleOnboardEstateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEstateAdmin.firstName || !newEstateAdmin.email || !newEstateAdmin.roleId) return;
    try {
      await estateAdminApi.onboard({
        firstName: newEstateAdmin.firstName,
        lastName: newEstateAdmin.lastName,
        email: newEstateAdmin.email,
        roleId: newEstateAdmin.roleId,
      });
      queryClient.invalidateQueries({ queryKey: qk.estateAdmins(estateId) });
      showToast("Estate admin onboarded successfully");
      setIsOnboardAdminModalOpen(false);
      setNewEstateAdmin({ firstName: "", lastName: "", email: "", roleId: "" });
    } catch (err: any) {
      showToast(err.message || "Failed to onboard estate admin");
    }
  };

  const handleEstateAdminUpdateRole = async (adminId: string, roleId: string) => {
    try {
      await estateAdminApi.updateRole(adminId, { roleId });
      queryClient.invalidateQueries({ queryKey: qk.estateAdmins(estateId) });
      showToast("Estate admin role updated");
    } catch (err: any) {
      showToast(err.message || "Failed to update estate admin role");
    }
  };

  /**
   * These routes are restricted to the estate's contact admin — the person
   * named when the estate was onboarded — not to any global admin. The server
   * scopes the lookup to that admin, so an unauthorised caller gets 404 rather
   * than 403. Say that plainly instead of showing a bare "Not found".
   */
  const estateActionError = (err: any, verb: string) => {
    if (err?.status === 404) {
      return `Only this estate's contact admin can ${verb} it. You are signed in as a different admin.`;
    }
    if (err?.status === 409) {
      return `This estate cannot be ${verb === "suspend" ? "suspended" : "deleted"} in its current state.`;
    }
    if (err?.status === 400) {
      return err?.message || `A reason is required to ${verb} this estate.`;
    }
    return err?.message || "The action could not be completed.";
  };

  // Estate lifecycle — soft-delete is the backend's "suspend".
  const runEstateAction = async (
    action: () => Promise<unknown>,
    confirmOpts: Parameters<typeof confirm>[0],
    success: string,
    verb: string,
    goBack = false,
  ) => {
    if (!estateId) {
      showToast("Missing estate id — refresh and try again.");
      return;
    }
    if (!(await confirm(confirmOpts))) return;
    try {
      await action();
      queryClient.invalidateQueries({ queryKey: qk.estates() });
      queryClient.invalidateQueries({ queryKey: qk.estate(estateId) });
      showToast(success, "success");
      if (goBack) onBack();
    } catch (err: any) {
      showToast(estateActionError(err, verb));
    }
  };

  const handleEstateSuspendConfirmed = async (reason: string) => {
    if (!estateId) {
      showToast("Missing estate id — refresh and try again.");
      return;
    }
    try {
      await estateApi.softDelete(estateId, reason);
      queryClient.invalidateQueries({ queryKey: qk.estates() });
      queryClient.invalidateQueries({ queryKey: qk.estate(estateId) });
      showToast("Estate suspended", "success");
      setIsSuspending(false);
      onBack();
    } catch (err: any) {
      showToast(estateActionError(err, "suspend"));
      throw err;
    }
  };

  const handleEstateRestore = () => runEstateAction(
    () => estateApi.restore(estateId),
    { title: "Restore this estate?", description: "It will appear in active listings again.", confirmLabel: "Restore" },
    "Estate restored",
    "restore",
  );

  const handleEstateDelete = () => runEstateAction(
    () => estateApi.remove(estateId),
    {
      title: "Delete this estate permanently?",
      description: "This cannot be undone. Only the estate's contact admin can delete it. If the estate is still active, suspend it first.",
      confirmLabel: "Delete",
      tone: "danger",
    },
    "Estate deleted",
    "delete",
    true,
  );

  const [detailAdmin, setDetailAdmin] = useState<{ id: string; scoped: boolean } | null>(null);

  /** DELETE /estate-admin/{userId}/delete — irreversible, unlike soft-delete. */
  const handleEstateAdminHardDelete = async (adminId: string) => {
    const ok = await confirm({
      title: "Delete this estate admin permanently?",
      description: "They will be removed for good. This cannot be undone.",
      confirmLabel: "Delete", tone: "danger",
    });
    if (!ok) return;
    try {
      await estateAdminApi.remove(adminId);
      queryClient.invalidateQueries({ queryKey: qk.estateAdmins(estate?.id) });
      showToast("Estate admin deleted", "success");
    } catch (err: any) {
      showToast(err?.message || "Could not delete this estate admin");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Left Column: Profile & Info */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="h-24 w-24 bg-blue-50 rounded-3xl flex items-center justify-center mb-4">
                    <span className="text-3xl font-black text-blue-600">SV</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{estate.name}</h3>
                  <span className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">LINCENSED RESIDENTIAL</span>
                </div>

                <div className="mt-8 space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Location</span>
                      <span className="text-xs font-bold text-slate-700 leading-tight block mt-0.5">
                        683, Marble Towers, Kingsway Road, Lagos, NG
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                      <Phone className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Contact</span>
                      <span className="text-xs font-bold text-slate-700 block mt-0.5">+234 803 587 6754</span>
                      <span className="text-[10px] text-gray-400 font-medium">youremail@gmail.com</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Joined</span>
                      <span className="text-xs font-bold text-slate-700 block mt-0.5">Mar 14, 2026</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Card */}
              <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden group">
                <div className="relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Standard Plans</span>
                  <h4 className="text-lg font-black mt-1">Subscription Details</h4>
                  
                  <div className="mt-6 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] font-bold opacity-70 block">Current Bill</span>
                      <span className="text-2xl font-black">₦234,355</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold opacity-70 block">Due Date</span>
                      <span className="text-xs font-black">Apr 14, 2026</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <button className="w-full bg-white text-blue-600 py-2.5 rounded-xl text-xs font-black transition-transform hover:scale-[1.02] active:scale-95">
                      Billing Dashboard
                    </button>
                    <button className="w-full bg-blue-500/30 text-white py-2.5 rounded-xl text-xs font-black border border-white/20 transition-transform hover:bg-blue-500/50">
                      Admin Dashboard
                    </button>
                  </div>
                </div>
                {/* Background Pattern */}
                <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <Building2 className="h-48 w-48" />
                </div>
              </div>
            </div>

            {/* Right Column: Chart & Recent activity */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Visitor Entries</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Traffic overview for the last 30 days</p>
                  </div>
                  <div className="flex gap-2">
                    <select className="text-[10px] font-bold border border-gray-200 rounded-lg px-2 py-1 bg-slate-50 outline-none">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                      <option>Last 365 Days</option>
                    </select>
                  </div>
                </div>
                
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={visitorTrendData}>
                      <defs>
                        <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 800, color: '#2563eb' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="visitors" 
                        stroke="#2563eb" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorVisitors)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Admin list summary */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                    className="h-10 w-10 rounded-full border-2 border-slate-50"
                    alt="Admin"
                  />
                  <div>
                    <span className="text-xs font-black text-slate-900 block">{adminName}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter block leading-none">Global Administrator</span>
                  </div>
                </div>
                <div className="text-[11px] text-gray-500 font-medium leading-relaxed">
                  Managing estate operations and security parameters for <span className="font-bold text-slate-900">Sunset Valley Residences</span>. 
                  Currently overseeing 12,532 registered residents and 12 security personnel.
                </div>
              </div>
            </div>
          </div>
        );
      
      case "residents":
        return (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-slate-50/30">
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search Residents..." 
                  value={residentSearchText}
                  onChange={(e) => setResidentSearchText(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-white outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-white text-gray-500">
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
            {isResidentsLoading ? (
              <div className="p-12 text-center text-xs text-gray-400">Loading residents...</div>
            ) : residentsList.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400">No residents found for this estate.</div>
            ) : filteredResidentsList.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400">No residents match your search.</div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                    <th className="py-4 px-6">Resident Name</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Phone</th>
                    <th className="py-4 px-6 text-center">House No</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Date Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredResidentsList.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">{res.firstName} {res.lastName}</td>
                      <td className="py-4 px-6 font-bold text-gray-500">{res.email}</td>
                      <td className="py-4 px-6 font-bold text-gray-500 font-mono">{res.phoneNumber}</td>
                      <td className="py-4 px-6 text-center font-black text-blue-600">{res.houseNo}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                          {res.status || "Active"}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-400">
                        {res.createdAt ? new Date(res.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        );

      case "security":
        return (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-slate-50/30">
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search Security Staff..." 
                  value={securitySearchText}
                  onChange={(e) => setSecuritySearchText(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-white outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <select className="text-[10px] font-bold border border-gray-200 rounded-lg px-2 py-1 bg-white outline-none">
                  <option>All Shift</option>
                  <option>Morning</option>
                  <option>Night</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                    <th className="py-4 px-6">Staff Name</th>
                    <th className="py-4 px-6">Shift</th>
                    <th className="py-4 px-6">Gate</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredSecurityStaff.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center font-bold text-gray-400">
                        No security staff match your search.
                      </td>
                    </tr>
                  ) : filteredSecurityStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">{staff.name}</td>
                      <td className="py-4 px-6 font-bold text-blue-600">{staff.shift}</td>
                      <td className="py-4 px-6 font-bold text-gray-500">{staff.gate}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                          {staff.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-gray-300 hover:text-slate-900 p-1 cursor-not-allowed" title="No resident management available">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "visitors":
        return (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-slate-50/30">
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search Visitor Logs..." 
                  value={visitorSearchText}
                  onChange={(e) => setVisitorSearchText(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-white outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-gray-400 uppercase">Filter:</span>
                <select className="text-[10px] font-bold border border-gray-200 rounded-lg px-2 py-1 bg-white outline-none">
                  <option>All Time</option>
                  <option>Today</option>
                  <option>This Week</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                    <th className="py-4 px-6">Visitor Name</th>
                    <th className="py-4 px-6">Host</th>
                    <th className="py-4 px-6">Entry Time</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Security Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredVisitorLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center font-bold text-gray-400">
                        No visitor logs match your search.
                      </td>
                    </tr>
                  ) : filteredVisitorLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">{log.name}</td>
                      <td className="py-4 px-6 font-bold text-gray-500">{log.host}</td>
                      <td className="py-4 px-6 font-bold text-slate-700 font-mono">{log.entry}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full border ${
                          log.status === 'In' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 
                          log.status === 'Expected' ? 'text-blue-600 bg-blue-50 border-blue-100' : 
                          'text-gray-500 bg-gray-50 border-gray-100'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                             log.status === 'In' ? 'bg-emerald-500' : 
                             log.status === 'Expected' ? 'bg-blue-500' : 
                             'bg-gray-400'
                          }`} />
                          {log.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-400 uppercase tracking-tighter">{log.officer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "admins":
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-900">Estate Admins</h3>
              <button
                onClick={() => setIsOnboardAdminModalOpen(true)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add Estate Admin
              </button>
            </div>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm">
              {isEstateAdminsLoading ? (
                <div className="p-12 text-center text-xs text-gray-400">Loading admins...</div>
              ) : estateAdminsList.length === 0 ? (
                <div className="p-12 text-center text-xs text-gray-400">No admins found for this estate.</div>
              ) : (
              <>
              <div className="p-4 border-b border-gray-50 bg-slate-50/30">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search Estate Admins..."
                    value={estateAdminSearchText}
                    onChange={(e) => setEstateAdminSearchText(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-white outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                      <th className="py-4 px-6">Admin Name</th>
                      <th className="py-4 px-6">Email Address</th>
                      <th className="py-4 px-6">Role</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredEstateAdminsList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center font-bold text-gray-400">
                          No estate admins match your search.
                        </td>
                      </tr>
                    ) : filteredEstateAdminsList.map((adm) => (
                      <tr key={adm.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900">{adm.firstName} {adm.lastName}</td>
                        <td className="py-4 px-6 font-bold text-gray-500 font-mono">{adm.email}</td>
                        <td className="py-4 px-6 font-bold text-indigo-600">{adm.role?.name || "Admin"}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full border ${
                            adm.status?.toLowerCase() === "active"
                              ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                              : "text-amber-600 bg-amber-50 border-amber-100"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              adm.status?.toLowerCase() === "active" ? "bg-emerald-500" : "bg-amber-500"
                            }`} />
                            {adm.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <ActionMenu
                            trigger={<MoreVertical className="h-4 w-4 text-gray-300 hover:text-slate-900" />}
                          >
                            <button
                              onClick={() => setDetailAdmin({ id: adm.id, scoped: false })}
                              className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => setDetailAdmin({ id: adm.id, scoped: true })}
                              className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                            >
                              View in This Estate
                            </button>
                            <div className="px-3 py-2 border-b border-t border-gray-100">
                              <span className="text-[9px] font-bold text-gray-400 uppercase">Change Role</span>
                              <select
                                onChange={(e) => { if (e.target.value) handleEstateAdminUpdateRole(adm.id, e.target.value); }}
                                className="w-full text-xs font-bold border border-gray-200 rounded-lg px-2 py-1 mt-1 outline-none"
                                defaultValue=""
                              >
                                <option value="" disabled>Select role...</option>
                                {rolesList.map((r) => (
                                  <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                              </select>
                            </div>
                            <button
                              onClick={() => handleEstateAdminSuspend(adm.id)}
                              className="w-full text-left px-3 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50 cursor-pointer"
                            >
                              Suspend
                            </button>
                            <button
                              onClick={() => handleEstateAdminRestore(adm.id)}
                              className="w-full text-left px-3 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => handleEstateAdminDelete(adm.id)}
                              className="w-full text-left px-3 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50 cursor-pointer"
                            >
                              Deactivate
                            </button>
                            <button
                              onClick={() => handleEstateAdminHardDelete(adm.id)}
                              className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              Delete Permanently
                            </button>
                          </ActionMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Breadcrumb & Actions */}
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
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estates Directory</span>
              <ChevronRight className="h-3 w-3 text-gray-300" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">View Estate</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-0.5">{estate.name}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onEdit(estate)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit Estate
          </button>
          <button
            onClick={() => setIsSuspending(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl text-xs font-black text-amber-700 hover:bg-amber-100 transition-all"
          >
            <Ban className="h-3.5 w-3.5" />
            Suspend
          </button>
          <button
            onClick={handleEstateRestore}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-black text-emerald-700 hover:bg-emerald-100 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restore
          </button>
          <button
            onClick={handleEstateDelete}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl text-xs font-black text-rose-700 hover:bg-rose-100 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Primary KPI Deck */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:border-blue-200 transition-colors cursor-default group">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 flex items-center gap-0.5">
              <TrendingUp className="h-2.5 w-2.5" /> +12%
            </span>
          </div>
          <span className="text-2xl font-black text-slate-900 block leading-none">
            {counts.residents?.toLocaleString() ?? residentsList.length.toLocaleString()}
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 block">Active Residents</span>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:border-blue-200 transition-colors cursor-default group">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 flex items-center gap-0.5">
              <TrendingUp className="h-2.5 w-2.5" /> +2%
            </span>
          </div>
          <span className="text-2xl font-black text-slate-900 block leading-none">
            {counts.units?.toLocaleString() ?? "--"}
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 block">Housing Units</span>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:border-blue-200 transition-colors cursor-default group">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 flex items-center gap-0.5">
              <TrendingUp className="h-2.5 w-2.5" /> +8%
            </span>
          </div>
          <span className="text-2xl font-black text-slate-900 block leading-none">
            {counts.security?.toLocaleString() ?? "--"}
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 block">Security Guards</span>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:border-blue-200 transition-colors cursor-default group">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 flex items-center gap-0.5">
               Online
            </span>
          </div>
          <span className="text-2xl font-black text-slate-900 block leading-none">
            {(counts.admins ?? estateAdminsList.length).toLocaleString()}
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 block">Active Admins</span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 overflow-x-auto pb-px scrollbar-hide">
        {(["overview", "residents", "security", "visitors", "admins"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs font-black uppercase tracking-widest pb-4 relative transition-colors ${
              activeTab === tab ? "text-blue-600" : "text-gray-400 hover:text-slate-600"
            }`}
          >
            {tab === 'visitors' ? 'Visitors Log' : tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full shadow-[0_-2px_8px_rgba(37,99,235,0.4)]" />
            )}
          </button>
        ))}
      </div>

      <AdminDetailModal
        adminId={detailAdmin?.id ?? null}
        source={detailAdmin?.scoped ? "scoped" : "estate"}
        estateId={estate?.id}
        onClose={() => setDetailAdmin(null)}
      />

      <ReasonDialog
        open={isSuspending}
        onClose={() => setIsSuspending(false)}
        onConfirm={handleEstateSuspendConfirmed}
        title="Suspend this estate?"
        description={`${estate?.name ?? "This estate"} will be hidden from active listings. The backend requires a reason. You can restore it afterwards.`}
        confirmLabel="Suspend Estate"
        tone="warning"
      />

      <ReasonDialog
        open={!!adminReasonAction}
        onClose={() => setAdminReasonAction(null)}
        onConfirm={handleEstateAdminReasonConfirm}
        title={adminReasonAction?.type === "delete" ? "Delete this estate admin?" : "Suspend this estate admin?"}
        description={
          adminReasonAction?.type === "delete"
            ? "This soft-deletes the admin. The backend requires a reason."
            : "This deactivates the admin until restored. The backend requires a reason."
        }
        confirmLabel={adminReasonAction?.type === "delete" ? "Delete Admin" : "Suspend Admin"}
        tone={adminReasonAction?.type === "delete" ? "danger" : "warning"}
      />

      {/* Active Tab View */}
      <div className="min-h-[500px]">
        {renderTabContent()}
      </div>

      {/* ONBOARD ESTATE ADMIN MODAL */}
      {isOnboardAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-200 shadow-2xl relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setIsOnboardAdminModalOpen(false)}
            >
              <span className="text-lg">&times;</span>
            </button>

            <div className="mb-5">
              <span className="text-[10px] font-black bg-blue-50 text-blue-700 uppercase px-2 py-0.5 rounded block w-max font-mono">
                Estate Admin Onboarding
              </span>
              <h3 className="text-base font-black text-slate-950 mt-1">
                Add New Estate Admin
              </h3>
            </div>

            <form onSubmit={handleOnboardEstateAdmin} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chinedu"
                    value={newEstateAdmin.firstName}
                    onChange={(e) => setNewEstateAdmin({ ...newEstateAdmin, firstName: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Okafor"
                    value={newEstateAdmin.lastName}
                    onChange={(e) => setNewEstateAdmin({ ...newEstateAdmin, lastName: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. chinedu@estate.ng"
                  value={newEstateAdmin.email}
                  onChange={(e) => setNewEstateAdmin({ ...newEstateAdmin, email: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Role</label>
                <select
                  required
                  value={newEstateAdmin.roleId}
                  onChange={(e) => setNewEstateAdmin({ ...newEstateAdmin, roleId: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg outline-none"
                >
                  <option value="">Select Role</option>
                  {rolesList.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsOnboardAdminModalOpen(false)}
                  className="flex-1 py-2 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-sm"
                >
                  Onboard Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
