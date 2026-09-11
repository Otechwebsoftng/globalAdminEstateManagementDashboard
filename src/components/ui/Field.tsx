import { InputHTMLAttributes, ReactNode } from "react";

export interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  leading?: ReactNode;
  /** Rendered inside the field on the right — a password eye toggle, say. */
  trailing?: ReactNode;
  error?: string;
}

/** Floating-label input, extracted from the repeated onboard/edit modal markup. */
export function FloatingInput({ label, leading, trailing, error, className = "", ...rest }: FloatingInputProps) {
  return (
    <div className="relative">
      <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
        {label}
      </label>
      <div className="relative">
        {leading && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{leading}</span>
        )}
        <input
          {...rest}
          className={`w-full text-xs ${leading ? "pl-10" : "pl-4"} ${trailing ? "pr-11" : "pr-4"} py-3.5 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-bold placeholder:text-gray-200 ${
            error ? "border-rose-400 focus:border-rose-500" : "border-gray-200 focus:border-blue-600"
          } ${className}`}
        />
        {trailing && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2">{trailing}</span>
        )}
      </div>
      {error && <span className="mt-1.5 block text-[10px] font-bold text-rose-600">{error}</span>}
    </div>
  );
}
