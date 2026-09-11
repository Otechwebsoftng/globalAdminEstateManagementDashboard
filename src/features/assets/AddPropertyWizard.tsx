import { useMemo, useState } from "react";
import { Home, MapPin, Mail, User, DollarSign, ImagePlus, Trash2, Check } from "lucide-react";
import Modal from "../../components/ui/Modal";
import { FloatingInput } from "../../components/ui/Field";
import { FloatingSelect } from "../../components/ui/Select";
import WizardChrome from "../../components/ui/wizard/WizardChrome";
import SuccessDialog from "../../components/ui/SuccessDialog";
import { useWizard, type WizardStep } from "../../components/ui/wizard/useWizard";
import { downscaleImage } from "../../lib/image";
import {
  PROPERTY_TYPES, propertyTypeLabel,
  type AssetKind, type CreatePropertyDto, type PropertyImage, type PropertyType,
} from "../../types/asset";

type Values = Omit<CreatePropertyDto, "kind">;

const EMPTY: Values = {
  propertyType: "", propertyName: "", houseNumber: "", floorNumber: "",
  noOfRooms: "", totalNoOfFloors: "", description: "", images: [],
  address: "", city: "", state: "", country: "",
  contactFirstName: "", contactLastName: "", contactEmail: "",
  contactCountryCode: "+234", contactPhone: "",
  forRent: false, forSale: false,
};

const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa"].map((c) => ({ value: c, label: c }));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_IMAGES = 3;

