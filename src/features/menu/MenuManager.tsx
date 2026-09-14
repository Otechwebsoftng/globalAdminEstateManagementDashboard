import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, CornerDownRight, Link2, Hash, Check, X, ListTree } from "lucide-react";
import Modal from "../../components/ui/Modal";
import { FloatingInput } from "../../components/ui/Field";
import { FloatingSelect } from "../../components/ui/Select";
import { CardSkeleton } from "../../components/Skeleton";
import { useToast } from "../../components/Toast";
import { menuApi, permissionApi } from "../../services/api";
import { parseList } from "../../lib/parseList";
import { qk } from "../../lib/queryKeys";
import { queryClient } from "../../lib/queryClient";
import { useBackendMenu, resolveIcon, type NavNode } from "../../hooks/useBackendMenu";
import type { CreateMenuDto, Permission } from "../../types/api";

const EMPTY: CreateMenuDto = { name: "", url: "", icon: "", order: 1, permissions: [] };

function Row({ node, depth, onAddChild }: { node: NavNode; depth: number; onAddChild: (n: NavNode) => void }) {
  const Icon = node.icon;
  return (
    <>
      <div
        className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0"
        style={{ paddingLeft: depth * 24 }}
      >
        {depth > 0 && <CornerDownRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />}
        <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-xs font-black text-slate-900 block truncate">{node.label}</span>
          <span className="text-[10px] font-bold text-gray-400 truncate block">{node.path || "no url"}</span>
        </div>
        <span className="text-[10px] font-black text-gray-300">#{node.order}</span>
        <button
          onClick={() => onAddChild(node)}
          className="text-[10px] font-black text-blue-600 hover:text-blue-700 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors shrink-0"
        >
          Add child
        </button>
      </div>
      {node.children.map((c) => (
        <Row key={c.key} node={c} depth={depth + 1} onAddChild={onAddChild} />
      ))}
    </>
  );
}

/** GET /menu, POST /menu, POST /menu/{parentId}/child-menu */
export default function MenuManager() {
  const { showToast } = useToast();
  const { items, isLoading } = useBackendMenu();
  const [form, setForm] = useState<CreateMenuDto>(EMPTY);
  const [parent, setParent] = useState<NavNode | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: permsRaw } = useQuery({
    queryKey: qk.permissions(),
    queryFn: () => permissionApi.list(),
  });
  const permissions: Permission[] = useMemo(
    () => parseList(permsRaw, "permissions", "result", "data"),
    [permsRaw],
  );

  const set = <K extends keyof CreateMenuDto>(k: K, v: CreateMenuDto[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const open = (p: NavNode | null) => { setParent(p); setForm(EMPTY); setIsOpen(true); };
  const close = () => { setIsOpen(false); setParent(null); setForm(EMPTY); };

  const save = async () => {
    if (!form.name.trim()) return showToast("Name is required.");
    if (!form.url.trim()) return showToast("URL is required.");
    setIsSaving(true);
    try {
      const body: CreateMenuDto = {
        name: form.name.trim(),
        url: form.url.trim(),
        icon: form.icon.trim() || form.name.trim().toLowerCase(),
        order: Number(form.order) || 1,
        permissions: form.permissions,
      };
      if (parent) await menuApi.createChild(parent.key, body);
      else await menuApi.create(body);
      queryClient.invalidateQueries({ queryKey: qk.menu() });
      showToast(parent ? "Child menu item added" : "Menu item added", "success");
      close();
    } catch (err: any) {
      showToast(err?.message || "Could not save the menu item");
    } finally {
      setIsSaving(false);
    }
  };

  const PreviewIcon = resolveIcon(form.icon, form.name);

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-display">Menu</h2>
          <p className="text-xs text-gray-400 font-bold tracking-tight">
            The sidebar is built from these items, filtered by each user's permissions
          </p>
        </div>
        <button
          onClick={() => open(null)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-lg shadow-blue-100 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Menu Item
        </button>
      </div>

      {isLoading ? <CardSkeleton /> : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          {items.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <ListTree className="h-7 w-7 text-gray-300 mx-auto" />
              <p className="text-sm font-black text-slate-900">No menu items yet</p>
              <p className="text-xs text-gray-500">
                Portals fall back to their built-in navigation until items are added here.
              </p>
            </div>
          ) : items.map((n) => (
            <Row key={n.key} node={n} depth={0} onAddChild={open} />
          ))}
        </div>
      )}

      <Modal
        open={isOpen}
        onClose={close}
        title={parent ? `Add item under ${parent.label}` : "Add Menu Item"}
        description="Items appear in the sidebar for users holding the selected permissions."
        size="md"
      >
        <div className="space-y-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
            <FloatingInput
              label="Name" placeholder="Residents"
              value={form.name} onChange={(e) => set("name", e.target.value)}
            />
            <FloatingInput
              label="URL" placeholder="/admin/residents" leading={<Link2 className="h-3.5 w-3.5" />}
              value={form.url} onChange={(e) => set("url", e.target.value)}
            />
            <FloatingInput
              label="Icon" placeholder="users"
              value={form.icon} onChange={(e) => set("icon", e.target.value)}
            />
            <FloatingInput
              label="Order" type="number" min={1} placeholder="1"
              leading={<Hash className="h-3.5 w-3.5" />}
              value={String(form.order)} onChange={(e) => set("order", Number(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-2.5 text-[11px] font-bold text-gray-500">
            <span>Icon preview:</span>
            <span className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <PreviewIcon className="h-4 w-4" />
            </span>
            <span className="text-gray-400">resolved from the icon name</span>
          </div>

          {permissions.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                Permissions ({form.permissions.length} selected)
              </span>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-3 space-y-1.5">
                {permissions.map((perm) => {
                  const on = form.permissions.includes(perm.id);
                  return (
                    <button
                      key={perm.id}
                      type="button"
                      onClick={() => set("permissions", on
                        ? form.permissions.filter((x) => x !== perm.id)
                        : [...form.permissions, perm.id])}
                      className="w-full flex items-center gap-2.5 text-left px-2 py-1.5 rounded-lg hover:bg-slate-50"
                    >
                      <span className={`h-4 w-4 rounded flex items-center justify-center shrink-0 ${
                        on ? "bg-blue-600" : "bg-gray-200"
                      }`}>
                        {on && <Check className="h-3 w-3 text-white stroke-[4]" />}
                      </span>
                      <span className="text-[11px] font-bold text-slate-700">{perm.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              type="button" onClick={close} disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-all"
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
            <button
              type="button" onClick={save} disabled={isSaving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-lg shadow-blue-100 disabled:opacity-60 transition-all"
            >
              {isSaving
                ? <span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Check className="h-3.5 w-3.5 stroke-[3]" />}
              {isSaving ? "Saving..." : "Save Item"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
