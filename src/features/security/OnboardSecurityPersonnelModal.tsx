import { useState } from "react";
import { User, Mail, X, Check, IdCard, Phone } from "lucide-react";
import Modal from "../../components/ui/Modal";
import { FloatingInput } from "../../components/ui/Field";
import { FloatingSelect } from "../../components/ui/Select";
import SuccessDialog from "../../components/ui/SuccessDialog";
import { useToast } from "../../components/Toast";
import {
  DOCUMENT_TYPES, documentTypeLabel, GENDERS, genderLabel,
  type CreateSecurityPersonnelDto,
} from "../../types/security";

const EMPTY: CreateSecurityPersonnelDto = {
  firstName: "", lastName: "", email: "", phoneNumber: "",
  gender: "", documentType: "", documentNumber: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface OnboardSecurityPersonnelModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateSecurityPersonnelDto) => Promise<void>;
}

export default function OnboardSecurityPersonnelModal({
  open, onClose, onSubmit,
}: OnboardSecurityPersonnelModalProps) {
  const { showToast } = useToast();
  const [values, setValues] = useState<CreateSecurityPersonnelDto>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const set = <K extends keyof CreateSecurityPersonnelDto>(k: K, v: CreateSecurityPersonnelDto[K]) => {
    setValues((p) => ({ ...p, [k]: v }));
    setErrors((p) => { const n = { ...p }; delete n[k as string]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!values.firstName.trim()) e.firstName = "First name is required.";
    if (!values.lastName.trim()) e.lastName = "Last name is required.";
    if (!values.email.trim()) e.email = "Email is required.";
    else if (!EMAIL_RE.test(values.email.trim())) e.email = "Enter a valid email address.";
    if (!values.phoneNumber.trim()) e.phoneNumber = "Phone number is required.";
    if (!values.gender) e.gender = "Select a gender.";
    if (!values.documentType) e.documentType = "Select a document type.";
    if (!values.documentNumber.trim()) e.documentNumber = "Document number is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const reset = () => { setValues(EMPTY); setErrors({}); };
  const closeAll = () => { reset(); setSucceeded(false); onClose(); };

  const submit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      setSucceeded(true);
    } catch (err: any) {
      showToast(err?.message || "Could not onboard this security personnel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal open={open && !succeeded} onClose={closeAll} title="Onboard Security Personnel">
        <div className="space-y-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
            <FloatingInput
              label="First Name" placeholder="Wislley" leading={<User className="h-3.5 w-3.5" />}
              value={values.firstName} error={errors.firstName}
              onChange={(e) => set("firstName", e.target.value)}
            />
            <FloatingInput
              label="Last Name" placeholder="John" leading={<User className="h-3.5 w-3.5" />}
              value={values.lastName} error={errors.lastName}
              onChange={(e) => set("lastName", e.target.value)}
            />

            <FloatingInput
              label="Email Address" type="email" placeholder="youremail@gmail.com"
              leading={<Mail className="h-3.5 w-3.5" />}
              value={values.email} error={errors.email}
              onChange={(e) => set("email", e.target.value)}
            />
            <FloatingInput
              label="Phone Number" placeholder="803 - 555 - 0007"
              leading={<Phone className="h-3.5 w-3.5" />}
              value={values.phoneNumber} error={errors.phoneNumber}
              onChange={(e) => set("phoneNumber", e.target.value)}
            />

            <FloatingSelect
              label="Gender" placeholder="Select gender..."
              value={values.gender} error={errors.gender}
              options={GENDERS.map((g) => ({ value: g, label: genderLabel(g) }))}
              onChange={(v) => set("gender", v as CreateSecurityPersonnelDto["gender"])}
            />
            <FloatingSelect
              label="Document Type" placeholder="Select document type..."
              value={values.documentType} error={errors.documentType}
              options={DOCUMENT_TYPES.map((t) => ({ value: t, label: documentTypeLabel(t) }))}
              onChange={(v) => set("documentType", v as CreateSecurityPersonnelDto["documentType"])}
            />

            <div className="sm:col-span-2">
              <FloatingInput
                label="Document Number" placeholder="Enter document number"
                leading={<IdCard className="h-3.5 w-3.5" />}
                value={values.documentNumber} error={errors.documentNumber}
                disabled={!values.documentType}
                onChange={(e) => set("documentNumber", e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={closeAll}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-all"
            >
              <X className="h-3.5 w-3.5" />
              Cancel Onboarding
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-lg shadow-blue-100 disabled:opacity-60 transition-all"
            >
              {isSubmitting
                ? <span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Check className="h-3.5 w-3.5 stroke-[3]" />}
              {isSubmitting ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </div>
      </Modal>

      <SuccessDialog
        open={succeeded}
        onClose={closeAll}
        title="Security Personnel Added Successfully"
        description="An invitation has been sent to set up their account."
        primaryLabel="Done"
        onPrimary={closeAll}
        secondaryLabel="Add Another"
        onSecondary={() => { reset(); setSucceeded(false); }}
      />
    </>
  );
}
