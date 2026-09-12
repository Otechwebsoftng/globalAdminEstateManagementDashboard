import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "warning" | "default";
}

type Resolver = (ok: boolean) => void;

const ConfirmContext = createContext<(o: ConfirmOptions) => Promise<boolean>>(
  async () => false,
);

const TONES = {
  danger: { btn: "bg-rose-600 hover:bg-rose-700 shadow-rose-100", icon: "bg-rose-50 text-rose-600 border-rose-100" },
  warning: { btn: "bg-amber-600 hover:bg-amber-700 shadow-amber-100", icon: "bg-amber-50 text-amber-600 border-amber-100" },
  default: { btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-100", icon: "bg-blue-50 text-blue-600 border-blue-100" },
} as const;

/** Promise-based confirm, replacing window.confirm. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<{ fn: Resolver } | null>(null);

  const confirm = useCallback((o: ConfirmOptions) => {
    setOpts(o);
    return new Promise<boolean>((resolve) => setResolver({ fn: resolve }));
  }, []);

  const settle = (ok: boolean) => {
    resolver?.fn(ok);
    setResolver(null);
    setOpts(null);
  };

  const tone = TONES[opts?.tone ?? "default"];

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal open={!!opts} onClose={() => settle(false)} size="sm">
        <div className="space-y-5">
          <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${tone.icon}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">{opts?.title}</h3>
            {opts?.description && (
              <p className="text-xs text-gray-500 font-bold mt-1.5 leading-relaxed">{opts.description}</p>
            )}
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => settle(false)}
              className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50 transition-all"
            >
              {opts?.cancelLabel ?? "Cancel"}
            </button>
            <button
              type="button"
              onClick={() => settle(true)}
              className={`text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-lg transition-all ${tone.btn}`}
            >
              {opts?.confirmLabel ?? "Confirm"}
            </button>
          </div>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
