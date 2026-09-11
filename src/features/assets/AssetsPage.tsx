import { Building2, Car, FileImage } from "lucide-react";

export type AssetKind = "fixed" | "mobile";

const COPY: Record<AssetKind, { title: string; subtitle: string; icon: typeof Building2 }> = {
  fixed: {
    title: "Fixed Assets",
    subtitle: "Manage land and building assets across estates",
    icon: Building2,
  },
  mobile: {
    title: "Mobile Assets",
    subtitle: "Manage vehicles and movable assets across estates",
    icon: Car,
  },
};

/**
 * Placeholder for Board 6. The navigation and routing are in place; the list,
 * detail, edit and Add Property wizard still need the design at a resolution
 * where the field and column labels are readable.
 */
export default function AssetsPage({ kind }: { kind: AssetKind }) {
  const { title, subtitle, icon: Icon } = COPY[kind];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-display">{title}</h2>
        <p className="text-xs text-gray-400 font-bold tracking-tight">{subtitle}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center space-y-4 shadow-sm">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 mx-auto">
          <Icon className="h-6 w-6" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-base font-black text-slate-950">{title} — awaiting design detail</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Navigation and routing are in place. The list, detail, edit and
            4-step Add Property screens need the mockup at a resolution where the
            column and field labels are legible.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
          <FileImage className="h-3 w-3" />
          Needs higher-resolution mockup
        </div>
      </div>
    </div>
  );
}
