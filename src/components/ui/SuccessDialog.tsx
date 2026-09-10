import { Check } from "lucide-react";
import Modal from "./Modal";

export interface SuccessDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

/** The shared "X Added Successfully" popup every board's wizard ends on. */
export default function SuccessDialog({
  open, onClose, title, description,
  primaryLabel = "Done", onPrimary,
  secondaryLabel, onSecondary,
}: SuccessDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center space-y-4 py-2">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100 mx-auto">
          <Check className="h-7 w-7 stroke-[3]" />
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900">{title}</h3>
          {description && <p className="text-xs text-gray-400 font-bold mt-1.5">{description}</p>}
        </div>
        <div className="flex items-center justify-center gap-2 pt-2">
          {secondaryLabel && (
            <button
              type="button"
              onClick={onSecondary}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50 transition-all"
            >
              {secondaryLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onPrimary ?? onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-lg shadow-blue-100 transition-all"
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
