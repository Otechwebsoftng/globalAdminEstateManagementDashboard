import { useQuery } from "@tanstack/react-query";
import { Shield, Calendar, KeyRound } from "lucide-react";
import Modal from "../../components/ui/Modal";
import { CardSkeleton } from "../../components/Skeleton";
import { roleApi } from "../../services/api";
import { formatDisplayDate } from "../../lib/format";

/** GET /role/{roleId} — the authoritative permission list for a role. */
export default function RoleDetailModal({
  roleId, onClose,
}: { roleId: string | null; onClose: () => void }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["role", "detail", roleId],
    queryFn: () => roleApi.getById(roleId!),
    enabled: !!roleId,
    retry: false,
  });

  const role: any = (data as any)?.data ?? data ?? {};
  const permissions: Array<{ id: string; name: string; slug?: string }> = role?.permissions ?? [];

  return (
    <Modal open={!!roleId} onClose={onClose} title="Role Details" size="md">
      {isLoading ? <CardSkeleton /> : isError ? (
        <p className="text-xs font-bold text-rose-600 py-6">Could not load this role.</p>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black text-slate-900">{role?.name ?? "--"}</h3>
              <p className="text-[11px] font-bold text-gray-400">
                {role?.description || "No description"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
            <Calendar className="h-3.5 w-3.5" />
            Created {formatDisplayDate(role?.createdAt) || "--"}
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5" />
              Permissions ({permissions.length})
            </span>
            {permissions.length === 0 ? (
              <p className="text-xs font-bold text-gray-400 py-3">This role grants no permissions.</p>
            ) : (
              <div className="max-h-56 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                {permissions.map((p) => (
                  <div key={p.id} className="px-4 py-2.5">
                    <span className="text-xs font-bold text-slate-800 block">{p.name}</span>
                    {p.slug && (
                      <span className="text-[10px] font-mono text-gray-400">{p.slug}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button" onClick={onClose}
              className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
