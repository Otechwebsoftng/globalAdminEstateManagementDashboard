import type { ReactNode } from "react";
import type { EntityStatus } from "../../types/common";

export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const TONES: Record<Tone, string> = {
  success: "text-emerald-600 bg-emerald-50 border-emerald-100",
  warning: "text-amber-600 bg-amber-50 border-amber-100",
  danger: "text-rose-600 bg-rose-50 border-rose-100",
  info: "text-blue-600 bg-blue-50 border-blue-100",
  neutral: "text-slate-600 bg-slate-50 border-slate-200",
};
const DOTS: Record<Tone, string> = {
  success: "bg-emerald-500", warning: "bg-amber-500", danger: "bg-rose-500",
  info: "bg-blue-500", neutral: "bg-slate-400",
};

export function statusTone(status: string): Tone {
  switch (status?.toUpperCase()) {
    case "ACTIVE": case "VERIFIED": return "success";
    case "PENDING": return "info";
    case "SUSPENDED": return "warning";
    case "DENIED": case "REVOKED": return "danger";
    default: return "neutral";
  }
}

const LABELS: Record<string, string> = {
  ACTIVE: "Active", PENDING: "Pending", SUSPENDED: "Suspended", INACTIVE: "Inactive",
  VERIFIED: "Verified", DENIED: "Denied",
};

export default function Badge({
  status, tone, dot = true, children,
}: { status?: EntityStatus | string; tone?: Tone; dot?: boolean; children?: ReactNode }) {
  const resolved = tone ?? statusTone(String(status ?? ""));
  const text = children ?? LABELS[String(status ?? "").toUpperCase()] ?? status;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full border ${TONES[resolved]}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${DOTS[resolved]}`} />}
      {text}
    </span>
  );
}