const STEPS: WizardStep<Values>[] = [
  {
    id: "details",
    title: "Property Details",
    validate: (v) => {
      const e: any = {};
      if (!v.propertyType) e.propertyType = "Select a property type.";
      if (!v.propertyName.trim()) e.propertyName = "Property name is required.";
      if (!v.houseNumber.trim()) e.houseNumber = "House number is required.";
      if (!v.floorNumber.trim()) e.floorNumber = "Floor number is required.";
      if (!v.noOfRooms.trim()) e.noOfRooms = "Number of rooms is required.";
      if (!v.totalNoOfFloors.trim()) e.totalNoOfFloors = "Total number of floors is required.";
      return e;
    },
  },
  {
    id: "location",
    title: "Property Location",
    validate: (v) => {
      const e: any = {};
      if (!v.address.trim()) e.address = "Address is required.";
      if (!v.city.trim()) e.city = "City is required.";
      if (!v.state.trim()) e.state = "State is required.";
      if (!v.country.trim()) e.country = "Select a country.";
      return e;
    },
  },
  {
    id: "contact",
    title: "Property Contact & Availability",
    validate: (v) => {
      const e: any = {};
      if (!v.contactFirstName.trim()) e.contactFirstName = "First name is required.";
      if (!v.contactLastName.trim()) e.contactLastName = "Last name is required.";
      if (!v.contactEmail.trim()) e.contactEmail = "Email is required.";
      else if (!EMAIL_RE.test(v.contactEmail.trim())) e.contactEmail = "Enter a valid email address.";
      if (!v.contactPhone.trim()) e.contactPhone = "Phone number is required.";
      if (!v.forRent && !v.forSale) e.forRent = "Choose at least one availability status.";
      return e;
    },
  },
];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`h-6 w-11 rounded-full p-0.5 transition-colors shrink-0 ${on ? "bg-blue-600" : "bg-gray-300"}`}
    >
      <span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`} />
    </button>
  );
}

export interface AddPropertyWizardProps {
  kind: AssetKind;
  open: boolean;
  onClose: () => void;
  onSubmit: (dto: CreatePropertyDto) => Promise<void>;
  onViewProperty?: () => void;
}

export default function AddPropertyWizard({
  kind, open, onClose, onSubmit, onViewProperty,
}: AddPropertyWizardProps) {
  const [succeeded, setSucceeded] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const wizard = useWizard<Values>({
    steps: STEPS,
    initialValues: EMPTY,
    onSubmit: async (values) => {
      await onSubmit({ ...values, kind });
      setSucceeded(true);
    },
  });

  const { values, setValue, errors } = wizard;
  const closeAll = () => { wizard.reset(); setSucceeded(false); setUploadError(""); onClose(); };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadError("");
    const room = MAX_IMAGES - values.images.length;
    if (room <= 0) { setUploadError(`You can upload up to ${MAX_IMAGES} images.`); return; }
    const next: PropertyImage[] = [];
    for (const file of Array.from(files).slice(0, room)) {
      if (!/^image\/(png|jpeg|svg\+xml)$/.test(file.type)) {
        setUploadError("Supported file types: .PNG .JPEG .SVG"); continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("Images must be no larger than 10MB."); continue;
      }
      next.push({ id: `img-${Date.now()}-${next.length}`, url: await downscaleImage(file) });
    }
    if (next.length) setValue("images", [...values.images, ...next]);
  };

  const body = useMemo(() => {
    if (wizard.step.id === "details") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
          <FloatingSelect
            label="Property Type" placeholder="Select property type..."
            value={values.propertyType} error={errors.propertyType}
            options={PROPERTY_TYPES.map((t) => ({ value: t, label: propertyTypeLabel(t) }))}
            onChange={(v) => setValue("propertyType", v as PropertyType)}
          />
          <FloatingInput
            label="Property Name" placeholder="Enter property name"
            leading={<Home className="h-3.5 w-3.5" />}
            value={values.propertyName} error={errors.propertyName}
            onChange={(e) => setValue("propertyName", e.target.value)}
          />
          <FloatingInput
            label="House Number" placeholder="Enter house number"
            value={values.houseNumber} error={errors.houseNumber}
            onChange={(e) => setValue("houseNumber", e.target.value)}
          />
          <FloatingInput
            label="Floor Number" placeholder="Enter floor number"
            value={values.floorNumber} error={errors.floorNumber}
            onChange={(e) => setValue("floorNumber", e.target.value)}
          />
          <FloatingInput
            label="No of Rooms" type="number" min={0} placeholder="Enter number of rooms"
            value={values.noOfRooms} error={errors.noOfRooms}
            onChange={(e) => setValue("noOfRooms", e.target.value)}
          />
          <FloatingInput
            label="Total No of Floors" type="number" min={0} placeholder="Enter number of floors"
            value={values.totalNoOfFloors} error={errors.totalNoOfFloors}
            onChange={(e) => setValue("totalNoOfFloors", e.target.value)}
          />

          <div className="relative">
            <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
              Property Description
            </label>
            <textarea
              rows={8}
              placeholder="Enter property description..."
              value={values.description}
              onChange={(e) => setValue("description", e.target.value)}
              className="w-full text-xs px-4 py-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold placeholder:text-gray-300 resize-none"
            />
          </div>

          <div className="relative">
            <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
              Add Property Image
            </label>
            <div className="border border-gray-200 rounded-xl p-5 text-center space-y-3 min-h-[212px] flex flex-col items-center justify-center">
              {values.images.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {values.images.map((img) => (
                    <div key={img.id} className="relative group">
                      <img src={img.url} alt="" className="h-16 w-20 rounded-lg object-cover border border-gray-200" />
                      <button
                        type="button"
                        aria-label="Remove image"
                        onClick={() => setValue("images", values.images.filter((x) => x.id !== img.id))}
                        className="absolute inset-0 bg-slate-900/50 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {values.images.length === 0 && (
                <>
                  <ImagePlus className="h-7 w-7 text-gray-300 mx-auto" />
                  <div>
                    <p className="text-xs font-bold text-slate-700">Upload property image</p>
                    <p className="text-[10px] text-gray-400 font-bold mt-1">
                      Upload up to {MAX_IMAGES} images no larger than 10MB.
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold">
                      Supported file types: .PNG .JPEG .SVG
                    </p>
                  </div>
                </>
              )}
              <label className="inline-block cursor-pointer text-[11px] font-black text-blue-600 border border-blue-200 rounded-xl px-4 py-2 hover:bg-blue-50 transition-colors">
                Upload image {values.images.length}/{MAX_IMAGES}
                <input
                  type="file" multiple accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden" onChange={(e) => handleFiles(e.target.files)}
                />
              </label>
              {uploadError && <p className="text-[10px] font-bold text-rose-600">{uploadError}</p>}
            </div>
          </div>
        </div>
      );
    }

    if (wizard.step.id === "location") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
          <FloatingInput
            label="Address" placeholder="Enter address"
            leading={<MapPin className="h-3.5 w-3.5" />}
            value={values.address} error={errors.address}
            onChange={(e) => setValue("address", e.target.value)}
          />
          <FloatingInput
            label="City" placeholder="Enter city"
            leading={<MapPin className="h-3.5 w-3.5" />}
            value={values.city} error={errors.city}
            onChange={(e) => setValue("city", e.target.value)}
          />
          <FloatingInput
            label="State" placeholder="Enter state"
            leading={<MapPin className="h-3.5 w-3.5" />}
            value={values.state} error={errors.state}
            onChange={(e) => setValue("state", e.target.value)}
          />
          <FloatingSelect
            label="Country" placeholder="Select country..."
            value={values.country} error={errors.country} options={COUNTRIES}
            onChange={(v) => setValue("country", v)}
          />
        </div>
      );
    }

    return (
      <div className="space-y-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
          <FloatingInput
            label="First Name" placeholder="Enter first name"
            leading={<User className="h-3.5 w-3.5" />}
            value={values.contactFirstName} error={errors.contactFirstName}
            onChange={(e) => setValue("contactFirstName", e.target.value)}
          />
          <FloatingInput
            label="Last Name" placeholder="Enter last name"
            leading={<User className="h-3.5 w-3.5" />}
            value={values.contactLastName} error={errors.contactLastName}
            onChange={(e) => setValue("contactLastName", e.target.value)}
          />
          <FloatingInput
            label="Email Address" type="email" placeholder="Enter email address"
            leading={<Mail className="h-3.5 w-3.5" />}
            value={values.contactEmail} error={errors.contactEmail}
            onChange={(e) => setValue("contactEmail", e.target.value)}
          />
          <div className="grid grid-cols-[92px_1fr] gap-3">
            <FloatingInput
              label="Code" placeholder="+234"
              value={values.contactCountryCode}
              onChange={(e) => setValue("contactCountryCode", e.target.value)}
            />
            <FloatingInput
              label="Phone Number" placeholder="803 - 533 - 5432"
              value={values.contactPhone} error={errors.contactPhone}
              onChange={(e) => setValue("contactPhone", e.target.value)}
            />
          </div>
        </div>

        <div className="relative">
          <label className="absolute -top-2.5 left-4 px-3 py-0.5 bg-white text-[10px] font-black text-slate-400 border border-gray-100 rounded-full z-10 uppercase tracking-tighter">
            Availability Status
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5">
            <div className="flex items-center justify-between gap-3 border border-gray-200 rounded-xl px-4 py-3">
              <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Home className="h-4 w-4 text-slate-400" /> For Rent
              </span>
              <Toggle on={values.forRent} onChange={(v) => setValue("forRent", v)} />
            </div>
            <div className="flex items-center justify-between gap-3 border border-gray-200 rounded-xl px-4 py-3">
              <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <DollarSign className="h-4 w-4 text-slate-400" /> For Sale
              </span>
              <Toggle on={values.forSale} onChange={(v) => setValue("forSale", v)} />
            </div>
          </div>
          {errors.forRent && (
            <span className="mt-1.5 block text-[10px] font-bold text-rose-600">{errors.forRent}</span>
          )}
        </div>
      </div>
    );
  }, [wizard.step.id, values, errors, setValue, uploadError]);

  const noun = kind === "fixed" ? "Property" : "Mobile Asset";

  return (
    <>
      <Modal
        open={open && !succeeded}
        onClose={closeAll}
        title="Add Property"
        description="Register a property to your estate."
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
          submitLabel="Add Property"
        >
          {body}
        </WizardChrome>
      </Modal>

      <SuccessDialog
        open={succeeded}
        onClose={closeAll}
        title={`${noun} Added Successfully`}
        primaryLabel="View Property"
        onPrimary={() => { closeAll(); onViewProperty?.(); }}
        secondaryLabel="Add Another"
        onSecondary={() => { wizard.reset(); setSucceeded(false); }}
      />
    </>
  );
}
