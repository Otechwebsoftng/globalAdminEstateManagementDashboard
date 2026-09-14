import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard, KeyRound, User as UserIcon, Home, Phone, Mail, Plus, Building2,
} from "lucide-react";
import PortalShell, { type PortalNavItem } from "../shared/PortalShell";
import GenerateVisitorCodeModal from "../visitors/GenerateVisitorCodeModal";
import SettingsPage from "../settings/SettingsPage";
import { CardSkeleton } from "../../components/Skeleton";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { residentApi } from "../../services/api";
import { getResidentName, getResidentPhone } from "../../lib/format";

const NAV: PortalNavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/resident/dashboard" },
  { key: "visitors", label: "Visitor Codes", icon: KeyRound, path: "/resident/visitors" },
  { key: "profile", label: "Profile", icon: UserIcon, path: "/resident/profile" },
];

function Field({ icon: Icon, label, value }: { icon: typeof Home; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{label}</span>
        <span className="text-xs font-bold text-slate-800 break-words">{value || "--"}</span>
      </div>
    </div>
  );
}

/** The resident's own portal — GET /residents/{userId} for their record. */
export default function ResidentPortal() {
  const location = useLocation();
  const { user } = useAuth();
  const [isIssuing, setIsIssuing] = useState(false);

  const section = useMemo(() => location.pathname.split("/").filter(Boolean)[1] ?? "dashboard", [location.pathname]);

  const { data, isLoading } = useQuery({
    queryKey: ["resident", "me", user?.id],
    queryFn: () => residentApi.getById(user!.id),
    enabled: !!user?.id,
    retry: false,
  });

  const me: any = (data as any)?.data ?? data ?? {};
  const estateId = me?.estateId ?? me?.estate?.id ?? user?.estateId ?? "";

  const body = () => {
    if (section === "profile") return <SettingsPage />;

    if (section === "visitors") {
      return (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-display">Visitor Codes</h2>
              <p className="text-xs text-gray-400 font-bold tracking-tight">
                Issue a one-time code for a guest
              </p>
            </div>
            <button
              onClick={() => setIsIssuing(true)}
              disabled={!estateId}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-lg shadow-blue-100 disabled:opacity-50 transition-all"
            >
              <Plus className="h-4 w-4" />
              Generate Visitor Code
            </button>
          </div>

          {/* The backend exposes no endpoint to list previously issued codes. */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center space-y-2">
            <KeyRound className="h-7 w-7 text-gray-300 mx-auto" />
            <p className="text-sm font-black text-slate-900">No code history available</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Codes can be issued here, but the API has no endpoint for listing past codes yet.
            </p>
          </div>
        </div>
      );
    }

    if (isLoading) return <CardSkeleton />;

    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-display">
            Welcome{me?.firstName ? `, ${me.firstName}` : ""}
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">Your residence</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-black text-slate-900">
                {getResidentName(me) || user?.name}
              </h3>
              <Badge status={String(me?.status || "active").toUpperCase()} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field icon={Mail} label="Email" value={me?.email ?? user?.email} />
              <Field icon={Phone} label="Phone" value={getResidentPhone(me)} />
              <Field icon={Home} label="House No" value={me?.houseNo} />
              <Field icon={Building2} label="Estate" value={me?.estate?.estateName ?? me?.estateName} />
            </div>
          </div>

          <button
            onClick={() => setIsIssuing(true)}
            disabled={!estateId}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-left hover:border-blue-300 disabled:opacity-50 transition-colors"
          >
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <KeyRound className="h-4 w-4" />
            </div>
            <span className="text-sm font-black text-slate-900 block">Generate Visitor Code</span>
            <span className="text-[11px] text-gray-400 font-bold">Issue access for a guest</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <PortalShell
        brand="Resident" subtitle={me?.houseNo ? `House ${me.houseNo}` : undefined}
        brandIcon={Home} nav={NAV}
        isActive={(i) => i.path.endsWith(section)}
      >
        {body()}
      </PortalShell>
      <GenerateVisitorCodeModal
        open={isIssuing} estateId={estateId} onClose={() => setIsIssuing(false)}
      />
    </>
  );
}
