import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, ShieldCheck, Building2, Car, Settings as SettingsIcon, Power,
} from "lucide-react";
import ResidentsPage from "../residents/ResidentsPage";
import SecurityPersonnelPage from "../security/SecurityPersonnelPage";
import AssetsPage from "../assets/AssetsPage";
import SettingsPage from "../settings/SettingsPage";
import { useAuth } from "../../context/AuthContext";
import { useEstateScope } from "../../hooks/useEstateScope";
import { useBackendMenu } from "../../hooks/useBackendMenu";

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/estate/dashboard" },
  { key: "residents", label: "Residents", icon: Users, path: "/estate/residents" },
  { key: "security", label: "Security Personnel", icon: ShieldCheck, path: "/estate/security" },
  { key: "assets-fixed", label: "Fixed Assets", icon: Building2, path: "/estate/assets/fixed" },
  { key: "assets-mobile", label: "Mobile Assets", icon: Car, path: "/estate/assets/mobile" },
  { key: "settings", label: "Settings", icon: SettingsIcon, path: "/estate/settings" },
] as const;

/**
 * The estate-admin portal. Reuses the estate-scoped screens built for the
 * global tree; useEstateScope pins them to this admin's own estate.
 */
export default function EstateAdminPortal() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const scope = useEstateScope();
  const menu = useBackendMenu();

  const active = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean); // ["estate", section, sub?]
    const section = parts[1] ?? "dashboard";
    if (section === "assets") return parts[2] === "mobile" ? "assets-mobile" : "assets-fixed";
    return section;
  }, [location.pathname]);

  const body = () => {
    switch (active) {
      case "residents": return <ResidentsPage />;
      case "security": return <SecurityPersonnelPage />;
      case "assets-fixed": return <AssetsPage kind="fixed" />;
      case "assets-mobile": return <AssetsPage kind="mobile" />;
      case "settings": return <SettingsPage />;
      default:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-display">
                {scope.current?.name ?? "Your estate"}
              </h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">
                Estate administration
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {NAV.filter((n) => n.key !== "dashboard" && n.key !== "settings").map((n) => (
                <button
                  key={n.key}
                  onClick={() => navigate(n.path)}
                  className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm text-left hover:border-blue-300 transition-colors"
                >
                  <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <n.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-black text-slate-900 block">{n.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  // GET /menu is permission-filtered, so it wins when it returns rows.
  // Flattened one level: this portal's sidebar is not nested.
  const navItems = menu.hasMenu
    ? menu.items.flatMap((n) => (n.children.length ? n.children : [n]))
        .filter((n) => n.path)
        .map((n) => ({ key: n.key, label: n.label, icon: n.icon, path: n.path }))
    : NAV.map((n) => ({ key: n.key, label: n.label, icon: n.icon, path: n.path }));

  const isActive = (path: string) => location.pathname === path
    || (path !== "/estate/dashboard" && location.pathname.startsWith(path));

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex text-slate-900">
      <aside className="hidden lg:flex flex-col w-64 bg-white shrink-0 border-r border-gray-200">
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-extrabold block truncate text-slate-900">Estate Admin</span>
            <span className="text-[10px] text-gray-400 font-bold block truncate">
              {scope.current?.name ?? "Your estate"}
            </span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((n) => (
            <button
              key={n.key}
              onClick={() => navigate(n.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive(n.path)
                  ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              <n.icon className="h-4 w-4" />
              <span>{n.label}</span>
            </button>
          ))}
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all mt-2"
          >
            <Power className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <span className="text-xs font-black text-slate-900 lg:hidden">Estate Admin</span>
          <div className="ml-auto text-right">
            <span className="text-xs font-black text-slate-900 block">{user?.name}</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              {user?.role ?? "Estate Administrator"}
            </span>
          </div>
        </header>
        <div className="p-6">{body()}</div>
      </main>
    </div>
  );
}
