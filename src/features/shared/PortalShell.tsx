import { type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Power, type LucideIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export interface PortalNavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

export interface PortalShellProps {
  brand: string;
  subtitle?: string;
  brandIcon: LucideIcon;
  nav: PortalNavItem[];
  children: ReactNode;
  /** Defaults to path matching; pass one when a section owns several routes. */
  isActive?: (item: PortalNavItem) => boolean;
}

/** Sidebar + topbar chrome shared by the estate, resident and security portals. */
export default function PortalShell({
  brand, subtitle, brandIcon: BrandIcon, nav, children, isActive,
}: PortalShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const active = (item: PortalNavItem) =>
    isActive ? isActive(item) : location.pathname === item.path;

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex text-slate-900">
      <aside className="hidden lg:flex flex-col w-64 bg-white shrink-0 border-r border-gray-200">
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
            <BrandIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-extrabold block truncate text-slate-900">{brand}</span>
            {subtitle && (
              <span className="text-[10px] text-gray-400 font-bold block truncate">{subtitle}</span>
            )}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                active(item)
                  ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
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
          <span className="text-xs font-black text-slate-900 lg:hidden">{brand}</span>
          <div className="ml-auto text-right">
            <span className="text-xs font-black text-slate-900 block">{user?.name}</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              {user?.role}
            </span>
          </div>
        </header>

        {/* Sections are reachable by URL even when the nav omits them. */}
        <div className="lg:hidden border-b border-gray-200 bg-white px-4 py-2 flex gap-1 overflow-x-auto">
          {nav.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap ${
                active(item) ? "bg-blue-50 text-blue-600" : "text-slate-500"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
