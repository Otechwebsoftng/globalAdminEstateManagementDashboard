import { useState } from "react";
import { Trash2, X } from "lucide-react";
import Modal from "../../components/ui/Modal";

export interface TemporarilyDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export default function TemporarilyDeleteModal({ open, onClose, onConfirm }: TemporarilyDeleteModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const close = () => { setReason(""); setError(""); onClose(); };

  const confirm = async () => {
    if (!reason.trim()) { setError("Please give a reason."); return; }
    setIsSubmitting(true);
    try { await onConfirm(reason.trim()); close(); }
    finally { setIsSubmitting(false); }
  };

  return (
    <Modal open={open} onClose={close} size="md">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-black text-rose-600">Temporarily Deleting?</h3>
          <p className="text-xs text-gray-500 font-bold mt-1.5">
            Please give a reason to why you're temporarily deleting a property.
          </p>
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
            className={`w-full text-xs px-4 py-4 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-rose-500/10 transition-all font-bold placeholder:text-gray-300 resize-none ${
              error ? "border-rose-400" : "border-gray-200 focus:border-rose-400"
            }`}
          />
          {error && <span className="mt-1.5 block text-[10px] font-bold text-rose-600">{error}</span>}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button" onClick={close} disabled={isSubmitting}
            className="text-xs font-black text-slate-700 hover:text-slate-900 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button" onClick={close} aria-label="Close" disabled={isSubmitting}
            className="h-10 w-16 flex items-center justify-center bg-slate-50 border border-gray-200 rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            type="button" onClick={confirm} disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-xs font-black px-6 py-2.5 rounded-xl disabled:opacity-60 transition-all"
          >
            {isSubmitting
              ? <span className="h-3.5 w-3.5 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
              : <Trash2 className="h-3.5 w-3.5" />}
            {isSubmitting ? "Removing..." : "Temporarily Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
