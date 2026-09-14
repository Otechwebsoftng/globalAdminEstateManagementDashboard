import { useState } from "react";
import { Search, KeyRound, AlertCircle } from "lucide-react";
import { FloatingInput } from "../../components/ui/Field";
import { permissionApi } from "../../services/api";

type Found = { found: boolean; name?: string; slug?: string; description?: string } | null;

/**
 * GET /permission/slug.
 *
 * Note: the spec declares `slug` as a path parameter but the path carries no
 * placeholder, so the client sends it as a query string. If lookups 404 against
 * the live API, that mismatch is the first thing to check with the backend.
 */
export default function PermissionLookup() {
  const [slug, setSlug] = useState("");
  const [result, setResult] = useState<Found>(null);
  const [isSearching, setIsSearching] = useState(false);

  const lookup = async () => {
    if (!slug.trim()) return;
    setIsSearching(true);
    setResult(null);
    try {
      const res: any = await permissionApi.getBySlug(slug.trim());
      const p = res?.data ?? res;
      setResult(p?.id || p?.name
        ? { found: true, name: p.name, slug: p.slug, description: p.description }
        : { found: false });
    } catch {
      setResult({ found: false });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div>
        <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
          <KeyRound className="h-3.5 w-3.5 text-blue-600" />
          Look up a permission
        </h3>
        <p className="text-[11px] text-gray-400 font-bold mt-0.5">
          Find a permission by its slug.
        </p>
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <FloatingInput
            label="Slug" placeholder="estate.create"
            leading={<Search className="h-3.5 w-3.5" />}
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setResult(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") lookup(); }}
            className="font-mono"
          />
        </div>
        <button
          type="button" onClick={lookup} disabled={isSearching || !slug.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-5 py-3.5 rounded-xl shadow-lg shadow-blue-100 disabled:opacity-50 transition-all shrink-0"
        >
          {isSearching ? "Searching..." : "Look up"}
        </button>
      </div>

      {result && (
        result.found ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <span className="text-xs font-black text-emerald-800 block">{result.name}</span>
            {result.slug && <span className="text-[10px] font-mono text-emerald-700">{result.slug}</span>}
            {result.description && (
              <p className="text-[11px] font-bold text-emerald-700 mt-1">{result.description}</p>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="text-xs font-bold text-amber-700">
              No permission found for that slug.
            </span>
          </div>
        )
      )}
    </div>
  );
}
