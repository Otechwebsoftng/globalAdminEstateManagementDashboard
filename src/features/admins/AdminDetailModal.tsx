import { useQuery } from "@tanstack/react-query";
import { Mail, Shield, Calendar, Trash2, Hash, Building2 } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { CardSkeleton } from "../../components/Skeleton";
import { useConfirm } from "../../components/ui/ConfirmDialog";
import { useToast } from "../../components/Toast";
import { globalAdminApi, estateAdminApi, estateApi } from "../../services/api";
import { queryClient } from "../../lib/queryClient";
import { qk } from "../../lib/queryKeys";
import { formatDisplayDate } from "../../lib/format";

/**
 * Which lookup to use:
 *  - "global"  GET /global-admin/{adminId}
 *  - "estate"  GET /estate-admin/{adminId}
 *  - "scoped"  GET /estates/{estateId}/estate-admin/{adminId}
 */
export type AdminSource = "global" | "estate" | "scoped";

export interface AdminDetailModalProps {
  adminId: string | null;
  source: AdminSource;
  /** Required for the "scoped" lookup. */
  estateId?: string;
  onClose: () => void;
  onDeleted?: () => void;
}

function Row({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="h-8 w-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{label}</span>
        <span className="text-xs font-bold text-slate-800 break-words">{value || "--"}</span>
      </div>
    </div>
  );
}

export default function AdminDetailModal({
  adminId, source, estateId, onClose, onDeleted,
}: AdminDetailModalProps) {
  const { showToast } = useToast();
  const confirm = useConfirm();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "detail", source, adminId, estateId],
    queryFn: () => {
      if (source === "global") return globalAdminApi.getById(adminId!);
      if (source === "scoped") return estateApi.getEstateAdmin(estateId!, adminId!);
      return estateAdminApi.getById(adminId!);
    },
    enabled: !!adminId && (source !== "scoped" || !!estateId),
    retry: false,
  });

  const a: any = (data as any)?.data ?? data ?? {};
  const name = [a?.firstName, a?.lastName].filter(Boolean).join(" ") || a?.name || "--";
  const isGlobal = source === "global";

  const hardDelete = async () => {
    if (!adminId) return;
    const ok = await confirm({
      title: "Delete this admin permanently?",
      description: `${name} will be removed for good. This cannot be undone.`,
      confirmLabel: "Delete", tone: "danger",
    });
    if (!ok) return;
    try {
      if (isGlobal) await globalAdminApi.remove(adminId);
      else await estateAdminApi.remove(adminId);
      queryClient.invalidateQueries({ queryKey: isGlobal ? qk.admins() : qk.estateAdmins(estateId) });
      showToast("Admin deleted", "success");
      onDeleted?.();
      onClose();
    } catch (err: any) {
      showToast(err?.message || "Could not delete this admin");
    }
  };

  return (
    <Modal
      open={!!adminId}
      onClose={onClose}
      title="Admin Details"
      description={source === "scoped" ? "Scoped to this estate" : undefined}
      size="md"
    >
      {isLoading ? <CardSkeleton /> : isError ? (
        <p className="text-xs font-bold text-rose-600 py-6">
          Could not load this admin. They may not exist, or not be visible to your account.
        </p>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-black text-sm shrink-0">
              {name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base font-black text-slate-900">{name}</h3>
                <Badge status={String(a?.status || "active").toUpperCase()} />
              </div>
              <p className="text-[11px] font-bold text-gray-400">
                {isGlobal ? "Global administrator" : "Estate administrator"}
              </p>
            </div>
          </div>

          <div>
            <Row icon={Mail} label="Email" value={a?.email} />
            <Row icon={Shield} label="Role" value={a?.role?.name ?? a?.role} />
            <Row icon={Hash} label="Admin ID" value={a?.id ?? adminId ?? undefined} />
            {!isGlobal && (
              <Row icon={Building2} label="Estate" value={a?.estate?.estateName ?? a?.estateName} />
            )}
            <Row icon={Calendar} label="Created" value={formatDisplayDate(a?.createdAt)} />
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button" onClick={onClose}
              className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50 transition-all"
            >
              Close
            </button>
            {/* The scoped lookup is read-only: deletion lives on the admin's own route. */}
            {source !== "scoped" && (
              <button
                type="button" onClick={hardDelete}
                className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-xs font-black px-5 py-2.5 rounded-xl transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Permanently
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
