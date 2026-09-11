import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FloatingSelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

/**
 * Floating-label select. Custom rather than a native <select> so the open list
 * can show the checked state the design calls for.
 */
export function FloatingSelect({
  label, value, options, onChange, placeholder = "Select...", error, disabled,
}: FloatingSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
        {label}
      </label>

      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 text-xs pl-4 pr-3 py-3.5 bg-white border rounded-xl outline-none font-bold text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? "border-rose-400" : open ? "border-blue-600 ring-2 ring-blue-500/10" : "border-gray-200"
        }`}
      >
        <span className={selected ? "text-slate-900" : "text-gray-300"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-30 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden py-1"
        >
          {options.map((o) => {
            const isSelected = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-xs font-bold text-left transition-colors ${
                  isSelected ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{o.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      )}

      {error && <span className="mt-1.5 block text-[10px] font-bold text-rose-600">{error}</span>}
    </div>
  );
}
