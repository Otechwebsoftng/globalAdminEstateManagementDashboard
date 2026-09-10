import { ReactNode, useEffect, useRef } from "react";
import { X } from "lucide-react";

const SIZES = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
} as const;

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  size?: keyof typeof SIZES;
  closeOnOverlay?: boolean;
  children: ReactNode;
}

/**
 * Shared modal shell. Adds Esc-to-close, overlay click, body scroll lock and
 * dialog semantics — none of which the hand-rolled inline modals had.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  size = "lg",
  closeOnOverlay = true,
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 px-4 py-6 overflow-y-auto"
      onMouseDown={(e) => {
        if (closeOnOverlay && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={`bg-white rounded-[32px] w-full ${SIZES[size]} max-h-[calc(100vh-3rem)] overflow-y-auto p-8 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-300 relative`}
      >
        <button
          type="button"
          aria-label="Close"
          className="absolute top-6 right-6 text-gray-400 hover:text-slate-900 transition-colors"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>

        {(title || description) && (
          <div className="mb-8">
            {title && (
              <h3 className="text-2xl font-black text-slate-900 font-display leading-none">{title}</h3>
            )}
            {description && <p className="text-xs text-gray-400 font-bold mt-2">{description}</p>}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
