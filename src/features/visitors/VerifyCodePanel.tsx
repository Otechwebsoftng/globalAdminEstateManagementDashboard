import { useState } from "react";
import { ScanLine, CheckCircle2, XCircle } from "lucide-react";
import { FloatingInput } from "../../components/ui/Field";
import { securityApi } from "../../services/securityApi";
import { useToast } from "../../components/Toast";

type Result = { ok: boolean; detail?: string; unknown?: boolean } | null;

/**
 * Reads an explicit validity signal. Deliberately does NOT fall back to a
 * generic `success` flag: that means "the request succeeded", not "the code is
 * valid", and treating it as validity would let any 200 open the gate.
 * Anything unrecognised is reported as unverified, never as valid.
 */
function readValidity(res: any): { ok: boolean; unknown: boolean } {
  const body = res?.data ?? res;
  for (const key of ["valid", "isValid", "verified", "isVerified"]) {
    if (typeof body?.[key] === "boolean") return { ok: body[key], unknown: false };
  }
  const status = String(body?.status ?? body?.codeStatus ?? "").toLowerCase();
  if (["valid", "active", "verified"].includes(status)) return { ok: true, unknown: false };
  if (["invalid", "expired", "revoked", "used"].includes(status)) return { ok: false, unknown: false };
  return { ok: false, unknown: true };
}

/** POST /security-personnel/verify-code — the gate check. */
export default function VerifyCodePanel() {
  const { showToast } = useToast();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [isChecking, setIsChecking] = useState(false);

  const verify = async () => {
    if (!code.trim()) return;
    setIsChecking(true);
    setResult(null);
    try {
      const res: any = await securityApi.verifyCode(code.trim());
      const { ok, unknown } = readValidity(res);
      const body = res?.data ?? res;
      const who = body?.visitorName
        ?? ([body?.firstName, body?.lastName].filter(Boolean).join(" ") || undefined);
      setResult({
        ok,
        unknown,
        detail: unknown
          ? "The server did not return a validity result — do not admit on this alone."
          : who,
      });
    } catch (err: any) {
      setResult({ ok: false, detail: err?.message });
      showToast(err?.message || "Could not verify the code.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5 max-w-xl">
      <div>
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <ScanLine className="h-4 w-4 text-blue-600" />
          Verify Visitor Code
        </h3>
        <p className="text-[11px] text-gray-400 font-bold mt-0.5">
          Enter the code a guest presents at the gate.
        </p>
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <FloatingInput
            label="Access Code" placeholder="A8F3-K9L2"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setResult(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") verify(); }}
            className="font-mono tracking-widest"
          />
        </div>
        <button
          type="button" onClick={verify} disabled={isChecking || !code.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-6 py-3.5 rounded-xl shadow-lg shadow-blue-100 disabled:opacity-50 transition-all shrink-0"
        >
          {isChecking ? "Checking..." : "Verify"}
        </button>
      </div>

      {result && (
        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
            result.ok
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : result.unknown
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-rose-50 border-rose-200 text-rose-700"
          }`}
        >
          {result.ok ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          <div>
            <span className="text-xs font-black block">
              {result.ok
                ? "Code valid — entry allowed"
                : result.unknown
                  ? "Could not verify this code"
                  : "Code not valid"}
            </span>
            {result.detail && (
              <span className="text-[11px] font-bold opacity-80">{result.detail}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
