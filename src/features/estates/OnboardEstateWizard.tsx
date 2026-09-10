import { useMemo, useState } from "react";
import { Building2, Users, Mail, Phone, MapPin, FileText, Check } from "lucide-react";
import Modal from "../../components/ui/Modal";
import { FloatingInput } from "../../components/ui/Field";
import WizardChrome from "../../components/ui/wizard/WizardChrome";
import SuccessDialog from "../../components/ui/SuccessDialog";
import { useWizard, type WizardStep } from "../../components/ui/wizard/useWizard";
import type { CreateEstateDto } from "../../types/api";

export interface OnboardEstateValues {
  estateName: string;
  cac: string;
  address: string;
  city: string;
  state: string;
  country: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  sendLoginDetails: boolean;
}

export const emptyOnboardEstate: OnboardEstateValues = {
  estateName: "", cac: "", address: "", city: "", state: "", country: "Nigeria",
  firstName: "", lastName: "", email: "", countryCode: "+234", phoneNumber: "",
  sendLoginDetails: true,
};

export function toCreateEstateDto(v: OnboardEstateValues): CreateEstateDto {
  return {
    estateName: v.estateName.trim(),
    firstName: v.firstName.trim(),
    lastName: v.lastName.trim(),
    cac: v.cac.trim(),
    countryCode: v.countryCode.trim(),
    phoneNumber: v.phoneNumber.trim(),
    email: v.email.trim(),
    address: v.address.trim(),
    city: v.city.trim(),
    state: v.state.trim(),
    country: v.country.trim(),
  };
}

const required = (v: string) => !v || !v.trim();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STEPS: WizardStep<OnboardEstateValues>[] = [
  {
    id: "estate",
    title: "Estate Details",
    validate: (v) => {
      const e: Record<string, string> = {};
      if (required(v.estateName)) e.estateName = "Estate name is required.";
      if (required(v.cac)) e.cac = "CAC number is required.";
      if (required(v.address)) e.address = "Address is required.";
      if (required(v.city)) e.city = "City is required.";
      if (required(v.state)) e.state = "State is required.";
      if (required(v.country)) e.country = "Country is required.";
      return e;
    },
  },
  {
    id: "admin",
    title: "Estate Admin Details",
    validate: (v) => {
      const e: Record<string, string> = {};
      if (required(v.firstName)) e.firstName = "First name is required.";
      if (required(v.lastName)) e.lastName = "Last name is required.";
      if (required(v.email)) e.email = "Email is required.";
      else if (!EMAIL_RE.test(v.email.trim())) e.email = "Enter a valid email address.";
      if (required(v.countryCode)) e.countryCode = "Required.";
      if (required(v.phoneNumber)) e.phoneNumber = "Phone number is required.";
      return e;
    },
  },
];

export interface OnboardEstateWizardProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateEstateDto) => Promise<void>;
  onViewEstates?: () => void;
}

