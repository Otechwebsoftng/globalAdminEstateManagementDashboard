import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, X, Check, IdCard } from "lucide-react";
import Modal from "../../components/ui/Modal";
import { FloatingInput } from "../../components/ui/Field";
import { FloatingSelect } from "../../components/ui/Select";
import SuccessDialog from "../../components/ui/SuccessDialog";
import { useToast } from "../../components/Toast";
import {
  GATES, gateLabel, IDENTITY_TYPES,
  type CreateSecurityPersonnelDto,
} from "../../types/security";

const EMPTY: CreateSecurityPersonnelDto = {
  firstName: "", lastName: "", email: "", countryCode: "+234", phoneNumber: "",
  identityType: "", idNumber: "", assignedGate: "", password: "",
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
  const [showPassword, setShowPassword] = useState(false);
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
    if (!values.identityType) e.identityType = "Select an identity type.";
    if (!values.idNumber.trim()) e.idNumber = "ID number is required.";
    if (!values.assignedGate) e.assignedGate = "Select an assigned gate.";
    if (!values.password) e.password = "Set a password.";
    else if (values.password.length < 8) e.password = "Use at least 8 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const reset = () => { setValues(EMPTY); setErrors({}); setShowPassword(false); };
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
            <div className="grid grid-cols-[92px_1fr] gap-3">
              <FloatingInput
                label="Code" placeholder="+234"
                value={values.countryCode}
                onChange={(e) => set("countryCode", e.target.value)}
              />
              <FloatingInput
                label="Phone Number" placeholder="803 - 555 - 0007"
                value={values.phoneNumber} error={errors.phoneNumber}
                onChange={(e) => set("phoneNumber", e.target.value)}
              />
            </div>

            <FloatingSelect
              label="Identity Type" placeholder="Select identity type..."
              value={values.identityType} error={errors.identityType}
              options={IDENTITY_TYPES.map((t) => ({ value: t, label: t }))}
              onChange={(v) => set("identityType", v as CreateSecurityPersonnelDto["identityType"])}
            />
            <FloatingInput
              label="ID Number" placeholder="Enter ID number"
              leading={<IdCard className="h-3.5 w-3.5" />}
              value={values.idNumber} error={errors.idNumber}
              disabled={!values.identityType}
              onChange={(e) => set("idNumber", e.target.value)}
            />

            <FloatingSelect
              label="Assigned Gate" placeholder="Select gate..."
              value={values.assignedGate} error={errors.assignedGate}
              options={GATES.map((g) => ({ value: g, label: gateLabel(g) }))}
              onChange={(v) => set("assignedGate", v as CreateSecurityPersonnelDto["assignedGate"])}
            />
            <FloatingInput
              label="Setup Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              leading={<Lock className="h-3.5 w-3.5" />}
              value={values.password} error={errors.password}
              onChange={(e) => set("password", e.target.value)}
              trailing={
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-gray-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
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
