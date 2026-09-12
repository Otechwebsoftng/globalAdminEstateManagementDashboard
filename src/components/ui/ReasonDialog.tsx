import { useState } from "react";
import { Trash2, X } from "lucide-react";
import Modal from "./Modal";

export interface ReasonDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "danger" | "warning";
}

const TONES = {
  danger: { head: "text-rose-600", btn: "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100", ring: "focus:ring-rose-500/10 focus:border-rose-400" },
  warning: { head: "text-amber-600", btn: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100", ring: "focus:ring-amber-500/10 focus:border-amber-400" },
} as const;

/** Confirm that captures a required reason — the shape several endpoints expect. */
export default function ReasonDialog({
  open, onClose, onConfirm, title, description, confirmLabel, tone = "danger",
}: ReasonDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = TONES[tone];

  const close = () => { setReason(""); setError(""); onClose(); };

  const confirm = async () => {
    if (!reason.trim()) { setError("Please give a reason."); return; }
    setIsSubmitting(true);
    try { await onConfirm(reason.trim()); close(); }
    catch { /* caller surfaces the error */ }
    finally { setIsSubmitting(false); }
  };

  return (
    <Modal open={open} onClose={close} size="md">
      <div className="space-y-6">
        <div>
          <h3 className={`text-xl font-black ${t.head}`}>{title}</h3>
          <p className="text-xs text-gray-500 font-bold mt-1.5">{description}</p>
        </div>

        <div className="relative border-t border-gray-100 pt-6">
          <label className="absolute top-3.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
            Enter Reason:
          </label>
          <textarea
            rows={4}
            placeholder="Enter your reason...."
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(""); }}
            className={`w-full text-xs px-4 py-4 bg-white border rounded-xl outline-none focus:ring-2 transition-all font-bold placeholder:text-gray-300 resize-none ${
              error ? "border-rose-400" : `border-gray-200 ${t.ring}`
            }`}
          />
          {error && <span className="mt-1.5 block text-[10px] font-bold text-rose-600">{error}</span>}
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={close} disabled={isSubmitting}
            className="text-xs font-black text-slate-700 hover:text-slate-900 disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={close} aria-label="Close" disabled={isSubmitting}
            className="h-10 w-16 flex items-center justify-center bg-slate-50 border border-gray-200 rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors">
            <X className="h-4 w-4" />
          </button>
          <button type="button" onClick={confirm} disabled={isSubmitting}
            className={`flex-1 flex items-center justify-center gap-2 border text-xs font-black px-6 py-2.5 rounded-xl disabled:opacity-60 transition-all ${t.btn}`}>
            {isSubmitting
              ? <span className="h-3.5 w-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              : <Trash2 className="h-3.5 w-3.5" />}
            {isSubmitting ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
