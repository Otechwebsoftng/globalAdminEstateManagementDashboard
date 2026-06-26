import React, { useState, useMemo, useEffect, useCallback } from "react";
import { 
  Building2, Users, HardHat, ShieldCheck, Search, Plus, Trash2, 
  MapPin, Clock, DollarSign, Send, ClipboardList, Menu, X, CheckSquare, 
  ChevronRight, ArrowUpRight, TrendingUp, AlertTriangle, KeyRound, Check, 
  Star, RefreshCw, Lock, HelpCircle, FileText, Ban, Power, ShieldAlert,
  ChevronDown, MessageSquare, Laptop, Bell, Eye, Ban as BanIcon, ToggleLeft, Edit, MoreVertical,
  Mail, Phone, UserX, ArrowLeft
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import EstateDetailView from "./EstateDetailView";
import ResidentDetailView from "./ResidentDetailView";
import { StatsCardSkeleton, TableSkeleton } from "../Skeleton";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../Toast";
import { globalAdminApi, estateApi, roleApi, menuApi, permissionApi } from "../../services/api";
import type { Estate, Resident, Admin, Role, MenuItem, Permission } from "../../types/api";

interface GlobalDashboardProps {}

// Chart Mock Data for Revenue Growth
const revenueData = [
  { name: "Jan", revenue: 4500000 },
  { name: "Feb", revenue: 5200000 },
  { name: "Mar", revenue: 6800000 },
  { name: "Apr", revenue: 8400000 },
  { name: "May", revenue: 9900000 },
  { name: "Jun", revenue: 11234355 },
  { name: "Jul", revenue: 11800000 },
  { name: "Aug", revenue: 12500000 },
  { name: "Sep", revenue: 13900000 },
  { name: "Oct", revenue: 14400000 },
  { name: "Nov", revenue: 15100000 },
  { name: "Dec", revenue: 16000000 }
];

export default function GlobalDashboard({}: GlobalDashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const { showToast } = useToast();
  
  const adminName = auth.user?.name || "Administrator";
  
  const onLogout = () => {
    auth.logout();
    navigate("/login");
  };
  
  // Derive activeMenu from URL path
  const activeMenu = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    const menuFromPath = parts[1] || "dashboard";
    const validMenus = ["dashboard", "estates", "residents", "staff", "admins", "plans", "billing", "tickets", "logs", "settings"];
    return validMenus.includes(menuFromPath) ? menuFromPath as typeof validMenus[number] : "dashboard";
  }, [location.pathname]);

  // Dashboard summary data
  const [dashboardStats, setDashboardStats] = useState({
    totalEstates: 0,
    totalResidents: 0,
    totalStaff: 0,
    revenue: "₦0",
    recentActivity: [] as Array<{ id: string | number; action: string; estate: string; time: string }>
  });
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);

  // Sidebar Estate Management collapsible state
  const [isEstateMenuExpanded, setIsEstateMenuExpanded] = useState(true);

  // Search and select dropdowns filters state
  const [staffSearchText, setStaffSearchText] = useState("");
  const [staffStatusFilter, setStaffStatusFilter] = useState("All");
  const [staffShiftFilter, setStaffShiftFilter] = useState("All Shift");
  const [staffTypeFilter, setStaffTypeFilter] = useState("All");

  // Active Admin Actions Popover row ID tracking
  const [activeRowActionMenuId, setActiveRowActionMenuId] = useState<string | null>(null);

  // Estates Database State
  const [estates, setEstates] = useState<Estate[]>([]);
  const [isEstatesLoading, setIsEstatesLoading] = useState(true);

  // State to manage Onboard Estate Modal input - matches frame 1618686559/1618686560
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [newEstate, setNewEstate] = useState({
    name: "",
    owner: "",
    email: "",
    phone: "",
    address: "",
    city: "Lagos",
    tier: "ENTERPRISE"
  });
  const [sendLoginDetails, setSendLoginDetails] = useState(true);

  // Residents State
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isResidentsLoading, setIsResidentsLoading] = useState(true);

  const [activeResidentTabState, setActiveResidentTabState] = useState<"All" | "Lagos" | "Abuja" | "Port Harcourt">("All");
  // Track selected estate for detail view (derived from URL)
  const [selectedEstateId, setSelectedEstateId] = useState<string | null>(null);

  // Track selected resident for detail view (derived from URL)
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null);

  // Row Action Menu State

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEstate, setEditingEstate] = useState<any>(null);

  // Mobile nav state
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Staff, Admin, Resident state
  const [staffList, setStaffList] = useState<any[]>([]);
  const [adminsList, setAdminsList] = useState<Admin[]>([]);
  const [isAdminsLoading, setIsAdminsLoading] = useState(true);
  const [rolesList, setRolesList] = useState<Role[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [permissionsList, setPermissionsList] = useState<Permission[]>([]);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({ name: "", description: "", permissionIds: [] as string[] });
  const [newAdmin, setNewAdmin] = useState({ firstName: "", lastName: "", email: "", roleId: "" });
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [newResident, setNewResident] = useState({ name: "", email: "", phone: "", houseNo: "" });
  const [editingResident, setEditingResident] = useState<any>(null);
  const [isEditResidentModalOpen, setIsEditResidentModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAddResidentModalOpen, setIsAddResidentModalOpen] = useState(false);

  // Mobile search toggle
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Visitor pass modal state
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [vPassCode, setVPassCode] = useState("••••");
  const [vCategory, setVCategory] = useState("General");
  const [vDuration, setVDuration] = useState(24);
  const generatePasscode = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setVPassCode(code);
  };

  const handleEditResidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditResidentModalOpen(false);
    setEditingResident(null);
  };

  // Onboard Estate function
  const handleOnboardEstateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEstate.name || !newEstate.email) return;

    try {
      const ownerParts = newEstate.owner.split(" ");
      const response = await estateApi.onboard({
        estateName: newEstate.name,
        firstName: ownerParts[0] || "",
        lastName: ownerParts.slice(1).join(" ") || "",
        cac: "N/A",
        countryCode: "+234",
        phoneNumber: newEstate.phone || "0000000000",
        email: newEstate.email,
        address: newEstate.address || "N/A",
        city: newEstate.city,
        state: "Lagos",
        country: "Nigeria",
      });
      fetchEstates();
    } catch (err: any) {
      showToast(err.message || "Failed to onboard estate");
    }

    setIsOnboardModalOpen(false);
    setNewEstate({ name: "", owner: "", email: "", phone: "", address: "", city: "Lagos", tier: "ENTERPRISE" });
    setSendLoginDetails(true);
  };

  const handleEditEstateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEstate) return;
    try {
      await estateApi.update(editingEstate.id, {
        estateName: editingEstate.estateName || editingEstate.name,
        cac: editingEstate.cac || "",
        address: editingEstate.address,
        lga: editingEstate.lga || "",
        city: editingEstate.city,
        state: editingEstate.state || "Lagos",
        country: editingEstate.country || "Nigeria",
      });
      fetchEstates();
    } catch (err: any) {
      showToast(err.message || "Failed to update estate");
    }
    setIsEditModalOpen(false);
    setEditingEstate(null);
  };

  // Add new admin function
  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.firstName || !newAdmin.email) return;

    try {
      await globalAdminApi.onboard({
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        email: newAdmin.email,
        countryCode: "+234",
        phoneNumber: "",
        roleId: newAdmin.roleId,
      });
      fetchAdmins();
    } catch (err: any) {
      showToast(err.message || "Failed to onboard admin");
    }

    setIsAdminModalOpen(false);
    setNewAdmin({ firstName: "", lastName: "", email: "", roleId: "" });
  };

  const handleAdminSuspend = async (adminId: string) => {
    if (!window.confirm("Are you sure you want to suspend this admin?")) return;
    try {
      await globalAdminApi.suspend(adminId);
      fetchAdmins();
    } catch (err: any) {
      showToast(err.message || "Failed to suspend admin");
    }
    setActiveRowActionMenuId(null);
  };

  const handleAdminRestore = async (adminId: string) => {
    try {
      await globalAdminApi.restore(adminId);
      fetchAdmins();
    } catch (err: any) {
      showToast(err.message || "Failed to restore admin");
    }
    setActiveRowActionMenuId(null);
  };

  const handleAdminSoftDelete = async (adminId: string) => {
    if (!window.confirm("Are you sure you want to delete this admin? This action cannot be undone.")) return;
    try {
      await globalAdminApi.softDelete(adminId);
      fetchAdmins();
    } catch (err: any) {
      showToast(err.message || "Failed to delete admin");
    }
    setActiveRowActionMenuId(null);
  };

  // ── Data Fetching ──────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    try {
      setIsDashboardLoading(true);
      const res: any = await globalAdminApi.getDashboard();
      const d = res?.data ?? res?.dashboard ?? res;
      if (d) {
        setDashboardStats({
          totalEstates: d.totalEstates || 0,
          totalResidents: d.totalResidents || 0,
          totalStaff: d.totalStaff || 0,
          revenue: d.revenue || "₦0",
          recentActivity: d.recentActivity || [],
        });
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load dashboard");
    } finally {
      setIsDashboardLoading(false);
    }
  }, []);

  const fetchEstates = useCallback(async () => {
    try {
      setIsEstatesLoading(true);
      const res: any = await estateApi.list();
      // Handle multiple possible response shapes from backend
      const raw = res?.data ?? res?.estates ?? res?.result ?? (Array.isArray(res) ? res : []);
      if (Array.isArray(raw) && raw.length > 0) {
        const mapped = raw.map((e: any) => ({
          ...e,
          name: e.estateName || e.name || "",
          owner: `${e.firstName || ""} ${e.lastName || ""}`.trim(),
          phone: `${e.countryCode || ""}${e.phoneNumber || ""}`,
          tier: "ENTERPRISE",
          status: e.status || "Active",
          date: e.createdAt ? new Date(e.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "",
        }));
        setEstates(mapped);
      } else {
        setEstates([]);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load estates");
    } finally {
      setIsEstatesLoading(false);
    }
  }, []);

  const fetchAdmins = useCallback(async () => {
    try {
      setIsAdminsLoading(true);
      const res: any = await globalAdminApi.list();
      const raw = res?.data ?? res?.admins ?? res?.result ?? (Array.isArray(res) ? res : []);
      if (Array.isArray(raw)) {
        const mapped = raw.map((a: any) => ({
          ...a,
          name: `${a.firstName || ""} ${a.lastName || ""}`.trim(),
          role: a.role?.name || a.roleName || "Admin",
          lastActivity: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "",
        }));
        setAdminsList(mapped);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load admins");
    } finally {
      setIsAdminsLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const res: any = await roleApi.list();
      const raw = res?.data ?? res?.roles ?? res?.result ?? (Array.isArray(res) ? res : []);
      if (Array.isArray(raw)) {
        setRolesList(raw);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load roles");
    }
  }, []);

  const fetchMenu = useCallback(async () => {
    try {
      const res: any = await menuApi.list();
      const raw = res?.data ?? res?.menus ?? res?.result ?? (Array.isArray(res) ? res : []);
      if (Array.isArray(raw)) {
        setMenuItems(raw);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load menu");
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    try {
      const res: any = await permissionApi.list();
      const raw = res?.data ?? res?.permissions ?? res?.result ?? (Array.isArray(res) ? res : []);
      if (Array.isArray(raw)) {
        setPermissionsList(raw);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load permissions");
    }
  }, []);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.name) return;
    try {
      await roleApi.create({ name: newRole.name, description: newRole.description, permissionIds: newRole.permissionIds });
      fetchRoles();
      setIsRoleModalOpen(false);
      setNewRole({ name: "", description: "", permissionIds: [] });
    } catch (err: any) {
      showToast(err.message || "Failed to create role");
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    try {
      await roleApi.update(editingRole.id, { name: newRole.name, description: newRole.description, permissionIds: newRole.permissionIds });
      fetchRoles();
      setIsRoleModalOpen(false);
      setEditingRole(null);
      setNewRole({ name: "", description: "", permissionIds: [] });
    } catch (err: any) {
      showToast(err.message || "Failed to update role");
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!window.confirm("Delete this role? This cannot be undone.")) return;
    try {
      await roleApi.delete(roleId);
      fetchRoles();
    } catch (err: any) {
      showToast(err.message || "Failed to delete role");
    }
  };

  const handleAdminUpdateRole = async (adminId: string, roleId: string) => {
    try {
      await globalAdminApi.updateRole(adminId, { roleId });
      fetchAdmins();
    } catch (err: any) {
      showToast(err.message || "Failed to update admin role");
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchEstates();
    fetchAdmins();
    fetchRoles();
    fetchMenu();
    fetchPermissions();
  }, [fetchDashboard, fetchEstates, fetchAdmins, fetchRoles, fetchMenu, fetchPermissions]);

  useEffect(() => {
    const handleClickOutside = () => setActiveRowActionMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const renderDashboardView = () => (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {adminName}. Here's what's happening today.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
          <Plus className="h-4 w-4" />
          Add New Estate
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isDashboardLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
        <>
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:border-blue-200 transition-colors cursor-default group">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 flex items-center gap-0.5">
              <TrendingUp className="h-2.5 w-2.5" /> +12%
            </span>
          </div>
          <span className="text-2xl font-black text-slate-900 block leading-none">{dashboardStats.totalEstates}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 block">Total Estates</span>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:border-blue-200 transition-colors cursor-default group">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 flex items-center gap-0.5">
              <TrendingUp className="h-2.5 w-2.5" /> +8%
            </span>
          </div>
          <span className="text-2xl font-black text-slate-900 block leading-none">{dashboardStats.totalResidents.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 block">Total Residents</span>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:border-blue-200 transition-colors cursor-default group">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <HardHat className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 flex items-center gap-0.5">
              <TrendingUp className="h-2.5 w-2.5" /> +5%
            </span>
          </div>
          <span className="text-2xl font-black text-slate-900 block leading-none">{dashboardStats.totalStaff}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 block">Staff Members</span>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:border-blue-200 transition-colors cursor-default group">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 flex items-center gap-0.5">
              <TrendingUp className="h-2.5 w-2.5" /> +15%
            </span>
          </div>
          <span className="text-2xl font-black text-slate-900 block leading-none">{dashboardStats.revenue}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 block">Revenue</span>
        </div>
        </>
        )}
      </div>

      {/* Recent Activity and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {dashboardStats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.estate} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900">Revenue Overview</h3>
              <p className="text-xs text-gray-500">Monthly revenue for the past year</p>
            </div>
            <select className="text-xs font-bold border border-gray-200 rounded-lg px-3 py-1.5 bg-slate-50 outline-none">
              <option>Last 12 Months</option>
              <option>Last 6 Months</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }}
                  tickFormatter={(value) => `₦${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₦${value.toLocaleString()}`, 'Revenue']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: '#2563eb' }} 
                  activeDot={{ r: 7, fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEstatesView = () => (
    <div className="space-y-6">
      {/* Estates Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manage Estates</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all registered estates in the system</p>
        </div>
        <button 
          onClick={() => setIsOnboardModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add New Estate
        </button>
      </div>

      {/* Estates Table */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/30">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search estates..." 
              className="w-full text-xs pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-white outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <select className="text-xs font-bold border border-gray-200 rounded-lg px-3 py-1.5 bg-white outline-none">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <select className="text-xs font-bold border border-gray-200 rounded-lg px-3 py-1.5 bg-white outline-none">
              <option>All Tiers</option>
              <option>Enterprise</option>
              <option>Standard</option>
              <option>Basic</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                <th className="py-4 px-6">Estate Name</th>
                <th className="py-4 px-6">Owner</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6">Tier</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Date Added</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isEstatesLoading ? (
                <tr><td colSpan={7} className="py-12"><TableSkeleton rows={5} cols={7} /></td></tr>
              ) : estates.map((estate) => (
                <tr key={estate.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{estate.name}</td>
                  <td className="py-4 px-6 font-bold text-gray-500">{estate.owner}</td>
                  <td className="py-4 px-6 font-bold text-gray-500">{estate.city}</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                      {estate.tier}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                      <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                      {estate.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-400">{estate.date}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setSelectedEstateId(estate.id);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setEditingEstate(estate);
                          setIsEditModalOpen(true);
                        }}
                        className="text-gray-500 hover:text-gray-700 p-1"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-rose-500 hover:text-rose-700 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderResidentsView = () => (
    <div className="space-y-6">
      {/* Residents Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manage Residents</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all registered residents</p>
        </div>
        <button 
          onClick={() => setIsAddResidentModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add New Resident
        </button>
      </div>

      {/* Residents Table */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/30">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search residents..." 
              className="w-full text-xs pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-white outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <select 
              value={activeResidentTabState}
              onChange={(e) => setActiveResidentTabState(e.target.value as any)}
              className="text-xs font-bold border border-gray-200 rounded-lg px-3 py-1.5 bg-white outline-none"
            >
              <option value="All">All Locations</option>
              <option value="Lagos">Lagos</option>
              <option value="Abuja">Abuja</option>
              <option value="Port Harcourt">Port Harcourt</option>
            </select>
            <select className="text-xs font-bold border border-gray-200 rounded-lg px-3 py-1.5 bg-white outline-none">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                <th className="py-4 px-6">Resident Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Phone</th>
                <th className="py-4 px-6">Estate</th>
                <th className="py-4 px-6">House No</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Date Joined</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {residents.map((resident) => (
                <tr key={resident.id} className="hover:bg-slate-50/50 transition-colors">
                  <td 
                    className="py-4 px-6 font-bold text-slate-900 cursor-pointer hover:text-blue-600"
                    onClick={() => {
                      setSelectedResidentId(resident.id);
                    }}
                  >
                    {resident.name}
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-500">{resident.email}</td>
                  <td className="py-4 px-6 font-bold text-gray-500 font-mono">{resident.phone}</td>
                  <td className="py-4 px-6 font-bold text-gray-500">{resident.estate}</td>
                  <td className="py-4 px-6 font-black text-blue-600">{resident.houseNo}</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                      <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                      {resident.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-400">{resident.joinedDate}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setEditingResident(resident);
                          setIsEditResidentModalOpen(true);
                        }}
                        className="text-gray-500 hover:text-gray-700 p-1"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-rose-500 hover:text-rose-700 p-1">
                        <UserX className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStaffView = () => (
    <div className="space-y-6">
      {/* Staff Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manage Staff</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all estate staff members</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
          <Plus className="h-4 w-4" />
          Add New Staff
        </button>
      </div>

      {/* Staff Filters */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search staff..." 
              value={staffSearchText}
              onChange={(e) => setStaffSearchText(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-white outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select 
            value={staffStatusFilter}
            onChange={(e) => setStaffStatusFilter(e.target.value)}
            className="text-xs font-bold border border-gray-200 rounded-xl px-3 py-2 bg-white outline-none"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select 
            value={staffShiftFilter}
            onChange={(e) => setStaffShiftFilter(e.target.value)}
            className="text-xs font-bold border border-gray-200 rounded-xl px-3 py-2 bg-white outline-none"
          >
            <option value="All">All Shifts</option>
            <option value="Morning">Morning</option>
            <option value="Night">Night</option>
            <option value="Full Time">Full Time</option>
            <option value="Live - in">Live-in</option>
            <option value="Daytime">Daytime</option>
          </select>
          <select 
            value={staffTypeFilter}
            onChange={(e) => setStaffTypeFilter(e.target.value)}
            className="text-xs font-bold border border-gray-200 rounded-xl px-3 py-2 bg-white outline-none"
          >
            <option value="All">All Roles</option>
            <option value="Security">Security</option>
            <option value="Cleaner">Cleaner</option>
            <option value="Chef">Chef</option>
            <option value="Driver">Driver</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                <th className="py-4 px-6">Staff Name</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Assigned To</th>
                <th className="py-4 px-6">Estate</th>
                <th className="py-4 px-6">Shift</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Date Added</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                  <td 
                    className="py-4 px-6 font-bold text-slate-900 cursor-pointer hover:text-blue-600"
                    onClick={() => setSelectedStaff(staff)}
                  >
                    {staff.name}
                  </td>
                  <td className="py-4 px-6 font-bold text-blue-600">{staff.role}</td>
                  <td className="py-4 px-6 font-bold text-gray-500">{staff.assignedTo}</td>
                  <td className="py-4 px-6 font-bold text-gray-500">{staff.estate}</td>
                  <td className="py-4 px-6 font-bold text-gray-500">{staff.shift}</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                      <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                      {staff.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-400">{staff.added}</td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-gray-300 hover:text-slate-900 p-1">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAdminsView = () => (
    <div className="space-y-6">
      {/* Admins Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manage Admins</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage platform administrators</p>
        </div>
        <button 
          onClick={() => setIsAdminModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add New Admin
        </button>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-slate-50/30">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search admins..." 
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
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Last Activity</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isAdminsLoading ? (
                <tr><td colSpan={6} className="py-12"><TableSkeleton rows={5} cols={6} /></td></tr>
              ) : adminsList.map((admin) => (
                <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{admin.name}</td>
                  <td className="py-4 px-6 font-bold text-gray-500 font-mono">{admin.email}</td>
                  <td className="py-4 px-6 font-bold text-indigo-600">{admin.role}</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                      <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                      {admin.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-400">{admin.lastActivity}</td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-gray-300 hover:text-slate-900 p-1">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderActiveView = () => {
    switch (activeMenu) {
      case "dashboard":
        return renderDashboardView();
      case "estates":
        return renderEstatesView();
      case "residents":
        return renderResidentsView();
      case "staff":
        return renderStaffView();
      case "admins":
        return renderAdminsView();
      default:
        return renderDashboardView();
    }
  };

  return (
    <div id="central-overall-admin-portal" className="bg-slate-50 min-h-screen font-sans flex text-slate-900">
      {/* Detail Views are shown inline within each tab below */}

      {/* SIDEBAR NAVIGATION CONTROLS - LIGHT THEME EXACT COMPLIANCE */}
      <aside className="hidden lg:flex flex-col w-64 bg-white shrink-0 border-r border-gray-200">
        
        {/* Profile Admin Badge */}
        <div className="p-5 border-b border-gray-100 bg-white flex items-center gap-3">
          <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow shadow-blue-200 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-extrabold block truncate text-slate-900">Overall Admin</span>
            <span className="text-[10px] text-gray-400 font-bold block tracking-tight">Vanguard Platforms</span>
          </div>
        </div>

        {/* Vertical Actions Navigation items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          
          <button
            onClick={() => navigate("/admin/dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMenu === "dashboard" ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 1H2C1.44772 1 1 1.44772 1 2V9C1 9.55229 1.44772 10 2 10H7C7.55228 10 8 9.55229 8 9V2C8 1.44772 7.55228 1 7 1Z" fill="#2563EB"/>
            <path d="M18 1H13C12.4477 1 12 1.44772 12 2V5C12 5.55228 12.4477 6 13 6H18C18.5523 6 19 5.55228 19 5V2C19 1.44772 18.5523 1 18 1Z" fill="#2563EB"/>
            <path d="M18 10H13C12.4477 10 12 10.4477 12 11V18C12 18.5523 12.4477 19 13 19H18C18.5523 19 19 18.5523 19 18V11C19 10.4477 18.5523 10 18 10Z" fill="#2563EB"/>
            <path d="M7 14H2C1.44772 14 1 14.4477 1 15V18C1 18.5523 1.44772 19 2 19H7C7.55228 19 8 18.5523 8 18V15C8 14.4477 7.55228 14 7 14Z" fill="#2563EB"/>
            <path d="M7 1H2C1.44772 1 1 1.44772 1 2V9C1 9.55229 1.44772 10 2 10H7C7.55228 10 8 9.55229 8 9V2C8 1.44772 7.55228 1 7 1Z" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18 1H13C12.4477 1 12 1.44772 12 2V5C12 5.55228 12.4477 6 13 6H18C18.5523 6 19 5.55228 19 5V2C19 1.44772 18.5523 1 18 1Z" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18 10H13C12.4477 10 12 10.4477 12 11V18C12 18.5523 12.4477 19 13 19H18C18.5523 19 19 18.5523 19 18V11C19 10.4477 18.5523 10 18 10Z" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7 14H2C1.44772 14 1 14.4477 1 15V18C1 18.5523 1.44772 19 2 19H7C7.55228 19 8 18.5523 8 18V15C8 14.4477 7.55228 14 7 14Z" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Dashboard</span>
          </button>

          {/* Collapsible Estate Management Menu */}
          <div>
            <button
              onClick={() => setIsEstateMenuExpanded(!isEstateMenuExpanded)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clip-path="url(#clip0_683_977)">
                  <path d="M22.5 19.5H21.75V6.75C21.75 6.55109 21.671 6.36032 21.5303 6.21967C21.3897 6.07902 21.1989 6 21 6H17.25V3.75C17.25 3.55109 17.171 3.36032 17.0303 3.21967C16.8897 3.07902 16.6989 3 16.5 3H7.5C7.30109 3 7.11032 3.07902 6.96967 3.21967C6.82902 3.36032 6.75 3.55109 6.75 3.75V9H3C2.80109 9 2.61032 9.07902 2.46967 9.21967C2.32902 9.36032 2.25 9.55109 2.25 9.75V19.5H1.5C1.30109 19.5 1.11032 19.579 0.96967 19.7197C0.829018 19.8603 0.75 20.0511 0.75 20.25C0.75 20.4489 0.829018 20.6397 0.96967 20.7803C1.11032 20.921 1.30109 21 1.5 21H22.5C22.6989 21 22.8897 20.921 23.0303 20.7803C23.171 20.6397 23.25 20.4489 23.25 20.25C23.25 20.0511 23.171 19.8603 23.0303 19.7197C22.8897 19.579 22.6989 19.5 22.5 19.5ZM7.5 16.5H6C5.80109 16.5 5.61032 16.421 5.46967 16.2803C5.32902 16.1397 5.25 15.9489 5.25 15.75C5.25 15.5511 5.32902 15.3603 5.46967 15.2197C5.61032 15.079 5.80109 15 6 15H7.5C7.69891 15 7.88968 15.079 8.03033 15.2197C8.17098 15.3603 8.25 15.5511 8.25 15.75C8.25 15.9489 8.17098 16.1397 8.03033 16.2803C7.88968 16.421 7.69891 16.5 7.5 16.5ZM7.5 13.5H6C5.80109 13.5 5.61032 13.421 5.46967 13.2803C5.32902 13.1397 5.25 12.9489 5.25 12.75C5.25 12.5511 5.32902 12.3603 5.46967 12.2197C5.61032 12.079 5.80109 12 6 12H7.5C7.69891 12 7.88968 12.079 8.03033 12.2197C8.17098 12.3603 8.25 12.5511 8.25 12.75C8.25 12.9489 8.17098 13.1397 8.03033 13.2803C7.88968 13.421 7.69891 13.5 7.5 13.5ZM13.5 19.5H10.5V15.75H13.5V19.5ZM12.75 13.5H11.25C11.0511 13.5 10.8603 13.421 10.7197 13.2803C10.579 13.1397 10.5 12.9489 10.5 12.75C10.5 12.5511 10.579 12.3603 10.7197 12.2197C10.8603 12.079 11.0511 12 11.25 12H12.75C12.9489 12 13.1397 12.079 13.2803 12.2197C13.421 12.3603 13.5 12.5511 13.5 12.75C13.5 12.9489 13.421 13.1397 13.2803 13.2803C13.1397 13.421 12.9489 13.5 12.75 13.5ZM12.75 10.5H11.25C11.0511 10.5 10.8603 10.421 10.7197 10.2803C10.579 10.1397 10.5 9.94891 10.5 9.75C10.5 9.55109 10.579 9.36032 10.7197 9.21967C10.8603 9.07902 11.0511 9 11.25 9H12.75C12.9489 9 13.1397 9.07902 13.2803 9.21967C13.421 9.36032 13.5 9.55109 13.5 9.75C13.5 9.94891 13.421 10.1397 13.2803 10.2803C13.1397 10.421 12.9489 10.5 12.75 10.5ZM12.75 7.5H11.25C11.0511 7.5 10.8603 7.42098 10.7197 7.28033C10.579 7.13968 10.5 6.94891 10.5 6.75C10.5 6.55109 10.579 6.36032 10.7197 6.21967C10.8603 6.07902 11.0511 6 11.25 6H12.75C12.9489 6 13.1397 6.07902 13.2803 6.21967C13.421 6.36032 13.5 6.55109 13.5 6.75C13.5 6.94891 13.421 7.13968 13.2803 7.28033C13.1397 7.42098 12.9489 7.5 12.75 7.5ZM18 16.5H16.5C16.3011 16.5 16.1103 16.421 15.9697 16.2803C15.829 16.1397 15.75 15.9489 15.75 15.75C15.75 15.5511 15.829 15.3603 15.9697 15.2197C16.1103 15.079 16.3011 15 16.5 15H18C18.1989 15 18.3897 15.079 18.5303 15.2197C18.671 15.3603 18.75 15.5511 18.75 15.75C18.75 15.9489 18.671 16.1397 18.5303 16.2803C18.3897 16.421 18.1989 16.5 18 16.5ZM18 13.5H16.5C16.3011 13.5 16.1103 13.421 15.9697 13.2803C15.829 13.1397 15.75 12.9489 15.75 12.75C15.75 12.5511 15.829 12.3603 15.9697 12.2197C16.1103 12.079 16.3011 12 16.5 12H18C18.1989 12 18.3897 12.079 18.5303 12.2197C18.671 12.3603 18.75 12.5511 18.75 12.75C18.75 12.9489 18.671 13.1397 18.5303 13.2803C18.3897 13.421 18.1989 13.5 18 13.5ZM18 10.5H16.5C16.3011 10.5 16.1103 10.421 15.9697 10.2803C15.829 10.1397 15.75 9.94891 15.75 9.75C15.75 9.55109 15.829 9.36032 15.9697 9.21967C16.1103 9.07902 16.3011 9 16.5 9H18C18.1989 9 18.3897 9.07902 18.5303 9.21967C18.671 9.36032 18.75 9.55109 18.75 9.75C18.75 9.94891 18.671 10.1397 18.5303 10.2803C18.3897 10.421 18.1989 10.5 18 10.5Z" fill="#6B7280"/>
                  <path d="M24 15.5992C24 18.5987 21.8125 20.0984 19.2125 20.9683C19.0764 21.0125 18.9285 21.0104 18.7937 20.9623C16.1875 20.0984 14 18.5987 14 15.5992V11.3999C14 11.2408 14.0658 11.0882 14.1831 10.9757C14.3003 10.8632 14.4592 10.8 14.625 10.8C15.875 10.8 17.4375 10.0801 18.525 9.16824C18.6574 9.05966 18.8258 9 19 9C19.1742 9 19.3426 9.05966 19.475 9.16824C20.5688 10.0861 22.125 10.8 23.375 10.8C23.5408 10.8 23.6997 10.8632 23.8169 10.9757C23.9342 11.0882 24 11.2408 24 11.3999V15.5992Z" fill="#6B7280"/>
                  <path d="M15.485 19.1446C15.7517 18.456 16.2315 17.8622 16.86 17.443C17.4885 17.0238 18.2356 16.7992 19.001 16.7994C19.7663 16.7996 20.5133 17.0246 21.1416 17.4441C21.7698 17.8637 22.2493 18.4577 22.5156 19.1464" fill="#6B7280"/>
                  <path d="M19 16.799C20.3807 16.799 21.5 15.7246 21.5 14.3994C21.5 13.0741 20.3807 11.9998 19 11.9998C17.6193 11.9998 16.5 13.0741 16.5 14.3994C16.5 15.7246 17.6193 16.799 19 16.799Z" fill="#6B7280"/>
                  <path d="M15.485 19.1446C15.7517 18.456 16.2315 17.8622 16.86 17.443C17.4885 17.0238 18.2356 16.7992 19.001 16.7994C19.7663 16.7996 20.5133 17.0246 21.1416 17.4441C21.7698 17.8637 22.2493 18.4577 22.5156 19.1464M24 15.5992C24 18.5987 21.8125 20.0984 19.2125 20.9683C19.0764 21.0125 18.9285 21.0104 18.7937 20.9623C16.1875 20.0984 14 18.5987 14 15.5992V11.3999C14 11.2408 14.0658 11.0882 14.1831 10.9757C14.3003 10.8632 14.4592 10.8 14.625 10.8C15.875 10.8 17.4375 10.0801 18.525 9.16824C18.6574 9.05966 18.8258 9 19 9C19.1742 9 19.3426 9.05966 19.475 9.16824C20.5688 10.0861 22.125 10.8 23.375 10.8C23.5408 10.8 23.6997 10.8632 23.8169 10.9757C23.9342 11.0882 24 11.2408 24 11.3999V15.5992ZM21.5 14.3994C21.5 15.7246 20.3807 16.799 19 16.799C17.6193 16.799 16.5 15.7246 16.5 14.3994C16.5 13.0741 17.6193 11.9998 19 11.9998C20.3807 11.9998 21.5 13.0741 21.5 14.3994Z" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                  </g>
                  <defs>
                  <clipPath id="clip0_683_977">
                  <rect width="24" height="24" fill="white"/>
                  </clipPath>
                  </defs>
                  </svg>

                <span>Estate Management</span>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isEstateMenuExpanded ? "rotate-180" : ""}`} />
            </button>

            {isEstateMenuExpanded && (
              <div className="ml-6 mt-1 space-y-1 pl-2 border-l border-gray-100">
                <button
                  onClick={() => navigate("/admin/estates")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeMenu === "estates" ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <span>Estates</span>
                  <span className="text-[9px] bg-slate-100 text-slate-500 font-black px-1.5 py-0.5 rounded-full">
                    {estates.length}
                  </span>
                </button>

                <button
                  onClick={() => navigate("/admin/residents")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeMenu === "residents" ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <span>Residents</span>
                  <span className="text-[9px] bg-slate-100 text-slate-500 font-black px-1.5 py-0.5 rounded-full">
                    {residents.length}
                  </span>
                </button>

                <button
                  onClick={() => navigate("/admin/staff")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeMenu === "staff" ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <span>Staff</span>
                  <span className="text-[9px] bg-slate-100 text-slate-500 font-black px-1.5 py-0.5 rounded-full">
                    {staffList.length}
                  </span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/admin/plans")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMenu === "plans" ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 7.5V16.5C18 16.8978 17.842 17.2794 17.5607 17.5607C17.2794 17.842 16.8978 18 16.5 18H1.5C1.10218 18 0.720644 17.842 0.43934 17.5607C0.158035 17.2794 0 16.8978 0 16.5V7.5C0 7.10218 0.158035 6.72064 0.43934 6.43934C0.720644 6.15804 1.10218 6 1.5 6H16.5C16.8978 6 17.2794 6.15804 17.5607 6.43934C17.842 6.72064 18 7.10218 18 7.5ZM2.25 4.5H15.75C15.9489 4.5 16.1397 4.42098 16.2803 4.28033C16.421 4.13968 16.5 3.94891 16.5 3.75C16.5 3.55109 16.421 3.36032 16.2803 3.21967C16.1397 3.07902 15.9489 3 15.75 3H2.25C2.05109 3 1.86032 3.07902 1.71967 3.21967C1.57902 3.36032 1.5 3.55109 1.5 3.75C1.5 3.94891 1.57902 4.13968 1.71967 4.28033C1.86032 4.42098 2.05109 4.5 2.25 4.5ZM3.75 1.5H14.25C14.4489 1.5 14.6397 1.42098 14.7803 1.28033C14.921 1.13968 15 0.948912 15 0.75C15 0.551088 14.921 0.360322 14.7803 0.21967C14.6397 0.0790176 14.4489 0 14.25 0H3.75C3.55109 0 3.36032 0.0790176 3.21967 0.21967C3.07902 0.360322 3 0.551088 3 0.75C3 0.948912 3.07902 1.13968 3.21967 1.28033C3.36032 1.42098 3.55109 1.5 3.75 1.5Z" fill="#6B7280"/>
            </svg>

            <span>Subscription Plans</span>
          </button>

          <button
            onClick={() => navigate("/admin/admins")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMenu === "admins" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <ShieldCheck size={16} />
            <span>Admins</span>
          </button>

          <button
            onClick={() => navigate("/admin/billing")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMenu === "billing" ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.125 8.25C0.926088 8.25 0.735322 8.17098 0.59467 8.03033C0.454018 7.88968 0.375 7.69891 0.375 7.5C0.375 7.30109 0.454018 7.11032 0.59467 6.96967C0.735322 6.82902 0.926088 6.75 1.125 6.75H3.75C3.94891 6.75 4.13968 6.67098 4.28033 6.53033C4.42098 6.38968 4.5 6.19891 4.5 6C4.5 5.80109 4.42098 5.61032 4.28033 5.46967C4.13968 5.32902 3.94891 5.25 3.75 5.25H2.25C1.65326 5.25 1.08097 5.01295 0.65901 4.59099C0.237053 4.16903 0 3.59674 0 3C0 2.40326 0.237053 1.83097 0.65901 1.40901C1.08097 0.987053 1.65326 0.75 2.25 0.75C2.25 0.551088 2.32902 0.360322 2.46967 0.21967C2.61032 0.0790178 2.80109 0 3 0C3.19891 0 3.38968 0.0790178 3.53033 0.21967C3.67098 0.360322 3.75 0.551088 3.75 0.75H4.5C4.69891 0.75 4.88968 0.829018 5.03033 0.96967C5.17098 1.11032 5.25 1.30109 5.25 1.5C5.25 1.69891 5.17098 1.88968 5.03033 2.03033C4.88968 2.17098 4.69891 2.25 4.5 2.25H2.25C2.05109 2.25 1.86032 2.32902 1.71967 2.46967C1.57902 2.61032 1.5 2.80109 1.5 3C1.5 3.19891 1.57902 3.38968 1.71967 3.53033C1.86032 3.67098 2.05109 3.75 2.25 3.75H3.75C4.34674 3.75 4.91903 3.98705 5.34099 4.40901C5.76295 4.83097 6 5.40326 6 6C6 6.59674 5.76295 7.16903 5.34099 7.59099C4.91903 8.01295 4.34674 8.25 3.75 8.25C3.75 8.44891 3.67098 8.63968 3.53033 8.78033C3.38968 8.92098 3.19891 9 3 9C2.80109 9 2.61032 8.92098 2.46967 8.78033C2.32902 8.63968 2.25 8.44891 2.25 8.25H1.125ZM19.5 0.75H7.5C7.30109 0.75 7.11032 0.829018 6.96967 0.96967C6.82902 1.11032 6.75 1.30109 6.75 1.5C6.75 1.69891 6.82902 1.88968 6.96967 2.03033C7.11032 2.17098 7.30109 2.25 7.5 2.25H18.75V5.25H8.25C8.05109 5.25 7.86032 5.32902 7.71967 5.46967C7.57902 5.61032 7.5 5.80109 7.5 6C7.5 6.19891 7.57902 6.38968 7.71967 6.53033C7.86032 6.67098 8.05109 6.75 8.25 6.75H13.5V9.75H6C5.80109 9.75 5.61032 9.82902 5.46967 9.96967C5.32902 10.1103 5.25 10.3011 5.25 10.5C5.25 10.6989 5.32902 10.8897 5.46967 11.0303C5.61032 11.171 5.80109 11.25 6 11.25H13.5V14.25H2.25V10.5C2.25 10.3011 2.17098 10.1103 2.03033 9.96967C1.88968 9.82902 1.69891 9.75 1.5 9.75C1.30109 9.75 1.11032 9.82902 0.96967 9.96967C0.829018 10.1103 0.75 10.3011 0.75 10.5V14.25C0.75 14.6478 0.908035 15.0294 1.18934 15.3107C1.47064 15.592 1.85218 15.75 2.25 15.75H18.75C19.1478 15.75 19.5294 15.592 19.8107 15.3107C20.092 15.0294 20.25 14.6478 20.25 14.25V1.5C20.25 1.30109 20.171 1.11032 20.0303 0.96967C19.8897 0.829018 19.6989 0.75 19.5 0.75Z" fill="#6B7280"/>
            </svg>

            <span>Revenue & Billing</span>
          </button>

          <div className="pt-4 pb-1 text-[9px] font-black uppercase tracking-wider text-gray-400 px-3">
            Support & Logs
          </div>

          <button
            onClick={() => navigate("/admin/tickets")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMenu === "tickets" ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 7.5V16.5C18 16.8978 17.842 17.2794 17.5607 17.5607C17.2794 17.842 16.8978 18 16.5 18H1.5C1.10218 18 0.720644 17.842 0.43934 17.5607C0.158035 17.2794 0 16.8978 0 16.5V7.5C0 7.10218 0.158035 6.72064 0.43934 6.43934C0.720644 6.15804 1.10218 6 1.5 6H16.5C16.8978 6 17.2794 6.15804 17.5607 6.43934C17.842 6.72064 18 7.10218 18 7.5ZM2.25 4.5H15.75C15.9489 4.5 16.1397 4.42098 16.2803 4.28033C16.421 4.13968 16.5 3.94891 16.5 3.75C16.5 3.55109 16.421 3.36032 16.2803 3.21967C16.1397 3.07902 15.9489 3 15.75 3H2.25C2.05109 3 1.86032 3.07902 1.71967 3.21967C1.57902 3.36032 1.5 3.55109 1.5 3.75C1.5 3.94891 1.57902 4.13968 1.71967 4.28033C1.86032 4.42098 2.05109 4.5 2.25 4.5ZM3.75 1.5H14.25C14.4489 1.5 14.6397 1.42098 14.7803 1.28033C14.921 1.13968 15 0.948912 15 0.75C15 0.551088 14.921 0.360322 14.7803 0.21967C14.6397 0.0790176 14.4489 0 14.25 0H3.75C3.55109 0 3.36032 0.0790176 3.21967 0.21967C3.07902 0.360322 3 0.551088 3 0.75C3 0.948912 3.07902 1.13968 3.21967 1.28033C3.36032 1.42098 3.55109 1.5 3.75 1.5Z" fill="#6B7280"/>
            </svg>

            <span>Support Tickets</span>
          </button>

          <button
            onClick={() => navigate("/admin/logs")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMenu === "logs" ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <FileText className="h-4.5 w-4.5" />
            <span>System Logs</span>
          </button>

          <button
            onClick={() => navigate("/admin/settings")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMenu === "settings" ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <NotebookHelperIcon className="h-4.5 w-4.5" />
            <span>Settings</span>
          </button>

          <div className="pt-2 border-t border-gray-100 my-1">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all cursor-pointer"
            >
              <Power className="h-4.5 w-4.5 text-rose-600" />
              <span>Sign Out</span>
            </button>
          </div>

        </nav>

        {/* PLATFORM STATUS widget exact to image bottom left */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <span className="text-[9px] font-black text-emerald-800 tracking-wider block uppercase mb-1">Platform Status</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All system normal</span>
            </div>
          </div>
        </div>

      </aside>

      {/* RIGHT COLUMN: header + content + footer */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER TOP BAR - collapsible search on mobile */}
        <header className="px-2 sm:px-6 py-3 sm:py-4.5 bg-white border-b border-gray-150 flex items-center justify-between shrink-0 min-h-[56px]">
          {/* Left section: hamburger + search */}
          <div className="flex items-center gap-1 sm:gap-3 flex-1 min-w-0">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 shrink-0"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5 text-slate-700" />
            </button>

            {/* Search: icon on mobile, full input on desktop */}
            <button
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 shrink-0"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Open search"
            >
              <Search className="h-4 w-4 text-gray-500" />
            </button>

            {/* Desktop search input */}
            <div className="hidden lg:block relative w-64 xl:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search estates, admins or systems..."
                className="w-full text-sm pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Notification bell */}
            <div className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200 cursor-pointer hover:bg-gray-100">
              <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-700" />
              <span className="absolute top-1.5 right-2 sm:top-2 sm:right-2.5 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-blue-600 rounded-full" />
            </div>

            {/* Profile: avatar only on mobile, with text on desktop */}
            <div className="flex items-center gap-2 sm:gap-3 border-l border-gray-200 pl-2 sm:pl-4 py-1">
              <div className="hidden sm:block text-right">
                <span className="text-xs font-extrabold text-slate-950 block leading-tight">{adminName}</span>
                <span className="text-[9.5px] text-gray-400 font-semibold block uppercase">Global Administrator</span>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt={adminName} 
                referrerPolicy="no-referrer"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-gray-150 object-cover shadow-sm bg-gray-200 shrink-0" 
              />
            </div>

            {/* Logout Button */}
            <button 
              onClick={onLogout}
              className="h-8 sm:h-9 px-2 sm:px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] sm:text-xs flex items-center gap-1 transition-all cursor-pointer border border-rose-100 shrink-0"
              title="Sign Out"
            >
              <Power className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Mobile full-screen search overlay */}
        {isSearchOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col">
            <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-150">
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100 shrink-0"
                aria-label="Close search"
              >
                <ArrowLeft className="h-5 w-5 text-slate-700" />
              </button>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search estates, admins or systems..."
                  className="w-full text-sm pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center text-xs text-gray-400 font-bold">
              Type to search...
            </div>
          </div>
        )}

        {/* Mobile sidebar drawer */}
        <div className={`lg:hidden`}> 
          <div className={`fixed inset-0 z-40 ${isMobileNavOpen ? '' : 'pointer-events-none'}`}>
            <div
              className={`fixed inset-0 bg-black/40 transition-opacity ${isMobileNavOpen ? 'opacity-100' : 'opacity-0'}`}
              onClick={() => setIsMobileNavOpen(false)}
              aria-hidden
            />

            <aside className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 transform transition-transform ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-sm font-black tracking-tight text-slate-900 block leading-tight">Overall Admin</span>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase leading-none tracking-tight">Vanguard</span>
                  </div>
                </div>
                <button onClick={() => setIsMobileNavOpen(false)} className="p-2 rounded-md hover:bg-gray-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="p-3 space-y-1 overflow-y-auto h-full">
                <button onClick={() => { navigate("/admin/dashboard"); setIsMobileNavOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeMenu === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 1H2C1.44772 1 1 1.44772 1 2V9C1 9.55229 1.44772 10 2 10H7C7.55228 10 8 9.55229 8 9V2C8 1.44772 7.55228 1 7 1Z" fill="#2563EB"/>
                  <path d="M18 1H13C12.4477 1 12 1.44772 12 2V5C12 5.55228 12.4477 6 13 6H18C18.5523 6 19 5.55228 19 5V2C19 1.44772 18.5523 1 18 1Z" fill="#2563EB"/>
                  <path d="M18 10H13C12.4477 10 12 10.4477 12 11V18C12 18.5523 12.4477 19 13 19H18C18.5523 19 19 18.5523 19 18V11C19 10.4477 18.5523 10 18 10Z" fill="#2563EB"/>
                  <path d="M7 14H2C1.44772 14 1 14.4477 1 15V18C1 18.5523 1.44772 19 2 19H7C7.55228 19 8 18.5523 8 18V15C8 14.4477 7.55228 14 7 14Z" fill="#2563EB"/>
                  <path d="M7 1H2C1.44772 1 1 1.44772 1 2V9C1 9.55229 1.44772 10 2 10H7C7.55228 10 8 9.55229 8 9V2C8 1.44772 7.55228 1 7 1Z" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18 1H13C12.4477 1 12 1.44772 12 2V5C12 5.55228 12.4477 6 13 6H18C18.5523 6 19 5.55228 19 5V2C19 1.44772 18.5523 1 18 1Z" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18 10H13C12.4477 10 12 10.4477 12 11V18C12 18.5523 12.4477 19 13 19H18C18.5523 19 19 18.5523 19 18V11C19 10.4477 18.5523 10 18 10Z" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M7 14H2C1.44772 14 1 14.4477 1 15V18C1 18.5523 1.44772 19 2 19H7C7.55228 19 8 18.5523 8 18V15C8 14.4477 7.55228 14 7 14Z" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Dashboard</span>
                </button>

                <div>
                  <button onClick={() => setIsEstateMenuExpanded(!isEstateMenuExpanded)} className="w-full flex items-center justify-between px-3 py-2.5 text-slate-700 rounded-xl text-sm font-bold">
                    <div className="flex items-center gap-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clip-path="url(#clip0_683_977)">
                      <path d="M22.5 19.5H21.75V6.75C21.75 6.55109 21.671 6.36032 21.5303 6.21967C21.3897 6.07902 21.1989 6 21 6H17.25V3.75C17.25 3.55109 17.171 3.36032 17.0303 3.21967C16.8897 3.07902 16.6989 3 16.5 3H7.5C7.30109 3 7.11032 3.07902 6.96967 3.21967C6.82902 3.36032 6.75 3.55109 6.75 3.75V9H3C2.80109 9 2.61032 9.07902 2.46967 9.21967C2.32902 9.36032 2.25 9.55109 2.25 9.75V19.5H1.5C1.30109 19.5 1.11032 19.579 0.96967 19.7197C0.829018 19.8603 0.75 20.0511 0.75 20.25C0.75 20.4489 0.829018 20.6397 0.96967 20.7803C1.11032 20.921 1.30109 21 1.5 21H22.5C22.6989 21 22.8897 20.921 23.0303 20.7803C23.171 20.6397 23.25 20.4489 23.25 20.25C23.25 20.0511 23.171 19.8603 23.0303 19.7197C22.8897 19.579 22.6989 19.5 22.5 19.5ZM7.5 16.5H6C5.80109 16.5 5.61032 16.421 5.46967 16.2803C5.32902 16.1397 5.25 15.9489 5.25 15.75C5.25 15.5511 5.32902 15.3603 5.46967 15.2197C5.61032 15.079 5.80109 15 6 15H7.5C7.69891 15 7.88968 15.079 8.03033 15.2197C8.17098 15.3603 8.25 15.5511 8.25 15.75C8.25 15.9489 8.17098 16.1397 8.03033 16.2803C7.88968 16.421 7.69891 16.5 7.5 16.5ZM7.5 13.5H6C5.80109 13.5 5.61032 13.421 5.46967 13.2803C5.32902 13.1397 5.25 12.9489 5.25 12.75C5.25 12.5511 5.32902 12.3603 5.46967 12.2197C5.61032 12.079 5.80109 12 6 12H7.5C7.69891 12 7.88968 12.079 8.03033 12.2197C8.17098 12.3603 8.25 12.5511 8.25 12.75C8.25 12.9489 8.17098 13.1397 8.03033 13.2803C7.88968 13.421 7.69891 13.5 7.5 13.5ZM13.5 19.5H10.5V15.75H13.5V19.5ZM12.75 13.5H11.25C11.0511 13.5 10.8603 13.421 10.7197 13.2803C10.579 13.1397 10.5 12.9489 10.5 12.75C10.5 12.5511 10.579 12.3603 10.7197 12.2197C10.8603 12.079 11.0511 12 11.25 12H12.75C12.9489 12 13.1397 12.079 13.2803 12.2197C13.421 12.3603 13.5 12.5511 13.5 12.75C13.5 12.9489 13.421 13.1397 13.2803 13.2803C13.1397 13.421 12.9489 13.5 12.75 13.5ZM12.75 10.5H11.25C11.0511 10.5 10.8603 10.421 10.7197 10.2803C10.579 10.1397 10.5 9.94891 10.5 9.75C10.5 9.55109 10.579 9.36032 10.7197 9.21967C10.8603 9.07902 11.0511 9 11.25 9H12.75C12.9489 9 13.1397 9.07902 13.2803 9.21967C13.421 9.36032 13.5 9.55109 13.5 9.75C13.5 9.94891 13.421 10.1397 13.2803 10.2803C13.1397 10.421 12.9489 10.5 12.75 10.5ZM12.75 7.5H11.25C11.0511 7.5 10.8603 7.42098 10.7197 7.28033C10.579 7.13968 10.5 6.94891 10.5 6.75C10.5 6.55109 10.579 6.36032 10.7197 6.21967C10.8603 6.07902 11.0511 6 11.25 6H12.75C12.9489 6 13.1397 6.07902 13.2803 6.21967C13.421 6.36032 13.5 6.5511 13.5 6.75C13.5 6.94891 13.421 7.13968 13.2803 7.28033C13.1397 7.42098 12.9489 7.5 12.75 7.5ZM18 16.5H16.5C16.3011 16.5 16.1103 16.421 15.9697 16.2803C15.829 16.1397 15.75 15.9489 15.75 15.75C15.75 15.5511 15.829 15.3603 15.9697 15.2197C16.1103 15.079 16.3011 15 16.5 15H18C18.1989 15 18.3897 15.079 18.5303 15.2197C18.671 15.3603 18.75 15.5511 18.75 15.75C18.75 15.9489 18.671 16.1397 18.5303 16.2803C18.3897 16.421 18.1989 16.5 18 16.5ZM18 13.5H16.5C16.3011 13.5 16.1103 13.421 15.9697 13.2803C15.829 13.1397 15.75 12.9489 15.75 12.75C15.75 12.5511 15.829 12.3603 15.9697 12.2197C16.1103 12.079 16.3011 12 16.5 12H18C18.1989 12 18.3897 12.079 18.5303 12.2197C18.671 12.3603 18.75 12.5511 18.75 12.75C18.75 12.9489 18.671 13.1397 18.5303 13.2803C18.3897 13.421 18.1989 13.5 18 13.5Z" fill="#6B7280"/>
                      <path d="M24 15.5992C24 18.5987 21.8125 20.0984 19.2125 20.9683C19.0764 21.0125 18.9285 21.0104 18.7937 20.9623C16.1875 20.0984 14 18.5987 14 15.5992V11.3999C14 11.2408 14.0658 11.0882 14.1831 10.9757C14.3003 10.8632 14.4592 10.8 14.625 10.8C15.875 10.8 17.4375 10.0801 18.525 9.16824C18.6574 9.05966 18.8258 9 19 9C19.1742 9 19.3426 9.05966 19.475 9.16824C20.5688 10.0861 22.125 10.8 23.375 10.8C23.5408 10.8 23.6997 10.8632 23.8169 10.9757C23.9342 11.0882 24 11.2408 24 11.3999V15.5992Z" fill="#6B7280"/>
                      <path d="M15.485 19.1446C15.7517 18.456 16.2315 17.8622 16.86 17.443C17.4885 17.0238 18.2356 16.7992 19.001 16.7994C19.7663 16.7996 20.5133 17.0246 21.1416 17.4441C21.7698 17.8637 22.2493 18.4577 22.5156 19.1464" fill="#6B7280"/>
                      <path d="M19 16.799C20.3807 16.799 21.5 15.7246 21.5 14.3994C21.5 13.0741 20.3807 11.9998 19 11.9998C17.6193 11.9998 16.5 13.0741 16.5 14.3994C16.5 15.7246 17.6193 16.799 19 16.799Z" fill="#6B7280"/>
                      <path d="M15.485 19.1446C15.7517 18.456 16.2315 17.8622 16.86 17.443C17.4885 17.0238 18.2356 16.7992 19.001 16.7994C19.7663 16.7996 20.5133 17.0246 21.1416 17.4441C21.7698 17.8637 22.2493 18.4577 22.5156 19.1464M24 15.5992C24 18.5987 21.8125 20.0984 19.2125 20.9683C19.0764 21.0125 18.9285 21.0104 18.7937 20.9623C16.1875 20.0984 14 18.5987 14 15.5992V11.3999C14 11.2408 14.0658 11.0882 14.1831 10.9757C14.3003 10.8632 14.4592 10.8 14.625 10.8C15.875 10.8 17.4375 10.0801 18.525 9.16824C18.6574 9.05966 18.8258 9 19 9C19.1742 9 19.3426 9.05966 19.475 9.16824C20.5688 10.0861 22.125 10.8 23.375 10.8C23.5408 10.8 23.6997 10.8632 23.8169 10.9757C23.9342 11.0882 24 11.2408 24 11.3999V15.5992ZM21.5 14.3994C21.5 15.7246 20.3807 16.799 19 16.799C17.6193 16.799 16.5 15.7246 16.5 14.3994C16.5 13.0741 17.6193 11.9998 19 11.9998C20.3807 11.9998 21.5 13.0741 21.5 14.3994Z" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                      </g>
                      <defs>
                      <clipPath id="clip0_683_977">
                      <rect width="24" height="24" fill="white"/>
                      </clipPath>
                      </defs>
                      </svg>
                      <span>Estate Management</span>
                    </div>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isEstateMenuExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {isEstateMenuExpanded && (
                    <div className="ml-6 mt-1 space-y-1 pl-2 border-l border-gray-100">
                      <button onClick={() => { navigate("/admin/estates"); setIsMobileNavOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold ${activeMenu === 'estates' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
                        <span>Estates</span>
                        <span className="text-[9px] bg-slate-100 text-slate-500 font-black px-1.5 py-0.5 rounded-full">{estates.length}</span>
                      </button>
                      <button onClick={() => { navigate("/admin/residents"); setIsMobileNavOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold ${activeMenu === 'residents' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
                        <span>Residents</span>
                        <span className="text-[9px] bg-slate-100 text-slate-500 font-black px-1.5 py-0.5 rounded-full">{residents.length}</span>
                      </button>
                      <button onClick={() => { navigate("/admin/staff"); setIsMobileNavOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold ${activeMenu === 'staff' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
                        <span>Staff</span>
                        <span className="text-[9px] bg-slate-100 text-slate-500 font-black px-1.5 py-0.5 rounded-full">{staffList.length}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-2 space-y-1">
                  <button onClick={() => { navigate("/admin/plans"); setIsMobileNavOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold ${activeMenu === 'plans' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 7.5V16.5C18 16.8978 17.842 17.2794 17.5607 17.5607C17.2794 17.842 16.8978 18 16.5 18H1.5C1.10218 18 0.720644 17.842 0.43934 17.5607C0.158035 17.2794 0 16.8978 0 16.5V7.5C0 7.10218 0.158035 6.72064 0.43934 6.43934C0.720644 6.15804 1.10218 6 1.5 6H16.5C16.8978 6 17.2794 6.15804 17.5607 6.43934C17.842 6.72064 18 7.10218 18 7.5ZM2.25 4.5H15.75C15.9489 4.5 16.1397 4.42098 16.2803 4.28033C16.421 4.13968 16.5 3.94891 16.5 3.75C16.5 3.55109 16.421 3.36032 16.2803 3.21967C16.1397 3.07902 15.9489 3 15.75 3H2.25C2.05109 3 1.86032 3.07902 1.71967 3.21967C1.57902 3.36032 1.5 3.55109 1.5 3.75C1.5 3.94891 1.57902 4.13968 1.71967 4.28033C1.86032 4.42098 2.05109 4.5 2.25 4.5ZM3.75 1.5H14.25C14.4489 1.5 14.6397 1.42098 14.7803 1.28033C14.921 1.13968 15 0.948912 15 0.75C15 0.551088 14.921 0.360322 14.7803 0.21967C14.6397 0.0790176 14.4489 0 14.25 0H3.75C3.55109 0 3.36032 0.0790176 3.21967 0.21967C3.07902 0.360322 3 0.551088 3 0.75C3 0.948912 3.07902 1.13968 3.21967 1.28033C3.36032 1.42098 3.55109 1.5 3.75 1.5Z" fill="#6B7280"/>
                    </svg>
                    <span>Subscription Plans</span>
                  </button>

                  <button onClick={() => { navigate("/admin/admins"); setIsMobileNavOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold ${activeMenu === 'admins' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.1334 4.03781L18.6966 3.78563C18.7478 3.51427 18.7478 3.23573 18.6966 2.96438L19.1334 2.71219C19.3058 2.61273 19.4315 2.4489 19.483 2.25673C19.5345 2.06457 19.5076 1.85981 19.4081 1.6875C19.3087 1.51519 19.1448 1.38945 18.9527 1.33794C18.7605 1.28642 18.5558 1.31336 18.3834 1.41281L17.9456 1.66594C17.7361 1.48618 17.4952 1.34665 17.235 1.25438V0.75C17.235 0.551088 17.156 0.360322 17.0153 0.21967C16.8747 0.0790176 16.6839 0 16.485 0C16.2861 0 16.0953 0.0790176 15.9547 0.21967C15.814 0.360322 15.735 0.551088 15.735 0.75V1.25438C15.4748 1.34665 15.2339 1.48618 15.0244 1.66594L14.5866 1.41281C14.5013 1.36357 14.4071 1.33161 14.3094 1.31876C14.2117 1.30591 14.1125 1.31243 14.0173 1.33794C13.9222 1.36344 13.833 1.40744 13.7548 1.46742C13.6767 1.5274 13.6111 1.60218 13.5619 1.6875C13.5126 1.77282 13.4807 1.867 13.4678 1.96467C13.455 2.06234 13.4615 2.16158 13.487 2.25673C13.5125 2.35188 13.5565 2.44108 13.6165 2.51923C13.6765 2.59737 13.7513 2.66294 13.8366 2.71219L14.2734 2.96438C14.2222 3.23573 14.2222 3.51427 14.2734 3.78563L13.8366 4.03781C13.6935 4.12033 13.5817 4.24775 13.5184 4.40032C13.4552 4.55289 13.4441 4.72206 13.4868 4.88159C13.5296 5.04112 13.6238 5.18208 13.7548 5.2826C13.8859 5.38311 14.0464 5.43756 14.2116 5.4375C14.3433 5.43791 14.4727 5.40329 14.5866 5.33719L15.0244 5.08406C15.2339 5.26382 15.4748 5.40335 15.735 5.49563V6C15.735 6.19891 15.814 6.38968 15.9547 6.53033C16.0953 6.67098 16.2861 6.75 16.485 6.75C16.6839 6.75 16.8747 6.67098 17.0153 6.53033C17.156 6.38968 17.235 6.19891 17.235 6V5.49563C17.4952 5.40335 17.7361 5.26382 17.9456 5.08406L18.3834 5.33719C18.4973 5.40329 18.6268 5.43791 18.7584 5.4375C18.9236 5.43756 19.0842 5.38311 19.2152 5.2826C19.3462 5.18208 19.4404 5.04112 19.4832 4.88159C19.5259 4.72206 19.5148 4.55289 19.4516 4.40032C19.3883 4.24775 19.2765 4.12033 19.1334 4.03781ZM16.485 4.125C16.3367 4.125 16.1917 4.08101 16.0683 3.9986C15.945 3.91619 15.8489 3.79906 15.7921 3.66201C15.7353 3.52497 15.7205 3.37417 15.7494 3.22868C15.7784 3.0832 15.8498 2.94956 15.9547 2.84467C16.0596 2.73978 16.1932 2.66835 16.3387 2.63941C16.4842 2.61047 16.635 2.62532 16.772 2.68209C16.9091 2.73886 17.0262 2.83499 17.1086 2.95832C17.191 3.08166 17.235 3.22666 17.235 3.375C17.235 3.57391 17.156 3.76468 17.0153 3.90533C16.8747 4.04598 16.6839 4.125 16.485 4.125ZM9.73501 5.25C10.5509 5.25 11.3484 5.49193 12.0267 5.94519C12.7051 6.39845 13.2338 7.04269 13.546 7.79643C13.8582 8.55018 13.9399 9.37958 13.7807 10.1797C13.6216 10.9799 13.2287 11.7149 12.6518 12.2918C12.0749 12.8687 11.3399 13.2616 10.5398 13.4207C9.73958 13.5799 8.91019 13.4982 8.15644 13.186C7.4027 12.8738 6.75846 12.3451 6.3052 11.6667C5.85194 10.9884 5.61001 10.1908 5.61001 9.375C5.61001 8.28098 6.04461 7.23177 6.81819 6.45818C7.59178 5.6846 8.64099 5.25 9.73501 5.25ZM19.35 8.50125C19.6926 10.538 19.3791 12.631 18.4547 14.478C17.5303 16.3249 16.0428 17.8303 14.2071 18.7768C12.3713 19.7233 10.2823 20.0619 8.24152 19.7437C6.20078 19.4255 4.31398 18.4669 2.85352 17.0065C1.39307 15.546 0.43454 13.6592 0.116332 11.6185C-0.201877 9.57776 0.136702 7.4887 1.08318 5.65293C2.02966 3.81717 3.53507 2.3297 5.38204 1.40529C7.22902 0.480876 9.32199 0.167358 11.3588 0.51C11.5534 0.54443 11.7267 0.65434 11.8407 0.815823C11.9548 0.977306 12.0005 1.1773 11.9679 1.3723C11.9352 1.56729 11.8269 1.74152 11.6665 1.85708C11.5061 1.97264 11.3066 2.02019 11.1113 1.98938C9.92826 1.79037 8.7161 1.85154 7.55915 2.16863C6.40219 2.48572 5.32823 3.05112 4.412 3.82547C3.49577 4.59982 2.75928 5.56453 2.25379 6.65245C1.74831 7.74037 1.48596 8.92538 1.48501 10.125C1.48323 12.1446 2.22549 14.094 3.57001 15.6009C4.11528 14.8101 4.80792 14.1318 5.61001 13.6031C5.67839 13.558 5.75969 13.5364 5.84147 13.5419C5.92324 13.5473 6.00099 13.5793 6.06282 13.6331C7.08182 14.5148 8.38424 15.0001 9.73173 15.0001C11.0792 15.0001 12.3816 14.5148 13.4006 13.6331C13.4625 13.5791 13.5405 13.5469 13.6224 13.5415C13.7044 13.5361 13.7859 13.5577 13.8544 13.6031C14.6573 14.1317 15.3508 14.81 15.8972 15.6009C17.2427 14.0944 17.986 12.1449 17.985 10.125C17.985 9.66388 17.9468 9.20354 17.8706 8.74875C17.8534 8.65119 17.8556 8.55117 17.8772 8.45448C17.8989 8.3578 17.9394 8.26635 17.9966 8.18543C18.0538 8.1045 18.1264 8.03571 18.2103 7.98301C18.2942 7.93032 18.3877 7.89477 18.4854 7.87842C18.5831 7.86208 18.6831 7.86525 18.7796 7.88777C18.8761 7.91028 18.9672 7.95169 19.0476 8.0096C19.1279 8.06751 19.1961 8.14078 19.248 8.22516C19.2999 8.30955 19.3346 8.40339 19.35 8.50125Z" fill="#6B7280"/>
                    </svg>
                    <span>Admins</span>
                  </button>

                  <button onClick={() => { navigate("/admin/billing"); setIsMobileNavOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold ${activeMenu === 'billing' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 1.5V2.25M9 15.75V16.5M6.75 3.75H11.25C12.071 3.75 12.75 4.429 12.75 5.25V6.75C12.75 7.571 12.071 8.25 11.25 8.25H6.75C5.929 8.25 5.25 8.929 5.25 9.75V11.25C5.25 12.071 5.929 12.75 6.75 12.75H11.25C12.071 12.75 12.75 13.429 12.75 14.25V15C12.75 15.2761 12.5261 15.5 12.25 15.5H5.75C5.47386 15.5 5.25 15.2761 5.25 15V14.25" stroke="#6B7280" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 4.5C8.17157 4.5 7.5 5.17157 7.5 6C7.5 6.82843 8.17157 7.5 9 7.5C9.82843 7.5 10.5 8.17157 10.5 9C10.5 9.82843 9.82843 10.5 9 10.5C8.17157 10.5 7.5 11.1716 7.5 12C7.5 12.8284 8.17157 13.5 9 13.5" stroke="#6B7280" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>Revenue & Billing</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button onClick={() => { navigate("/admin/tickets"); setIsMobileNavOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold ${activeMenu === 'tickets' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.25 15.75V4.5C2.25 4.10218 2.40804 3.72064 2.68934 3.43934C2.97064 3.15804 3.35218 3 3.75 3H14.25C14.6478 3 15.0294 3.15804 15.3107 3.43934C15.592 3.72064 15.75 4.10218 15.75 4.5V13.5C15.75 13.8978 15.592 14.2794 15.3107 14.5607C15.0294 14.842 14.6478 15 14.25 15H5.25L2.25 18V15.75Z" fill="#6B7280"/>
                    </svg>
                    <span>Support Tickets</span>
                  </button>
                  <button onClick={() => { navigate("/admin/logs"); setIsMobileNavOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold ${activeMenu === 'logs' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 2.25H10.5L14.25 6V15.75C14.25 15.9489 14.171 16.1397 14.0303 16.2803C13.8897 16.421 13.6989 16.5 13.5 16.5H3C2.80109 16.5 2.61032 16.421 2.46967 16.2803C2.32902 16.1397 2.25 15.9489 2.25 15.75V3.75C2.25 3.55109 2.32902 3.36032 2.46967 3.21967C2.61032 3.07902 2.80109 3 3 3V2.25Z" fill="#6B7280"/>
                    <path d="M9 9.75H6" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 12H6" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>System Logs</span>
                  </button>
                  <button onClick={() => { navigate("/admin/settings"); setIsMobileNavOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold ${activeMenu === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                    <NotebookHelperIcon className="h-4.5 w-4.5" />
                    <span>Settings</span>
                  </button>

                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <button onClick={() => { onLogout(); setIsMobileNavOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50">
                      <Power className="h-4.5 w-4.5 text-rose-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </nav>
            </aside>
          </div>
        </div>

        {/* CONTAINER SHELL CONTENT PANELS */}
        <div className="p-6 max-w-7xl w-full mx-auto space-y-6 flex-1">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeMenu === "dashboard" && (
            <div className="space-y-6 animate-fade-in text-slate-900">
              
              {/* Header Greetings subtitle */}
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-display">
                    Global Dashboard Overview
                  </h2>
                  <p className="text-xs text-gray-400 font-sans tracking-wide">
                    Real-time performance metrics and system status across all managed estates
                  </p>
                </div>

                <button
                  onClick={() => setIsOnboardModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>Onboard New Estates</span>
                </button>
              </div>

              {/* KPI metrics micro deck precisely matched to the image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div onClick={() => navigate("/admin/estates")} className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-blue-400 cursor-pointer transition-colors group">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Total Estates</span>
                    <span className="text-2xl font-black text-slate-950 block mt-1">{dashboardStats.totalEstates.toLocaleString()}</span>
                    <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded">
                      <TrendingUp className="h-3 w-3" /> +12%
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_683_977)">
                    <path d="M22.5 19.5H21.75V6.75C21.75 6.55109 21.671 6.36032 21.5303 6.21967C21.3897 6.07902 21.1989 6 21 6H17.25V3.75C17.25 3.55109 17.171 3.36032 17.0303 3.21967C16.8897 3.07902 16.6989 3 16.5 3H7.5C7.30109 3 7.11032 3.07902 6.96967 3.21967C6.82902 3.36032 6.75 3.55109 6.75 3.75V9H3C2.80109 9 2.61032 9.07902 2.46967 9.21967C2.32902 9.36032 2.25 9.55109 2.25 9.75V19.5H1.5C1.30109 19.5 1.11032 19.579 0.96967 19.7197C0.829018 19.8603 0.75 20.0511 0.75 20.25C0.75 20.4489 0.829018 20.6397 0.96967 20.7803C1.11032 20.921 1.30109 21 1.5 21H22.5C22.6989 21 22.8897 20.921 23.0303 20.7803C23.171 20.6397 23.25 20.4489 23.25 20.25C23.25 20.0511 23.171 19.8603 23.0303 19.7197C22.8897 19.579 22.6989 19.5 22.5 19.5ZM7.5 16.5H6C5.80109 16.5 5.61032 16.421 5.46967 16.2803C5.32902 16.1397 5.25 15.9489 5.25 15.75C5.25 15.5511 5.32902 15.3603 5.46967 15.2197C5.61032 15.079 5.80109 15 6 15H7.5C7.69891 15 7.88968 15.079 8.03033 15.2197C8.17098 15.3603 8.25 15.5511 8.25 15.75C8.25 15.9489 8.17098 16.1397 8.03033 16.2803C7.88968 16.421 7.69891 16.5 7.5 16.5ZM7.5 13.5H6C5.80109 13.5 5.61032 13.421 5.46967 13.2803C5.32902 13.1397 5.25 12.9489 5.25 12.75C5.25 12.5511 5.32902 12.3603 5.46967 12.2197C5.61032 12.079 5.80109 12 6 12H7.5C7.69891 12 7.88968 12.079 8.03033 12.2197C8.17098 12.3603 8.25 12.5511 8.25 12.75C8.25 12.9489 8.17098 13.1397 8.03033 13.2803C7.88968 13.421 7.69891 13.5 7.5 13.5ZM13.5 19.5H10.5V15.75H13.5V19.5ZM12.75 13.5H11.25C11.0511 13.5 10.8603 13.421 10.7197 13.2803C10.579 13.1397 10.5 12.9489 10.5 12.75C10.5 12.5511 10.579 12.3603 10.7197 12.2197C10.8603 12.079 11.0511 12 11.25 12H12.75C12.9489 12 13.1397 12.079 13.2803 12.2197C13.421 12.3603 13.5 12.5511 13.5 12.75C13.5 12.9489 13.421 13.1397 13.2803 13.2803C13.1397 13.421 12.9489 13.5 12.75 13.5ZM12.75 10.5H11.25C11.0511 10.5 10.8603 10.421 10.7197 10.2803C10.579 10.1397 10.5 9.94891 10.5 9.75C10.5 9.55109 10.579 9.36032 10.7197 9.21967C10.8603 9.07902 11.0511 9 11.25 9H12.75C12.9489 9 13.1397 9.07902 13.2803 9.21967C13.421 9.36032 13.5 9.55109 13.5 9.75C13.5 9.94891 13.421 10.1397 13.2803 10.2803C13.1397 10.421 12.9489 10.5 12.75 10.5ZM12.75 7.5H11.25C11.0511 7.5 10.8603 7.42098 10.7197 7.28033C10.579 7.13968 10.5 6.94891 10.5 6.75C10.5 6.55109 10.579 6.36032 10.7197 6.21967C10.8603 6.07902 11.0511 6 11.25 6H12.75C12.9489 6 13.1397 6.07902 13.2803 6.21967C13.421 6.36032 13.5 6.55109 13.5 6.75C13.5 6.94891 13.421 7.13968 13.2803 7.28033C13.1397 7.42098 12.9489 7.5 12.75 7.5ZM18 16.5H16.5C16.3011 16.5 16.1103 16.421 15.9697 16.2803C15.829 16.1397 15.75 15.9489 15.75 15.75C15.75 15.5511 15.829 15.3603 15.9697 15.2197C16.1103 15.079 16.3011 15 16.5 15H18C18.1989 15 18.3897 15.079 18.5303 15.2197C18.671 15.3603 18.75 15.5511 18.75 15.75C18.75 15.9489 18.671 16.1397 18.5303 16.2803C18.3897 16.421 18.1989 16.5 18 16.5ZM18 13.5H16.5C16.3011 13.5 16.1103 13.421 15.9697 13.2803C15.829 13.1397 15.75 12.9489 15.75 12.75C15.75 12.5511 15.829 12.3603 15.9697 12.2197C16.1103 12.079 16.3011 12 16.5 12H18C18.1989 12 18.3897 12.079 18.5303 12.2197C18.671 12.3603 18.75 12.5511 18.75 12.75C18.75 12.9489 18.671 13.1397 18.5303 13.2803C18.3897 13.421 18.1989 13.5 18 13.5ZM18 10.5H16.5C16.3011 10.5 16.1103 10.421 15.9697 10.2803C15.829 10.1397 15.75 9.94891 15.75 9.75C15.75 9.55109 15.829 9.36032 15.9697 9.21967C16.1103 9.07902 16.3011 9 16.5 9H18C18.1989 9 18.3897 9.07902 18.5303 9.21967C18.671 9.36032 18.75 9.55109 18.75 9.75C18.75 9.94891 18.671 10.1397 18.5303 10.2803C18.3897 10.421 18.1989 10.5 18 10.5Z" fill="#6B7280"/>
                    <path d="M24 15.5992C24 18.5987 21.8125 20.0984 19.2125 20.9683C19.0764 21.0125 18.9285 21.0104 18.7937 20.9623C16.1875 20.0984 14 18.5987 14 15.5992V11.3999C14 11.2408 14.0658 11.0882 14.1831 10.9757C14.3003 10.8632 14.4592 10.8 14.625 10.8C15.875 10.8 17.4375 10.0801 18.525 9.16824C18.6574 9.05966 18.8258 9 19 9C19.1742 9 19.3426 9.05966 19.475 9.16824C20.5688 10.0861 22.125 10.8 23.375 10.8C23.5408 10.8 23.6997 10.8632 23.8169 10.9757C23.9342 11.0882 24 11.2408 24 11.3999V15.5992Z" fill="#6B7280"/>
                    <path d="M15.485 19.1446C15.7517 18.456 16.2315 17.8622 16.86 17.443C17.4885 17.0238 18.2356 16.7992 19.001 16.7994C19.7663 16.7996 20.5133 17.0246 21.1416 17.4441C21.7698 17.8637 22.2493 18.4577 22.5156 19.1464" fill="#6B7280"/>
                    <path d="M19 16.799C20.3807 16.799 21.5 15.7246 21.5 14.3994C21.5 13.0741 20.3807 11.9998 19 11.9998C17.6193 11.9998 16.5 13.0741 16.5 14.3994C16.5 15.7246 17.6193 16.799 19 16.799Z" fill="#6B7280"/>
                    <path d="M15.485 19.1446C15.7517 18.456 16.2315 17.8622 16.86 17.443C17.4885 17.0238 18.2356 16.7992 19.001 16.7994C19.7663 16.7996 20.5133 17.0246 21.1416 17.4441C21.7698 17.8637 22.2493 18.4577 22.5156 19.1464M24 15.5992C24 18.5987 21.8125 20.0984 19.2125 20.9683C19.0764 21.0125 18.9285 21.0104 18.7937 20.9623C16.1875 20.0984 14 18.5987 14 15.5992V11.3999C14 11.2408 14.0658 11.0882 14.1831 10.9757C14.3003 10.8632 14.4592 10.8 14.625 10.8C15.875 10.8 17.4375 10.0801 18.525 9.16824C18.6574 9.05966 18.8258 9 19 9C19.1742 9 19.3426 9.05966 19.475 9.16824C20.5688 10.0861 22.125 10.8 23.375 10.8C23.5408 10.8 23.6997 10.8632 23.8169 10.9757C23.9342 11.0882 24 11.2408 24 11.3999V15.5992ZM21.5 14.3994C21.5 15.7246 20.3807 16.799 19 16.799C17.6193 16.799 16.5 15.7246 16.5 14.3994C16.5 13.0741 17.6193 11.9998 19 11.9998C20.3807 11.9998 21.5 13.0741 21.5 14.3994Z" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_683_977">
                    <rect width="24" height="24" fill="white"/>
                    </clipPath>
                    </defs>
                    </svg>

                  </div>
                </div>

                <div onClick={() => navigate("/admin/residents")} className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-blue-400 cursor-pointer transition-colors group">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Active Residents</span>
                    <span className="text-2xl font-black text-slate-950 block mt-1">{dashboardStats.totalResidents.toLocaleString()}</span>
                    <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded">
                      <TrendingUp className="h-3 w-3" /> +5%
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <svg width="36" height="40" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="36" height="40" rx="8" fill="#EDF6FF"/>
                    <path d="M27.35 28.3023C27.4338 28.4137 27.485 28.5463 27.4976 28.6852C27.5103 28.8241 27.484 28.9637 27.4216 29.0885C27.3593 29.2132 27.2634 29.3181 27.1448 29.3914C27.0262 29.4646 26.8894 29.5034 26.75 29.5033H8.75C8.61072 29.5033 8.47418 29.4645 8.3557 29.3912C8.23722 29.318 8.14147 29.2132 8.07918 29.0887C8.01689 28.9641 7.99052 28.8246 8.00303 28.6859C8.01554 28.5472 8.06643 28.4147 8.15 28.3033C8.81411 27.4129 9.69971 26.7118 10.7188 26.2698C10.1602 25.76 9.76878 25.0932 9.59595 24.357C9.42313 23.6207 9.47695 22.8494 9.75034 22.1443C10.0237 21.4392 10.5039 20.8333 11.1279 20.406C11.7519 19.9787 12.4905 19.75 13.2467 19.75C14.003 19.75 14.7416 19.9787 15.3655 20.406C15.9895 20.8333 16.4697 21.4392 16.7431 22.1443C17.0165 22.8494 17.0703 23.6207 16.8975 24.357C16.7247 25.0932 16.3333 25.76 15.7747 26.2698C16.5099 26.5876 17.178 27.0422 17.7434 27.6095C18.3089 27.0422 18.977 26.5876 19.7122 26.2698C19.1536 25.76 18.7622 25.0932 18.5894 24.357C18.4166 23.6207 18.4704 22.8494 18.7438 22.1443C19.0172 21.4392 19.4974 20.8333 20.1213 20.406C20.7453 19.9787 21.4839 19.75 22.2402 19.75C22.9964 19.75 23.735 19.9787 24.359 20.406C24.9829 20.8333 25.4631 21.4392 25.7365 22.1443C26.0099 22.8494 26.0637 23.6207 25.8909 24.357C25.7181 25.0932 25.3267 25.76 24.7681 26.2698C25.7919 26.7095 26.6822 27.4104 27.35 28.3023ZM8.3 19.6033C8.37879 19.6623 8.46845 19.7053 8.56386 19.7298C8.65927 19.7542 8.75856 19.7596 8.85607 19.7457C8.95357 19.7318 9.04737 19.6988 9.13212 19.6486C9.21687 19.5984 9.29091 19.532 9.35 19.4533C9.80409 18.8478 10.3929 18.3564 11.0698 18.0179C11.7468 17.6795 12.4932 17.5033 13.25 17.5033C14.0068 17.5033 14.7532 17.6795 15.4302 18.0179C16.1071 18.3564 16.6959 18.8478 17.15 19.4533C17.2199 19.5464 17.3104 19.622 17.4146 19.6741C17.5187 19.7261 17.6336 19.7533 17.75 19.7533C17.8664 19.7533 17.9813 19.7261 18.0854 19.6741C18.1896 19.622 18.2801 19.5464 18.35 19.4533C18.8041 18.8478 19.3929 18.3564 20.0698 18.0179C20.7468 17.6795 21.4932 17.5033 22.25 17.5033C23.0068 17.5033 23.7532 17.6795 24.4302 18.0179C25.1071 18.3564 25.6959 18.8478 26.15 19.4533C26.2092 19.532 26.2833 19.5984 26.3681 19.6486C26.4529 19.6987 26.5467 19.7317 26.6443 19.7456C26.7418 19.7595 26.8411 19.754 26.9366 19.7295C27.032 19.705 27.1217 19.6619 27.2005 19.6028C27.2793 19.5436 27.3456 19.4695 27.3958 19.3847C27.4459 19.2999 27.4789 19.2061 27.4928 19.1085C27.5067 19.011 27.5012 18.9116 27.4767 18.8162C27.4522 18.7208 27.4092 18.6311 27.35 18.5523C26.6859 17.6622 25.8003 16.9615 24.7812 16.5198C25.3398 16.01 25.7312 15.3432 25.904 14.607C26.0769 13.8707 26.0231 13.0994 25.7497 12.3943C25.4763 11.6892 24.9961 11.0832 24.3721 10.656C23.7481 10.2287 23.0095 10 22.2533 10C21.497 10 20.7584 10.2287 20.1345 10.656C19.5105 11.0832 19.0303 11.6892 18.7569 12.3943C18.4835 13.0994 18.4297 13.8707 18.6025 14.607C18.7753 15.3432 19.1667 16.01 19.7253 16.5198C18.9901 16.8376 18.322 17.2922 17.7566 17.8595C17.1911 17.2922 16.523 16.8376 15.7878 16.5198C16.3464 16.01 16.7378 15.3432 16.9106 14.607C17.0834 13.8707 17.0296 13.0994 16.7562 12.3943C16.4828 11.6892 16.0026 11.0832 15.3787 10.656C14.7547 10.2287 14.0161 10 13.2598 10C12.5036 10 11.765 10.2287 11.141 10.656C10.5171 11.0832 10.0369 11.6892 9.76347 12.3943C9.49007 13.0994 9.43625 13.8707 9.60908 14.607C9.7819 15.3432 10.1733 16.01 10.7319 16.5198C9.70805 16.9599 8.81774 17.6611 8.15 18.5533C8.09091 18.632 8.04791 18.7217 8.02347 18.8171C7.99902 18.9125 7.99361 19.0118 8.00754 19.1093C8.02147 19.2068 8.05446 19.3006 8.10464 19.3854C8.15483 19.4701 8.22121 19.5442 8.3 19.6033Z" fill="#2563EB"/>
                    </svg>

                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-blue-400 cursor-pointer transition-colors group">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">MRR</span>
                    <span className="text-2xl font-black text-slate-950 block mt-1">{dashboardStats.revenue}</span>
                    <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded">
                      <TrendingUp className="h-3 w-3" /> +5%
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <svg width="36" height="40" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="36" height="40" rx="8" fill="#E1FFDF"/>
                    <path d="M22 19.75C22 20.4917 21.7801 21.2167 21.368 21.8334C20.956 22.4501 20.3703 22.9307 19.6851 23.2145C18.9998 23.4984 18.2458 23.5726 17.5184 23.4279C16.791 23.2833 16.1228 22.9261 15.5983 22.4017C15.0739 21.8772 14.7167 21.209 14.5721 20.4816C14.4274 19.7542 14.5016 19.0002 14.7855 18.3149C15.0693 17.6297 15.5499 17.044 16.1666 16.632C16.7833 16.2199 17.5083 16 18.25 16C19.2446 16 20.1984 16.3951 20.9017 17.0983C21.6049 17.8016 22 18.7554 22 19.75ZM29.5 13.75V25.75C29.5 25.9489 29.421 26.1397 29.2803 26.2803C29.1397 26.421 28.9489 26.5 28.75 26.5H7.75C7.55109 26.5 7.36032 26.421 7.21967 26.2803C7.07902 26.1397 7 25.9489 7 25.75V13.75C7 13.5511 7.07902 13.3603 7.21967 13.2197C7.36032 13.079 7.55109 13 7.75 13H28.75C28.9489 13 29.1397 13.079 29.2803 13.2197C29.421 13.3603 29.5 13.5511 29.5 13.75ZM28 18.0953C27.1484 17.8435 26.3733 17.3826 25.7453 16.7547C25.1174 16.1267 24.6565 15.3516 24.4047 14.5H12.0953C11.8435 15.3516 11.3826 16.1267 10.7547 16.7547C10.1267 17.3826 9.35162 17.8435 8.5 18.0953V21.4047C9.35162 21.6565 10.1267 22.1174 10.7547 22.7453C11.3826 23.3733 11.8435 24.1484 12.0953 25H24.4047C24.6565 24.1484 25.1174 23.3733 25.7453 22.7453C26.3733 22.1174 27.1484 21.6565 28 21.4047V18.0953Z" fill="#16A34A"/>
                    </svg>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-sans">System Uptime</span>
                    <span className="text-2xl font-black text-slate-950 block mt-1">1,234</span>
                    <span className="text-[10px] text-blue-600 font-bold mt-1 inline-flex items-center gap-0.5 bg-blue-50 px-1.5 py-0.5 rounded">
                      Stability: 100%
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <svg width="36" height="40" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="36" height="40" rx="8" fill="#FFF7DF"/>
                    <path d="M18 12C16.22 12 14.4799 12.5278 12.9999 13.5168C11.5198 14.5057 10.3663 15.9113 9.68509 17.5559C9.0039 19.2004 8.82567 21.01 9.17294 22.7558C9.5202 24.5016 10.3774 26.1053 11.636 27.364C12.8947 28.6226 14.4984 29.4798 16.2442 29.8271C17.99 30.1743 19.7996 29.9961 21.4442 29.3149C23.0887 28.6337 24.4943 27.4802 25.4832 26.0001C26.4722 24.5201 27 22.78 27 21C26.9973 18.6139 26.0482 16.3263 24.361 14.6391C22.6737 12.9518 20.3861 12.0027 18 12ZM22.2806 17.7806L18.5306 21.5306C18.4609 21.6003 18.3782 21.6556 18.2872 21.6933C18.1961 21.731 18.0986 21.7504 18 21.7504C17.9015 21.7504 17.8039 21.731 17.7128 21.6933C17.6218 21.6556 17.5391 21.6003 17.4694 21.5306C17.3997 21.4609 17.3444 21.3782 17.3067 21.2872C17.269 21.1961 17.2496 21.0985 17.2496 21C17.2496 20.9015 17.269 20.8039 17.3067 20.7128C17.3444 20.6218 17.3997 20.5391 17.4694 20.4694L21.2194 16.7194C21.2891 16.6497 21.3718 16.5944 21.4628 16.5567C21.5539 16.519 21.6515 16.4996 21.75 16.4996C21.8486 16.4996 21.9461 16.519 22.0372 16.5567C22.1282 16.5944 22.2109 16.6497 22.2806 16.7194C22.3503 16.7891 22.4056 16.8718 22.4433 16.9628C22.481 17.0539 22.5004 17.1515 22.5004 17.25C22.5004 17.3485 22.481 17.4461 22.4433 17.5372C22.4056 17.6282 22.3503 17.7109 22.2806 17.7806ZM15 9.75C15 9.55109 15.079 9.36032 15.2197 9.21967C15.3603 9.07902 15.5511 9 15.75 9H20.25C20.4489 9 20.6397 9.07902 20.7803 9.21967C20.921 9.36032 21 9.55109 21 9.75C21 9.94891 20.921 10.1397 20.7803 10.2803C20.6397 10.421 20.4489 10.5 20.25 10.5H15.75C15.5511 10.5 15.3603 10.421 15.2197 10.2803C15.079 10.1397 15 9.94891 15 9.75Z" fill="#D4AF37"/>
                    </svg>
                  </div>
                </div>

              </div>

              {/* TWIN GRAPHS AND HEALTH BOARD PANELS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Left side chart: Platform Revenue growth */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4 flex-wrap gap-2">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">Platform Revenue Growth</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded border border-gray-200 cursor-pointer flex items-center gap-1">
                          <span>Last year</span>
                          <span className="text-[8px]">▼</span>
                        </span>
                      </div>
                    </div>

                    {/* Recharts chart area */}
                    <div className="h-56 mt-4 w-full">
                      <ResponsiveContainer width="100%" height={224}>
                        <LineChart data={revenueData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(tick) => `₦${(tick / 1000000).toFixed(1)}M`} />
                          <Tooltip formatter={(value: any) => [`₦${Number(value).toLocaleString()}`, "Revenue"]} />
                          <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3.5} dot={false} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Right side diagnostics: System health */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 border-b border-gray-100 pb-3 block uppercase tracking-wider">System Health</h3>

                    <div className="mt-4 space-y-3.5">
                      
                      {[
                        { name: "Access Control Hub", stats: "Latency: 12ms", state: "Optimal" },
                        { name: "Visitor Management", stats: "Active Sessions: 12,400", state: "Optimal" },
                        { name: "Messaging Service", stats: "Queue Load: 45", state: "Degraded" },
                        { name: "Payment Gateway", stats: "Transaction Rate: Normal", state: "Optimal" }
                      ].map((item, id) => (
                        <div key={id} className="flex justify-between items-center">
                          <div>
                            <span className="block text-xs font-bold text-slate-900">{item.name}</span>
                            <span className="block text-[10px] text-gray-400 mt-0.5 leading-none">{item.stats}</span>
                          </div>
                          <span className={`text-[9.5px] font-bold px-2.5 py-0.5 rounded ${
                            item.state === "Optimal" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          }`}>
                            {item.state}
                          </span>
                        </div>
                      ))}

                    </div>
                  </div>

                  {/* Circular visual Dial for SERVER LOAD */}
                  <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-gray-400 block tracking-wider">Server Load</span>
                      <span className="text-xl font-black text-slate-900 block mt-0.5">45% Capacity</span>
                    </div>

                    {/* Circular visual arc progress bar representation in CSS */}
                    <div className="relative h-12 w-12 flex items-center justify-center shrink-0">
                      <svg className="w-12 h-12 transform -rotate-90">
                        <circle cx="24" cy="24" r="18" stroke="#e2e8f0" strokeWidth="4" fill="transparent" />
                        <circle cx="24" cy="24" r="18" stroke="#2563eb" strokeWidth="4" fill="transparent" strokeDasharray="113" strokeDashoffset="62" />
                      </svg>
                      <span className="absolute text-[10px] font-black text-blue-600">45%</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* RECENT ESTATES LIST ONBOARDINGS */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 flex-wrap gap-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-950">
                      Recent Estate Onboardings
                    </h3>
                  </div>

                  {/* View All */}
                  <button
                    onClick={() => navigate("/admin/estates")}
                    className="text-blue-600 hover:text-blue-700 text-xs font-bold cursor-pointer transition-colors"
                  >
                    View All Estates
                  </button>
                </div>

                {/* Table of estates */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse mt-3 text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] font-extrabold uppercase text-gray-400">
                        <th className="py-3 px-2">Estates</th>
                        <th className="py-3 px-2">Subscription Tier</th>
                        <th className="py-3 px-2">Status</th>
                        <th className="py-3 px-2">Date Joined</th>
                        <th className="py-3 px-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estates.map((est, idx) => (
                        <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-slate-50">
                          <td className="py-3.5 px-2 flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-blue-100 text-blue-600 font-extrabold text-xs flex items-center justify-center font-mono">
                              SV
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-900 block">{est.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-2">
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100 uppercase">
                              {est.tier}
                            </span>
                          </td>
                          <td className="py-3.5 px-2">
                            <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                              Active
                            </span>
                          </td>
                          <td className="py-3.5 px-2 font-medium text-gray-500">{est.date}</td>
                          <td className="py-3.5 px-2 text-right">
                            <button 
                              onClick={() => {
                                alert(`Opening command config parameters for ${est.name}`);
                              }}
                              className="text-gray-400 hover:text-slate-900 transition-colors p-1"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ESTATES DIRECTORY - TABLE VIEW AS PER IMAGE */}
          {activeMenu === "estates" && (
            selectedEstateId ? (
              <EstateDetailView 
                estate={estates.find(e => e.id === selectedEstateId)} 
                onBack={() => setSelectedEstateId(null)} 
                onEdit={(est) => { setEditingEstate(est); setIsEditModalOpen(true); }}
              />
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-display">
                      Estates
                    </h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">
                      Manage and monitor 1,234 registered communities and their operational status.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setIsOnboardModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                    <span>Onboard New Estates</span>
                  </button>
                </div>

                {/* Filters and Search Bar matched to image */}
                <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search estates, admins or systems..."
                      className="w-full text-sm pl-9 pr-3 py-2 border border-gray-100 rounded-xl bg-slate-50/50 outline-none"
                    />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-slate-600">
                      <Search className="h-3.5 w-3.5" />
                      Subscription
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-slate-400">
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Estates Table precisely matched to image column structure */}
                <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-widest bg-slate-50/30">
                          <th className="py-4 px-6">Estate Name</th>
                          <th className="py-4 px-6">Location</th>
                          <th className="py-4 px-6 text-center">Residents</th>
                          <th className="py-4 px-6 text-center">Securities</th>
                          <th className="py-4 px-6">Subscription</th>
                          <th className="py-4 px-6">Status</th>
                          <th className="py-4 px-6">Date Joined</th>
                          <th className="py-4 px-6 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {estates.map((est, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="py-4 px-6">
                              <div 
                                onClick={() => setSelectedEstateId(est.id)}
                                className="flex items-center gap-3 cursor-pointer group/name w-fit"
                              >
                                <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black text-[10px] border border-blue-100 group-hover/name:bg-blue-600 group-hover/name:text-white transition-all">
                                  SV
                                </div>
                                <span className="font-black text-slate-900 group-hover/name:text-blue-600 transition-colors">{est.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 font-bold text-gray-500">{est.city}, NG</td>
                            <td className="py-4 px-6 text-center font-bold text-slate-700">1,003</td>
                            <td className="py-4 px-6 text-center font-bold text-slate-700">40</td>
                            <td className="py-4 px-6">
                              <span className="text-[9px] font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-tighter">
                                {est.tier}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                                {est.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 font-bold text-gray-400">{est.date}</td>
                            <td className="py-4 px-6 text-right relative">
                              <button 
                                onClick={() => setActiveRowActionMenuId(activeRowActionMenuId === est.id ? null : est.id)}
                                className="text-gray-300 hover:text-slate-900 p-1"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>

                              {activeRowActionMenuId === est.id && (
                                <div className="absolute right-12 top-10 w-40 bg-white border border-gray-150 rounded-2xl shadow-xl z-30 text-left overflow-hidden py-1.5 ring-4 ring-slate-50">
                                  <button
                                    onClick={() => { setSelectedEstateId(est.id); setActiveRowActionMenuId(null); }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-[11px] font-black text-slate-700 hover:bg-slate-50"
                                  >
                                    <Eye className="h-3.5 w-3.5 text-blue-600" />
                                    <span>View Estate</span>
                                  </button>
                                  <button
                                    onClick={() => { setEditingEstate(est); setIsEditModalOpen(true); setActiveRowActionMenuId(null); }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-[11px] font-black text-slate-700 hover:bg-slate-50"
                                  >
                                    <Edit className="h-3.5 w-3.5 text-amber-600" />
                                    <span>Edit Estate</span>
                                  </button>
                                  <button className="w-full flex items-center gap-2.5 px-4 py-2 text-[11px] font-black text-rose-600 hover:bg-rose-50 border-t border-gray-50 mt-1">
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Delete Estate</span>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination matched to image bottom */}
                  <div className="p-4 border-t border-gray-50 flex justify-between items-center text-[10px] font-bold text-gray-400">
                    <span>1 - 10 of 1,234 Estates</span>
                    <div className="flex gap-4">
                      <button className="hover:text-slate-900 disabled:opacity-30 uppercase tracking-widest">← Previous</button>
                      <button className="hover:text-slate-900 uppercase tracking-widest">Next →</button>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {/* TAB 3: RESIDENTS DIRECTORY */}
          {activeMenu === "residents" && (
            selectedResidentId ? (
              <ResidentDetailView 
                resident={residents.find(r => r.id === selectedResidentId)} 
                onBack={() => setSelectedResidentId(null)} 
              />
            ) : (
              <div className="space-y-6 animate-fade-in text-slate-900">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-display">
                      Residents
                    </h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">
                      Manage all residents across estates.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsAddResidentModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4 stroke-[3]" />
                      <span>Add Resident</span>
                    </button>
                  </div>
                </div>

                {/* Filters and Search Bar matched to image */}
                <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search residents..."
                      className="w-full text-sm pl-9 pr-3 py-2 border border-gray-100 rounded-xl bg-slate-50/50 outline-none"
                    />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <select className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-slate-600 outline-none">
                      <option>Estate</option>
                      <option>Lagos</option>
                      <option>Abuja</option>
                    </select>
                    <select className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-slate-600 outline-none">
                      <option>Status</option>
                      <option>Active</option>
                      <option>Suspended</option>
                    </select>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-slate-600">
                      <Clock className="h-3.5 w-3.5" />
                      Date Joined
                    </button>
                  </div>
                </div>

                {/* Residents Table precisely matched to image column structure */}
                <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-widest bg-slate-50/30">
                          <th className="py-4 px-6">Resident Name</th>
                          <th className="py-4 px-6">Estate</th>
                          <th className="py-4 px-6">Phone</th>
                          <th className="py-4 px-6 text-center">Unit</th>
                          <th className="py-4 px-6">Status</th>
                          <th className="py-4 px-6">Date Joined</th>
                          <th className="py-4 px-6 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {residents.map((res, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="py-4 px-6">
                              <div 
                                onClick={() => setSelectedResidentId(res.id)}
                                className="flex items-center gap-3 cursor-pointer group/name w-fit"
                              >
                                <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black text-[10px] border border-blue-100 group-hover/name:bg-blue-600 group-hover/name:text-white transition-all">
                                  {res.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className="font-black text-slate-900 group-hover/name:text-blue-600 transition-colors">{res.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 font-bold text-gray-500">{res.estate}</td>
                            <td className="py-4 px-6 font-bold text-slate-700 font-mono">{res.phone}</td>
                            <td className="py-4 px-6 text-center font-black text-blue-600">{res.houseNo.split(',').pop()?.trim() || "12A"}</td>
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                                {res.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 font-bold text-gray-400">{res.joinedDate}</td>
                            <td className="py-4 px-6 text-right relative">
                              <button 
                                onClick={() => setActiveRowActionMenuId(activeRowActionMenuId === res.id ? null : res.id)}
                                className="text-gray-300 hover:text-slate-900 p-1"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>

                              {activeRowActionMenuId === res.id && (
                                <div className="absolute right-12 top-10 w-44 bg-white border border-gray-150 rounded-2xl shadow-xl z-30 text-left overflow-hidden py-1.5 ring-4 ring-slate-50">
                                  <button
                                    onClick={() => { setSelectedResidentId(res.id); setActiveRowActionMenuId(null); }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-[11px] font-black text-slate-700 hover:bg-slate-50"
                                  >
                                    <Eye className="h-3.5 w-3.5 text-blue-600" />
                                    <span>View Profile</span>
                                  </button>
                                  <button
                                    onClick={() => { setEditingResident(res); setIsEditResidentModalOpen(true); setActiveRowActionMenuId(null); }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-[11px] font-black text-slate-700 hover:bg-slate-50"
                                  >
                                    <Edit className="h-3.5 w-3.5 text-amber-600" />
                                    <span>Edit Details</span>
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if(window.confirm(`Suspend access for ${res.name}?`)) {
                                        setResidents(residents.map(r => r.id === res.id ? {...r, status: r.status === 'Active' ? 'Suspended' : 'Active'} : r));
                                        setActiveRowActionMenuId(null);
                                      }
                                    }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-[11px] font-black text-amber-600 hover:bg-amber-50"
                                  >
                                    <ShieldAlert className="h-3.5 w-3.5" />
                                    <span>{res.status === 'Active' ? 'Suspend Access' : 'Restore Access'}</span>
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if(window.confirm(`Deactivate and remove ${res.name} from records?`)) {
                                        setResidents(residents.filter(r => r.id !== res.id));
                                        setActiveRowActionMenuId(null);
                                      }
                                    }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-[11px] font-black text-rose-600 hover:bg-rose-50 border-t border-gray-50 mt-1"
                                  >
                                    <UserX className="h-3.5 w-3.5" />
                                    <span>Deactivate</span>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination matched to image bottom */}
                  <div className="p-4 border-t border-gray-50 flex justify-between items-center text-[10px] font-bold text-gray-400">
                    <span>1 - 10 of 1,234 Residents</span>
                    <div className="flex gap-4">
                      <button className="hover:text-slate-900 disabled:opacity-30 uppercase tracking-widest">← Previous</button>
                      <button className="hover:text-slate-900 uppercase tracking-widest">Next →</button>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {/* TAB 4: DOMESTIC & STAFF DATABASE - MATCHES IMAGE 2 STATS, TABLES AND DROPDOWNS PERFECTLY */}
          {activeMenu === "staff" && (
            <div className="space-y-6 animate-fade-in text-slate-800">
              
              {/* Headings */}
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  Staff Management
                </h2>
                <p className="text-xs text-gray-400 font-sans tracking-wide">
                  Monitor all estate staff across the platform
                </p>
              </div>

              {/* Four Metric boxes strictly compliant with photo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Total Staff</span>
                    <span className="text-2xl font-black text-slate-950 block mt-1">1,240</span>
                    <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded">
                      <TrendingUp className="h-3 w-3" /> +12%
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <HardHat className="h-5 w-5" />
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Security Personnel</span>
                    <span className="text-2xl font-black text-slate-950 block mt-1">320</span>
                    <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded">
                      <TrendingUp className="h-3 w-3" /> +12%
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Domestic Staff</span>
                    <span className="text-2xl font-black text-slate-950 block mt-1">920</span>
                    <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded">
                      <TrendingUp className="h-3 w-3" /> +8%
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5" />
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Active Staff</span>
                    <span className="text-2xl font-black text-slate-950 block mt-1">1,180</span>
                    <span className="text-[10px] text-blue-600 font-bold mt-1 inline-flex items-center gap-0.5 bg-blue-50 px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Check className="h-5 w-5" />
                  </div>
                </div>

              </div>

              {/* Staff Table card strictly following image */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                
                {/* Header title */}
                <div className="px-6 py-4.5 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl">
                  <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">Staff Table</h3>
                </div>

                {/* Filters Row */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-center bg-gray-50/40 font-sans">
                  
                  {/* Search Bar */}
                  <div className="relative w-full sm:w-60">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search staff name..."
                      value={staffSearchText}
                      onChange={(e) => setStaffSearchText(e.target.value)}
                      className="w-full text-xs pl-8.5 pr-3 py-2 border border-gray-200 rounded-xl bg-white outline-none"
                    />
                  </div>

                  {/* Filter elements */}
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* Status Dropdown */}
                    <div className="relative text-xs">
                      <select 
                        value={staffStatusFilter}
                        onChange={(e) => setStaffStatusFilter(e.target.value)}
                        className="appearance-none pr-7 pl-3 py-1.5 bg-white border border-gray-200 rounded-xl font-medium text-slate-700 outline-none"
                      >
                        <option value="All">Status: All</option>
                        <option value="Active">Status: Active</option>
                        <option value="Suspended">Status: Suspended</option>
                      </select>
                      <span className="absolute right-2.5 top-2 ml-1 text-slate-400 font-mono text-[8px] pointer-events-none">▼</span>
                    </div>

                    {/* Shift Dropdown */}
                    <div className="relative text-xs">
                      <select 
                        value={staffShiftFilter}
                        onChange={(e) => setStaffShiftFilter(e.target.value)}
                        className="appearance-none pr-7 pl-3 py-1.5 bg-white border border-gray-200 rounded-xl font-medium text-slate-700 outline-none"
                      >
                        <option value="All Shift">Shift: All Shift</option>
                        <option value="Morning">Morning</option>
                        <option value="Night">Night</option>
                        <option value="Full Time">Full Time</option>
                        <option value="Daytime">Daytime</option>
                        <option value="Live - in">Live - in</option>
                      </select>
                      <span className="absolute right-2.5 top-2 ml-1 text-slate-400 font-mono text-[8px] pointer-events-none">▼</span>
                    </div>

                    {/* Type Dropdown */}
                    <div className="relative text-xs">
                      <select 
                        value={staffTypeFilter}
                        onChange={(e) => setStaffTypeFilter(e.target.value)}
                        className="appearance-none pr-7 pl-3 py-1.5 bg-white border border-gray-200 rounded-xl font-medium text-slate-700 outline-none"
                      >
                        <option value="All">Type: All</option>
                        <option value="Security">Security Personnel</option>
                        <option value="Cleaner">Cleaner</option>
                        <option value="Driver">Driver</option>
                        <option value="Chef">Chef</option>
                        <option value="Nanny">Nanny</option>
                        <option value="Gardener">Gardener</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                      <span className="absolute right-2.5 top-2 ml-1 text-slate-400 font-mono text-[8px] pointer-events-none">▼</span>
                    </div>

                    {(staffSearchText || staffStatusFilter !== "All" || staffShiftFilter !== "All Shift" || staffTypeFilter !== "All") && (
                      <button
                        onClick={() => {
                          setStaffSearchText("");
                          setStaffStatusFilter("All");
                          setStaffShiftFilter("All Shift");
                          setStaffTypeFilter("All");
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-bold ml-1 cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}

                  </div>

                </div>

                {/* Table details identical to Image 2 */}
                <div className="overflow-x-auto relative min-h-[400px]">
                  <table className="w-full text-left text-xs text-slate-800">
                    <thead>
                      <tr className="border-b border-gray-150 text-[10px] font-extrabold uppercase text-gray-400 bg-gray-50/50">
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Assigned To</th>
                        <th className="py-3 px-4">Estate</th>
                        <th className="py-3 px-4">Shift</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffList
                        .filter(st => {
                          // Search query
                          if (staffSearchText && !st.name.toLowerCase().includes(staffSearchText.toLowerCase())) return false;
                          // Status
                          if (staffStatusFilter !== "All" && st.status !== staffStatusFilter) return false;
                          // Shift
                          if (staffShiftFilter !== "All Shift" && st.shift.toLowerCase() !== staffShiftFilter.toLowerCase()) return false;
                          // Type
                          if (staffTypeFilter !== "All" && !st.role.toLowerCase().includes(staffTypeFilter.toLowerCase())) return false;
                          return true;
                        })
                        .map((st) => (
                          <tr key={st.id} className="border-b border-gray-100 last:border-0 hover:bg-slate-50">
                            <td
                              className="py-3.5 px-4 font-bold text-slate-900 cursor-pointer hover:text-blue-600"
                              onClick={() => setSelectedStaff(st)}
                            >{st.name}</td>
                            <td className="py-3.5 px-4">
                              <span className={`text-[10px] font-bold ${
                                st.role === "Security" ? "text-purple-600" : st.role === "Cleaner" ? "text-blue-500" : "text-amber-600"
                              }`}>
                                {st.role}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-gray-500 font-semibold">{st.assignedTo}</td>
                            <td className="py-3.5 px-4 text-gray-400 font-medium">{st.estate}</td>
                            <td className="py-3.5 px-4 text-gray-500 font-sans">{st.shift}</td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold text-emerald-800">
                                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full inline-block" />
                                {st.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center relative">
                              
                              {/* Trigger actions popover */}
                              <button
                                onClick={() => {
                                  setActiveRowActionMenuId(activeRowActionMenuId === st.id ? null : st.id);
                                }}
                                className="p-1 px-2.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-slate-900 transition-colors inline-flex cursor-pointer"
                              >
                                <span className="text-sm font-black tracking-widest">•••</span>
                              </button>

                              {/* Dropdown Action Popover strictly matched to visual style */}
                              {activeRowActionMenuId === st.id && (
                                <div className="absolute right-6 top-10 w-36 bg-white border border-gray-200 rounded-xl shadow-xl z-30 text-left overflow-hidden py-1">
                                  <button
                                    onClick={() => {
                                      setSelectedStaff(st);
                                      setActiveRowActionMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                  >
                                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                                    <span>View Profile</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      const confirmAction = window.confirm(`Suspend access credentials for ${st.name}?`);
                                      if (confirmAction) {
                                        setStaffList(staffList.map(s => s.id === st.id ? { ...s, status: "Suspended" } : s));
                                      }
                                      setActiveRowActionMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
                                  >
                                    <BanIcon className="h-3.5 w-3.5" />
                                    <span>Suspend Access</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      const confirmAction = window.confirm(`Deactivate records for ${st.name} permanently?`);
                                      if (confirmAction) {
                                        setStaffList(staffList.filter(s => s.id !== st.id));
                                      }
                                      setActiveRowActionMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border-t border-gray-100 transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Deactivate</span>
                                  </button>
                                </div>
                              )}

                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: ADMINS MANAGEMENT VIEW - EXACT COMPLIANCE WITH REPEATED JAMES WILLSON */}
          {activeMenu === "admins" && (
            <div className="space-y-6 animate-fade-in text-slate-900">
              
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Global Admin Management
                  </h2>
                  <p className="text-xs text-gray-400 font-sans tracking-wide">
                    Manage administrative access and permissions for the global platform.
                  </p>
                </div>
                
                <button
                  onClick={() => setIsAdminModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2+ rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>Onboard New Admin</span>
                </button>
              </div>

              {/* Admin KPI card boxes - strictly matched to first visual */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Total Admin</span>
                  <span className="text-2xl font-black text-slate-950 block mt-1">{adminsList.length}</span>
                  <span className="text-[9.5px] text-gray-400 font-medium block mt-1">Active nationwide</span>
                </div>

                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Super Admin</span>
                  <span className="text-2xl font-black text-slate-950 block mt-1">{adminsList.filter(a => a.role?.toLowerCase().includes("super")).length}</span>
                  <span className="text-[9.5px] text-gray-400 font-medium block mt-1">Full Platform Access</span>
                </div>

                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Support Lead</span>
                  <span className="text-2xl font-black text-slate-950 block mt-1">{adminsList.filter(a => a.role?.toLowerCase().includes("support")).length}</span>
                  <span className="text-[9.5px] text-gray-400 font-medium block mt-1">Ticketing and user support</span>
                </div>

                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Active Now</span>
                  <span className="text-2xl font-black text-slate-950 block mt-1 font-mono">{adminsList.filter(a => a.status?.toLowerCase() === "active").length}</span>
                  <span className="text-[9.5px] text-emerald-600 font-bold block mt-1">● Currently online</span>
                </div>

              </div>

              {/* Admins Table Container strictly style matched */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">Admin</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs bg-white text-slate-705">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] font-extrabold uppercase text-gray-400 bg-gray-50/20">
                        <th className="py-3.5 px-4 font-extrabold">Name</th>
                        <th className="py-3.5 px-4 font-extrabold">Email</th>
                        <th className="py-3.5 px-4 font-extrabold">Role</th>
                        <th className="py-3.5 px-4 font-extrabold">Status</th>
                        <th className="py-3.5 px-4 font-extrabold">Last Activity</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminsList.map((adm, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-slate-50">
                          <td className="py-4 px-4 font-extrabold text-slate-900">{adm.name}</td>
                          <td className="py-4 px-4 font-medium text-gray-500 font-mono">{adm.email}</td>
                          <td className="py-4 px-4">
                            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-mono">
                              {adm.role}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold text-emerald-700">
                              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full inline-block" />
                              Active
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-400 font-medium font-mono">{adm.lastActivity}</td>
                          <td className="py-4 px-4 text-right">
                            <div className="relative">
                              <button
                                onClick={() => setActiveRowActionMenuId(activeRowActionMenuId === `admin-${adm.id}` ? null : `admin-${adm.id}`)}
                                className="text-gray-400 hover:text-slate-900 p-1 cursor-pointer"
                              >
                                <MoreVertical className="h-4.5 w-4.5" />
                              </button>
                              {activeRowActionMenuId === `admin-${adm.id}` && (
                                <div className="absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[160px]">
                                  <div className="px-3 py-2 border-b border-gray-100">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase">Change Role</span>
                                    <select
                                      onChange={(e) => { if (e.target.value) handleAdminUpdateRole(adm.id, e.target.value); }}
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
                                    onClick={() => handleAdminSuspend(adm.id)}
                                    className="w-full text-left px-4 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Ban className="h-3.5 w-3.5" /> Suspend
                                  </button>
                                  <button
                                    onClick={() => handleAdminRestore(adm.id)}
                                    className="w-full text-left px-4 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <RefreshCw className="h-3.5 w-3.5" /> Restore
                                  </button>
                                  <button
                                    onClick={() => handleAdminSoftDelete(adm.id)}
                                    className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Role Management Section */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">Roles</h3>
                  <button
                    onClick={() => { setEditingRole(null); setNewRole({ name: "", description: "", permissionIds: [] }); setIsRoleModalOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Add Role
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] font-extrabold uppercase text-gray-400 bg-gray-50/20">
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4">Permissions</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rolesList.map((role) => (
                        <tr key={role.id} className="border-b border-gray-50 hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-900">{role.name}</td>
                          <td className="py-3 px-4 text-gray-500">{role.description}</td>
                          <td className="py-3 px-4">
                            <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                              {role.permissions?.length || 0} permissions
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setEditingRole(role);
                                  setNewRole({ name: role.name, description: role.description, permissionIds: role.permissions?.map(p => p.id) || [] });
                                  setIsRoleModalOpen(true);
                                }}
                                className="text-gray-400 hover:text-blue-600 p-1 cursor-pointer"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteRole(role.id)}
                                className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
          {activeMenu === "plans" && (
            <div className="space-y-6 animate-fade-in text-slate-900">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-display">
                  Platform Subscription Packages
                </h2>
                <p className="text-xs text-gray-400">
                  Manage the tiers and flat regulatory pricing standards for residential domains across Nigeria.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Starter Tier</span>
                    <h3 className="text-base font-black mt-1">SME Starter Plan</h3>
                    <div className="my-4">
                      <span className="text-2xl font-black">₦15,000</span>
                      <span className="text-xs text-gray-400">/ month</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                      Designed for single gated plots with under 50 resident homes. Includes basic gate code generation and standard WhatsApp coordination.
                    </p>
                  </div>
                  <button className="w-full bg-slate-905 text-white bg-slate-900 hover:bg-black text-xs font-bold py-2.5 rounded-xl mt-6 transition-colors">Configure starter</button>
                </div>

                <div className="bg-white rounded-2xl border-2 border-blue-600 p-6 flex flex-col justify-between shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-[8.5px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl font-mono">
                    Most Popular
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Growth Tier</span>
                    <h3 className="text-base font-black mt-1">Growth High-Rise</h3>
                    <div className="my-4">
                      <span className="text-2xl font-black">₦35,000</span>
                      <span className="text-xs text-gray-400">/ month</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                      Designed for mid-tier residential properties (50-300 homes) desiring full estate staff police check vetting credits and vehicle scanner stamp integration.
                    </p>
                  </div>
                  <button className="w-full bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl mt-6 transition-transform hover:bg-blue-700">Configure Growth</button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Premium Tier</span>
                    <h3 className="text-base font-black mt-1">Enterprise Estate</h3>
                    <div className="my-4">
                      <span className="text-2xl font-black">₦75,000</span>
                      <span className="text-xs text-gray-400">/ month</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                      Infinite capacity system with offline backup, unlimited visitor passes, biometric verification gates connect, and custom Nigeria security command dispatcher access.
                    </p>
                  </div>
                  <button className="w-full bg-slate-900 hover:bg-black text-white text-xs font-bold py-2.5 rounded-xl mt-6 transition-colors">Configure Enterprise</button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 7: BILLING, LOGS, SettingsPlaceholder */}
          {["billing", "tickets", "logs", "settings"].includes(activeMenu) && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center animate-fade-in space-y-4 shadow-sm">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-slate-400 border border-gray-150 mx-auto">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-black text-slate-950 capitalize">{activeMenu} panel configuration</h3>
                <p className="text-xs text-gray-500 leading-relaxed mt-2">
                  This sub-panel is integrated with secure global admin credentials. Current operations are routed to live platform servers in Abuja and Lagos nodes, safely preserving real database safety.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 max-w-sm mx-auto">
                <button 
                  onClick={() => navigate("/admin/dashboard")}
                  className="bg-slate-900 hover:bg-black text-white px-5 py-2 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER DESIGNS */}
        <footer className="px-6 py-4 bg-white border-t border-gray-150 text-[10px] text-gray-400 font-mono mt-auto flex justify-between items-center shrink-0">
          <span>© 2026 Vanguard Oversight central systems node</span>
          <div className="flex gap-4">
            <span className="hover:text-gray-650 cursor-pointer underline">Security Rule</span>
            <span className="hover:text-gray-650 cursor-pointer underline">Platform Logs</span>
          </div>
        </footer>

      </div>

      {/* MODAL MODULAR SUBSETS AND SLIDE-OVERS */}

      {/* 1. ONBOARD NEW ESTATE POPUP MODAL - HIGH FIDELITY DESIGN */}
      {isOnboardModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 px-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl p-8 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <button 
              className="absolute top-6 right-6 text-gray-400 hover:text-slate-900 transition-colors"
              onClick={() => setIsOnboardModalOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-900 font-display leading-none">
                Onboard New Estates
              </h3>
              <p className="text-xs text-gray-400 font-bold mt-2">
                The admin will manage the estate
              </p>
            </div>

            <form onSubmit={handleOnboardEstateSubmit} className="space-y-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">

                <div className="relative">
                  <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
                    Admin First Name
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input 
                      type="text" required placeholder="John" 
                      className="w-full text-xs pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold placeholder:text-gray-200"
                      onChange={(e) => setNewEstate({...newEstate, owner: e.target.value + ' ' + (newEstate.owner.split(' ')[1] || '')})}
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
                    Admin Last Name
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input 
                      type="text" required placeholder="Miller" 
                      className="w-full text-xs pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold placeholder:text-gray-200"
                      onChange={(e) => setNewEstate({...newEstate, owner: (newEstate.owner.split(' ')[0] || '') + ' ' + e.target.value})}
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
                    Estate Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input 
                      type="text" required placeholder="Sunset Valley Properties" value={newEstate.name}
                      onChange={(e) => setNewEstate({...newEstate, name: e.target.value})}
                      className="w-full text-xs pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold placeholder:text-gray-200"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input 
                      type="email" required placeholder="youremail@gmail.com" value={newEstate.email}
                      onChange={(e) => setNewEstate({...newEstate, email: e.target.value})}
                      className="w-full text-xs pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold placeholder:text-gray-200"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <div className="w-16 h-12 bg-slate-50 border border-gray-200 rounded-xl flex items-center justify-center text-[10px] font-black text-gray-400">+234</div>
                    <div className="relative flex-1">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input 
                        type="text" required placeholder="803 - 533 - 5432" value={newEstate.phone}
                        onChange={(e) => setNewEstate({...newEstate, phone: e.target.value})}
                        className="w-full text-xs pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold placeholder:text-gray-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
                    State
                  </label>
                  <div className="relative">
                    <select className="w-full text-xs px-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold appearance-none">
                      <option>Lagos</option>
                      <option>Abuja</option>
                      <option>Surulere</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="relative sm:col-span-1">
                  <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 h-3.5 w-3.5 text-gray-400" />
                    <textarea 
                      rows={2} placeholder="e.g Suite 402, Marble Towers, Kingsway Road" value={newEstate.address}
                      onChange={(e) => setNewEstate({...newEstate, address: e.target.value})}
                      className="w-full text-xs pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold placeholder:text-gray-200 resize-none"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
                    City
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input 
                      type="text" placeholder="Surulere" value={newEstate.city}
                      onChange={(e) => setNewEstate({...newEstate, city: e.target.value})}
                      className="w-full text-xs pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold placeholder:text-gray-200"
                    />
                  </div>
                </div>

              </div>

              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSendLoginDetails(!sendLoginDetails)}>
                <div className={`h-5 w-5 rounded flex items-center justify-center transition-colors ${sendLoginDetails ? "bg-blue-600" : "bg-gray-200 border border-gray-300"}`}>
                  {sendLoginDetails && <Check className="h-3.5 w-3.5 text-white stroke-[4]" />}
                </div>
                <span className="text-[11px] font-bold text-slate-500">Send login details to admin email</span>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" onClick={() => setIsOnboardModalOpen(false)}
                  className="flex-1 py-4 bg-slate-50 text-slate-600 text-xs font-black rounded-2xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel Onboarding
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 text-white text-xs font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Onboarding Estate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT ESTATE POPUP MODAL - MATCHES DESIGN STANDARD */}
      {isEditModalOpen && editingEstate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 px-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl p-8 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <button 
              className="absolute top-6 right-6 text-gray-400 hover:text-slate-900 transition-colors"
              onClick={() => { setIsEditModalOpen(false); setEditingEstate(null); }}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-900 font-display leading-none">
                Update Estate Records
              </h3>
              <p className="text-xs text-gray-400 font-bold mt-2">
                Modify administrative parameters for {editingEstate.name}
              </p>
            </div>

            <form onSubmit={handleEditEstateSubmit} className="space-y-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">

                <div className="relative">
                  <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
                    Estate Manager
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input 
                      type="text" required value={editingEstate.owner}
                      onChange={(e) => setEditingEstate({...editingEstate, owner: e.target.value})}
                      className="w-full text-xs pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
                    Estate Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input 
                      type="text" required value={editingEstate.name}
                      onChange={(e) => setEditingEstate({...editingEstate, name: e.target.value})}
                      className="w-full text-xs pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
                    Contact Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input 
                      type="email" required value={editingEstate.email}
                      onChange={(e) => setEditingEstate({...editingEstate, email: e.target.value})}
                      className="w-full text-xs pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input 
                      type="text" value={editingEstate.phone}
                      onChange={(e) => setEditingEstate({...editingEstate, phone: e.target.value})}
                      className="w-full text-xs pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="relative sm:col-span-1">
                  <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
                    Official Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 h-3.5 w-3.5 text-gray-400" />
                    <textarea 
                      rows={2} value={editingEstate.address}
                      onChange={(e) => setEditingEstate({...editingEstate, address: e.target.value})}
                      className="w-full text-xs pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold resize-none"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
                    City Location
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input 
                      type="text" value={editingEstate.city}
                      onChange={(e) => setEditingEstate({...editingEstate, city: e.target.value})}
                      className="w-full text-xs pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold"
                    />
                  </div>
                </div>

              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" onClick={() => { setIsEditModalOpen(false); setEditingEstate(null); }}
                  className="flex-1 py-4 bg-slate-50 text-slate-600 text-xs font-black rounded-2xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Discard Changes
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-slate-900 text-white text-xs font-black rounded-2xl hover:bg-black transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Update Records
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 3. VISITOR CODE DETAILS POPUP MODAL */}
      {isVisitorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-gray-200 shadow-2xl relative">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-650"
              onClick={() => setIsVisitorModalOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4 text-center">
              <span className="text-[9px] font-bold bg-[#2563eb]/10 text-blue-700 px-2.5 py-0.5 rounded uppercase inline-block font-mono">
                Visitor pass dispatcher
              </span>
              <h3 className="text-base font-black text-gray-950 mt-2 font-display text-slate-900">
                Visitor's Code Details
              </h3>
            </div>

            <div className="space-y-4 py-2 text-xs text-slate-700">
              
              {/* Passcode Block strictly matched to third picture widget style */}
              <div className="relative p-5 bg-slate-50 border border-gray-200 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Visitor's Code Details</span>
                <span className="text-3xl font-black text-red-600 block mt-2 font-mono tracking-wider">
                  {vPassCode}
                </span>

                <button 
                  onClick={generatePasscode}
                  className="mt-3 text-[10px] bg-white hover:bg-gray-50 text-blue-600 font-bold py-1 px-3 rounded-md border border-gray-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Regenerate Code</span>
                </button>
              </div>

              {/* Sub parameters listing exact values */}
              <div className="space-y-2 pt-2 text-xs border-t border-gray-100 font-sans">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-semibold">Category of pass:</span>
                  <span className="font-extrabold text-slate-900">{vCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-semibold">Verification Node:</span>
                  <span className="font-extrabold text-emerald-700">Verifying code on enter</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-semibold">Pass Validity duration:</span>
                  <span className="font-extrabold text-blue-600">{vDuration} Hours</span>
                </div>
              </div>

            </div>

            <div className="mt-6 flex gap-2">
              <button 
                onClick={() => setIsVisitorModalOpen(false)}
                className="flex-1 py-2.5 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold rounded-xl cursor-pointer"
              >
                Close details
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${vPassCode}`);
                  alert("Copied code to clipboard!");
                  setIsVisitorModalOpen(false);
                }}
                className="flex-1 py-2.5 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm text-center cursor-pointer"
              >
                Copy Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. DOMESTIC STAFF PROFILE DETAILS SLIDE-OUT / MODAL - EXACT REPLICA OF THE THIRD IMAGE */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 border border-gray-250 shadow-2xl relative animate-fade-in font-sans text-slate-800">
            
            {/* Top Close button and edit pencil */}
            <button 
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 outline-none transition-colors"
              onClick={() => setSelectedStaff(null)}
            >
              <X className="h-5 w-5" />
            </button>

            {/* Title with edit pencil icon */}
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1">
                <span>Staff Profile Details</span>
                <button className="text-gray-400 hover:text-slate-800 p-0.5">
                  <Edit className="h-3.5 w-3.5" />
                </button>
              </h3>
            </div>

            {/* Profile Avatar, Identity text details exactly from photo */}
            <div className="flex items-center gap-4.5 pb-5 border-b border-gray-100">
              <img 
                src={selectedStaff.gender === "Female" 
                  ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                } 
                alt={selectedStaff.name} 
                referrerPolicy="no-referrer"
                className="h-14 w-14 rounded-full border border-gray-200 object-cover bg-gray-100" 
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-extrabold text-slate-900 text-base leading-none block truncate">{selectedStaff.name}</h4>
                  
                  {/* Status card Badge matched strictly to image: green border, light text */}
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50/70 py-1 px-3 border border-emerald-150 rounded-full font-mono shrink-0">
                    ● Active
                  </span>
                </div>
                <span className="text-[10.5px] text-gray-450 block font-mono mt-1 text-gray-400 leading-none">{selectedStaff.email}</span>
                <span className="text-[10.5px] text-gray-500 block mt-1.5 leading-none">
                  {selectedStaff.phone} <span className="text-gray-300 mx-1">•</span> Sunset Valley Residencies
                </span>
              </div>
            </div>

            {/* Visual description grid */}
            <div className="py-4 space-y-3 font-sans text-xs border-b border-gray-100">
              <div className="grid grid-cols-2 gap-y-3.5">
                
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Role :</span>
                  <span className="font-extrabold text-blue-600 font-sans">{selectedStaff.role}</span>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Date Added :</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedStaff.added}</span>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Gender :</span>
                  <span className="font-bold text-slate-900">{selectedStaff.gender}</span>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Staff ID :</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedStaff.staffId}</span>
                </div>

                <div className="flex flex-col gap-0.5 col-span-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Shift :</span>
                  <span className="font-bold text-slate-900 font-sans">{selectedStaff.shift}</span>
                </div>

              </div>
            </div>

            {/* Activity Logs inside Details exactly matched */}
            <div className="py-4 font-sans text-xs">
              <h5 className="text-[10.5px] font-black uppercase text-slate-900 tracking-wider mb-2.5">Activity Logs</h5>
              
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left font-sans text-[11px] text-slate-700">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-200 text-[10px] text-gray-400 uppercase font-black">
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-slate-50/20 font-sans">
                      <td className="py-2.5 px-3 font-mono text-gray-500">Mar 2, 2026 10:00AM</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">Checked In Today</td>
                      <td className="py-2.5 px-3 font-bold text-slate-700">John Doe (A12)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Capsule Buttons matching the third image */}
            <div className="mt-5 pt-4 border-t border-gray-150 flex gap-3.5">
              
              {/* Deactivate Button */}
              <button 
                onClick={() => {
                  const confirmToggle = window.confirm(`Deactivate staff access rights for ${selectedStaff.name}?`);
                  if (confirmToggle) {
                    setStaffList(staffList.filter(item => item.id !== selectedStaff.id));
                    setSelectedStaff(null);
                  }
                }}
                className="flex-1 py-3 text-xs bg-rose-50 border border-rose-200 hover:bg-rose-100/80 text-rose-600 font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                🗑 Deactivate
              </button>

              {/* Suspend Access Button */}
              <button 
                onClick={() => {
                  const confirmToggle = window.confirm(`Suspend access license keys temporarily for ${selectedStaff.name}?`);
                  if (confirmToggle) {
                    setStaffList(staffList.map(item => item.id === selectedStaff.id ? { ...item, status: "Suspended" } : item));
                    setSelectedStaff(null);
                  }
                }}
                className="flex-1 py-3 text-xs bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                ⚠ Suspend Access
              </button>

            </div>

          </div>
        </div>
      )}

      {/* 5. ADD NEW OPERATING ADMIN POPUP MODAL */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-200 shadow-2xl relative">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-650"
              onClick={() => setIsAdminModalOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5">
              <span className="text-[10px] font-black bg-blue-50 text-blue-700 uppercase px-2 py-0.5 rounded block w-max font-mono">
                System Onboarding Sweeps
              </span>
              <h3 className="text-base font-black text-slate-950 mt-1">
                Add New System Operator
              </h3>
            </div>

            <form onSubmit={handleAddAdminSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">First Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Abdul"
                    value={newAdmin.firstName}
                    onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Last Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Suleiman"
                    value={newAdmin.lastName}
                    onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Workspace Email</label>
                <input 
                  type="email"
                  required
                  placeholder="e.g. abdul@globalestates.ng"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Administrative Role Category</label>
                <select
                  value={newAdmin.roleId}
                  onChange={(e) => setNewAdmin({ ...newAdmin, roleId: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg outline-none"
                >
                  <option value="">Select Role</option>
                  {rolesList.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                  {rolesList.length === 0 && (
                    <>
                      <option value="super-admin">Super Admin</option>
                      <option value="support-lead">Support Lead</option>
                      <option value="system-admin">System Admin</option>
                    </>
                  )}
                </select>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[10px] text-amber-800 flex items-start gap-1.5">
                <ShieldAlert className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                <span>
                  Adding administrators prompts the system to issue temporary secure activation keys directly to their registered workspace emails.
                </span>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="flex-1 py-2 text-xs bg-gray-150 text-gray-700 hover:bg-gray-200 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-sm"
                >
                  Authorize Operator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROLE CREATE/EDIT MODAL */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-200 shadow-2xl relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-650"
              onClick={() => { setIsRoleModalOpen(false); setEditingRole(null); }}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5">
              <span className="text-[10px] font-black bg-blue-50 text-blue-700 uppercase px-2 py-0.5 rounded block w-max font-mono">
                {editingRole ? "Edit Role" : "Create Role"}
              </span>
              <h3 className="text-base font-black text-slate-950 mt-1">
                {editingRole ? "Update Role Details" : "Add New Role"}
              </h3>
            </div>

            <form onSubmit={editingRole ? handleUpdateRole : handleCreateRole} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Role Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Estate Manager"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Brief description of this role"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Permissions</label>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                  {permissionsList.length === 0 ? (
                    <p className="text-[10px] text-gray-400 py-2 text-center">No permissions available</p>
                  ) : (
                    permissionsList.map((perm) => (
                      <label key={perm.id} className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newRole.permissionIds.includes(perm.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewRole({ ...newRole, permissionIds: [...newRole.permissionIds, perm.id] });
                            } else {
                              setNewRole({ ...newRole, permissionIds: newRole.permissionIds.filter(id => id !== perm.id) });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-xs font-bold text-slate-700">{perm.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setIsRoleModalOpen(false); setEditingRole(null); }}
                  className="flex-1 py-2 text-xs bg-gray-150 text-gray-700 hover:bg-gray-200 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-sm"
                >
                  {editingRole ? "Update Role" : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. ADD RESIDENT POPUP MODAL - HIGH FIDELITY DESIGN */}
      {isAddResidentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 px-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl p-8 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <button 
              className="absolute top-6 right-6 text-gray-400 hover:text-slate-900 transition-colors"
              onClick={() => setIsAddResidentModalOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-900 font-display leading-none">
                Add New Resident
              </h3>
              <p className="text-xs text-gray-400 font-bold mt-2">
                Register a new household to the estate system
              </p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const added = {
                  id: `res-${Date.now()}`,
                  ...newResident,
                  joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                  vehicles: [],
                  familyCount: 1
                };
                setResidents([added, ...residents]);
                setIsAddResidentModalOpen(false);
                setNewResident({ name: "", email: "", phone: "", estate: "Sunset Valley Residences", houseNo: "", status: "Active" });
              }}
              className="space-y-7"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
                
                <div className="relative">
                  <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
                    Full Name
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input 
                      type="text" required placeholder="e.g Chikwendu Emmanuel" 
                      value={newResident.name}
                      onChange={(e) => setNewResident({...newResident, name: e.target.value})}
                      className="w-full text-xs pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input 
                      type="email" required placeholder="youremail@gmail.com" 
                      value={newResident.email}
                      onChange={(e) => setNewResident({...newResident, email: e.target.value})}
                      className="w-full text-xs pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input 
                      type="text" required placeholder="+234 803 587 6754" 
                      value={newResident.phone}
                      onChange={(e) => setNewResident({...newResident, phone: e.target.value})}
                      className="w-full text-xs pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
                    House Unit
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input 
                      type="text" required placeholder="e.g Unit 12A" 
                      value={newResident.houseNo}
                      onChange={(e) => setNewResident({...newResident, houseNo: e.target.value})}
                      className="w-full text-xs pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold"
                    />
                  </div>
                </div>

              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" onClick={() => setIsAddResidentModalOpen(false)}
                  className="flex-1 py-4 bg-slate-50 text-slate-600 text-xs font-black rounded-2xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 text-white text-xs font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Add Resident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. EDIT RESIDENT POPUP MODAL - HIGH FIDELITY DESIGN */}
      {isEditResidentModalOpen && editingResident && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 px-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl p-8 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <button 
              className="absolute top-6 right-6 text-gray-400 hover:text-slate-900 transition-colors"
              onClick={() => { setIsEditResidentModalOpen(false); setEditingResident(null); }}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-900 font-display leading-none">
                Update Resident Details
              </h3>
              <p className="text-xs text-gray-400 font-bold mt-2">
                Modify household information for {editingResident.name}
              </p>
            </div>

            <form onSubmit={handleEditResidentSubmit} className="space-y-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
                
                <div className="relative">
                  <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
                    Full Name
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input 
                      type="text" required value={editingResident.name}
                      onChange={(e) => setEditingResident({...editingResident, name: e.target.value})}
                      className="w-full text-xs pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input 
                      type="email" required value={editingResident.email}
                      onChange={(e) => setEditingResident({...editingResident, email: e.target.value})}
                      className="w-full text-xs pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input 
                      type="text" required value={editingResident.phone}
                      onChange={(e) => setEditingResident({...editingResident, phone: e.target.value})}
                      className="w-full text-xs pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
                    House Unit
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input 
                      type="text" required value={editingResident.houseNo}
                      onChange={(e) => setEditingResident({...editingResident, houseNo: e.target.value})}
                      className="w-full text-xs pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold"
                    />
                  </div>
                </div>

              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" onClick={() => { setIsEditResidentModalOpen(false); setEditingResident(null); }}
                  className="flex-1 py-4 bg-slate-50 text-slate-600 text-xs font-black rounded-2xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Discard Changes
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-slate-900 text-white text-xs font-black rounded-2xl hover:bg-black transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Update Records
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Simple Helper Notebook icon as requested
function NotebookHelperIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10" />
      <path d="M6 10h10" />
      <path d="M6 14h10" />
    </svg>
  );
}