export default function OnboardEstateWizard({
  open, onClose, onSubmit, onViewEstates,
}: OnboardEstateWizardProps) {
  const [succeeded, setSucceeded] = useState(false);

  const wizard = useWizard<OnboardEstateValues>({
    steps: STEPS,
    initialValues: emptyOnboardEstate,
    onSubmit: async (values) => {
      await onSubmit(toCreateEstateDto(values));
      setSucceeded(true);
    },
  });

  const { values, setValue, errors } = wizard;
  const closeAll = () => {
    wizard.reset();
    setSucceeded(false);
    onClose();
  };

  const body = useMemo(() => {
    if (wizard.step.id === "estate") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
          <div className="sm:col-span-2">
            <FloatingInput
              label="Estate Name" placeholder="Sunset Valley Residences"
              leading={<Building2 className="h-3.5 w-3.5" />}
              value={values.estateName} error={errors.estateName}
              onChange={(e) => setValue("estateName", e.target.value)}
            />
          </div>
          <FloatingInput
            label="CAC Number" placeholder="RC 1234567"
            leading={<FileText className="h-3.5 w-3.5" />}
            value={values.cac} error={errors.cac}
            onChange={(e) => setValue("cac", e.target.value)}
          />
          <FloatingInput
            label="City" placeholder="Lekki"
            leading={<MapPin className="h-3.5 w-3.5" />}
            value={values.city} error={errors.city}
            onChange={(e) => setValue("city", e.target.value)}
          />
          <div className="sm:col-span-2">
            <FloatingInput
              label="Address" placeholder="12 Admiralty Way"
              leading={<MapPin className="h-3.5 w-3.5" />}
              value={values.address} error={errors.address}
              onChange={(e) => setValue("address", e.target.value)}
            />
          </div>
          <FloatingInput
            label="State" placeholder="Lagos"
            leading={<MapPin className="h-3.5 w-3.5" />}
            value={values.state} error={errors.state}
            onChange={(e) => setValue("state", e.target.value)}
          />
          <FloatingInput
            label="Country" placeholder="Nigeria"
            leading={<MapPin className="h-3.5 w-3.5" />}
            value={values.country} error={errors.country}
            onChange={(e) => setValue("country", e.target.value)}
          />
        </div>
      );
    }

    return (
      <div className="space-y-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
          <FloatingInput
            label="Admin First Name" placeholder="John"
            leading={<Users className="h-3.5 w-3.5" />}
            value={values.firstName} error={errors.firstName}
            onChange={(e) => setValue("firstName", e.target.value)}
          />
          <FloatingInput
            label="Admin Last Name" placeholder="Doe"
            leading={<Users className="h-3.5 w-3.5" />}
            value={values.lastName} error={errors.lastName}
            onChange={(e) => setValue("lastName", e.target.value)}
          />
          <div className="sm:col-span-2">
            <FloatingInput
              label="Admin Email" type="email" placeholder="admin@estate.ng"
              leading={<Mail className="h-3.5 w-3.5" />}
              value={values.email} error={errors.email}
              onChange={(e) => setValue("email", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-3 sm:col-span-2">
            <FloatingInput
              label="Code" placeholder="+234"
              value={values.countryCode} error={errors.countryCode}
              onChange={(e) => setValue("countryCode", e.target.value)}
            />
            <FloatingInput
              label="Admin Phone Number" placeholder="803 587 6754"
              leading={<Phone className="h-3.5 w-3.5" />}
              value={values.phoneNumber} error={errors.phoneNumber}
              onChange={(e) => setValue("phoneNumber", e.target.value)}
            />
          </div>
        </div>

        <div
          className="flex items-center gap-3 cursor-pointer w-fit"
          onClick={() => setValue("sendLoginDetails", !values.sendLoginDetails)}
        >
          <div
            className={`h-5 w-5 rounded flex items-center justify-center transition-colors ${
              values.sendLoginDetails ? "bg-blue-600" : "bg-gray-200 border border-gray-300"
            }`}
          >
            {values.sendLoginDetails && <Check className="h-3.5 w-3.5 text-white stroke-[4]" />}
          </div>
          <span className="text-xs font-bold text-slate-600">
            Send login details to the estate admin
          </span>
        </div>
      </div>
    );
  }, [wizard.step.id, values, errors, setValue]);

  return (
    <>
      <Modal
        open={open && !succeeded}
        onClose={closeAll}
        title="Onboard New Estates"
        description="The admin will manage the estate"
      >
        <WizardChrome
          stepIndex={wizard.stepIndex}
          totalSteps={wizard.totalSteps}
          progress={wizard.progress}
          stepTitle={wizard.step.title}
          isFirst={wizard.isFirst}
          isLast={wizard.isLast}
          isSubmitting={wizard.isSubmitting}
          onBack={wizard.back}
          onNext={wizard.next}
          onSubmit={wizard.submit}
          submitLabel="Onboard Estate"
        >
          {body}
        </WizardChrome>
      </Modal>

      <SuccessDialog
        open={succeeded}
        onClose={closeAll}
        title="Estate Onboarded Successfully"
        description="The estate admin has been notified and can now sign in."
        primaryLabel="View Estates"
        onPrimary={() => { closeAll(); onViewEstates?.(); }}
        secondaryLabel="Onboard Another"
        onSecondary={() => { wizard.reset(); setSucceeded(false); }}
      />
    </>
  );
}
