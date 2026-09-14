import { useState } from "react";
import { User, Check, X } from "lucide-react";
import Modal from "../../components/ui/Modal";
import { FloatingInput } from "../../components/ui/Field";
import SuccessDialog from "../../components/ui/SuccessDialog";
import { useToast } from "../../components/Toast";
import { residentApi, type VisitorCodeDto } from "../../services/api";

const EMPTY: VisitorCodeDto = { firstName: "", lastName: "", entryTime: "", exitTime: "" };

export interface GenerateVisitorCodeModalProps {
  open: boolean;
  estateId: string;
  onClose: () => void;
}

/** POST /residents/estate/{estateId} — residents generate codes for guests. */
export default function GenerateVisitorCodeModal({ open, estateId, onClose }: GenerateVisitorCodeModalProps) {
  const { showToast } = useToast();
  const [values, setValues] = useState<VisitorCodeDto>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedCode, setIssuedCode] = useState<string | null>(null);

  const set = <K extends keyof VisitorCodeDto>(k: K, v: VisitorCodeDto[K]) => {
    setValues((p) => ({ ...p, [k]: v }));
    setErrors((p) => { const n = { ...p }; delete n[k as string]; return n; });
  };

  const close = () => { setValues(EMPTY); setErrors({}); setIssuedCode(null); onClose(); };

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!values.firstName.trim()) e.firstName = "First name is required.";
    if (!values.lastName.trim()) e.lastName = "Last name is required.";
    if (!values.entryTime) e.entryTime = "Entry time is required.";
    if (!values.exitTime) e.exitTime = "Exit time is required.";
    else if (values.entryTime && values.exitTime <= values.entryTime) {
      e.exitTime = "Exit must be after entry.";
    }
    setErrors(e);
    if (Object.keys(e).length) return;

    setIsSubmitting(true);
    try {
      const res: any = await residentApi.createVisitorCode(estateId, values);
      const code = res?.data?.code ?? res?.code ?? res?.data?.accessCode ?? null;
      setIssuedCode(code ?? "Issued");
    } catch (err: any) {
      showToast(err?.message || "Could not generate the visitor code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        open={open && !issuedCode}
        onClose={close}
        title="Generate Visitor Code"
        description="Issue a one-time access code for your guest."
        size="md"
      >
        <div className="space-y-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
            <FloatingInput
              label="First Name" placeholder="Enter first name"
              leading={<User className="h-3.5 w-3.5" />}
              value={values.firstName} error={errors.firstName}
              onChange={(e) => set("firstName", e.target.value)}
            />
            <FloatingInput
              label="Last Name" placeholder="Enter last name"
              leading={<User className="h-3.5 w-3.5" />}
              value={values.lastName} error={errors.lastName}
              onChange={(e) => set("lastName", e.target.value)}
            />
            <FloatingInput
              label="Entry Time" type="datetime-local"
              value={values.entryTime} error={errors.entryTime}
              onChange={(e) => set("entryTime", e.target.value)}
            />
            <FloatingInput
              label="Exit Time" type="datetime-local"
              value={values.exitTime} error={errors.exitTime}
              onChange={(e) => set("exitTime", e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button" onClick={close} disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-all"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
            <button
              type="button" onClick={submit} disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-lg shadow-blue-100 disabled:opacity-60 transition-all"
            >
              {isSubmitting
                ? <span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Check className="h-3.5 w-3.5 stroke-[3]" />}
              {isSubmitting ? "Generating..." : "Generate Code"}
            </button>
          </div>
        </div>
      </Modal>

      <SuccessDialog
        open={!!issuedCode}
        onClose={close}
        title="Visitor Code Generated"
        description={issuedCode && issuedCode !== "Issued" ? `Share this code with your guest: ${issuedCode}` : "The code has been issued."}
        primaryLabel="Done"
        onPrimary={close}
        secondaryLabel="Generate Another"
        onSecondary={() => { setValues(EMPTY); setIssuedCode(null); }}
      />
    </>
  );
}
