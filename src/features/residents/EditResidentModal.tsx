import { useEffect, useState } from "react";
import { User, Mail, Phone, Home, Check, X } from "lucide-react";
import Modal from "../../components/ui/Modal";
import { FloatingInput } from "../../components/ui/Field";
import { useToast } from "../../components/Toast";
import { residentApi } from "../../services/api";
import { queryClient } from "../../lib/queryClient";
import { getResidentPhone } from "../../lib/format";
import type { Resident } from "../../types/api";

export interface EditResidentModalProps {
  resident: Resident | null;
  estateId: string;
  onClose: () => void;
}

/**
 * PATCH /residents/{userId}/estate/{estateId}.
 *
 * The spec declares no body schema for this route, so only the fields the
 * resident record itself exposes are sent, and only when changed.
 */
export default function EditResidentModal({ resident, estateId, onClose }: EditResidentModalProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phoneNumber: "", houseNo: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!resident) return;
    setForm({
      firstName: resident.firstName ?? "",
      lastName: resident.lastName ?? "",
      email: resident.email ?? "",
      phoneNumber: getResidentPhone(resident),
      houseNo: resident.houseNo ?? "",
    });
  }, [resident]);

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!resident) return;
    if (!form.firstName.trim() || !form.lastName.trim()) {
      showToast("First and last name are required.");
      return;
    }
    setIsSaving(true);
    try {
      await residentApi.update(resident.id, estateId, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        houseNo: form.houseNo.trim(),
      });
      queryClient.invalidateQueries({ queryKey: ["residents"] });
      showToast("Resident updated", "success");
      onClose();
    } catch (err: any) {
      showToast(err?.message || "Could not update this resident");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      open={!!resident}
      onClose={onClose}
      title="Edit Resident"
      description="Update this resident's details."
      size="md"
    >
      <div className="space-y-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
          <FloatingInput
            label="First Name" placeholder="First name" leading={<User className="h-3.5 w-3.5" />}
            value={form.firstName} onChange={(e) => set("firstName", e.target.value)}
          />
          <FloatingInput
            label="Last Name" placeholder="Last name" leading={<User className="h-3.5 w-3.5" />}
            value={form.lastName} onChange={(e) => set("lastName", e.target.value)}
          />
          <FloatingInput
            label="Email Address" type="email" placeholder="you@example.com"
            leading={<Mail className="h-3.5 w-3.5" />}
            value={form.email} onChange={(e) => set("email", e.target.value)}
          />
          <FloatingInput
            label="Phone Number" placeholder="803 555 0007" leading={<Phone className="h-3.5 w-3.5" />}
            value={form.phoneNumber} onChange={(e) => set("phoneNumber", e.target.value)}
          />
          <div className="sm:col-span-2">
            <FloatingInput
              label="House No" placeholder="A12" leading={<Home className="h-3.5 w-3.5" />}
              value={form.houseNo} onChange={(e) => set("houseNo", e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button" onClick={onClose} disabled={isSaving}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-all"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
          <button
            type="button" onClick={save} disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-lg shadow-blue-100 disabled:opacity-60 transition-all"
          >
            {isSaving
              ? <span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Check className="h-3.5 w-3.5 stroke-[3]" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
