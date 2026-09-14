import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { ScanLine, ShieldCheck, User as UserIcon, Mail, Phone, IdCard, Save } from "lucide-react";
import PortalShell, { type PortalNavItem } from "../shared/PortalShell";
import VerifyCodePanel from "../visitors/VerifyCodePanel";
import { FloatingInput } from "../../components/ui/Field";
import { FloatingSelect } from "../../components/ui/Select";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { securityPersonnelApi } from "../../services/api";
import { DOCUMENT_TYPES, documentTypeLabel, GENDERS, genderLabel } from "../../types/security";

const NAV: PortalNavItem[] = [
  { key: "dashboard", label: "Gate Check", icon: ScanLine, path: "/security/dashboard" },
  { key: "profile", label: "My Profile", icon: UserIcon, path: "/security/profile" },
];

const splitName = (name?: string) => {
  const [first = "", ...rest] = (name || "").trim().split(" ");
  return { firstName: first, lastName: rest.join(" ") };
};

/** PATCH /security-personnel/update-profile — a guard editing their own record. */
function ProfileForm() {
  const { user, login, token } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    ...splitName(user?.name),
    email: user?.email ?? "",
    phoneNumber: "",
    gender: "" as string,
    documentType: "" as string,
    documentNumber: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      showToast("First and last name are required.");
      return;
    }
    setIsSaving(true);
    try {
      // Send only what the user filled — the route accepts a partial.
      const body: Record<string, string> = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      };
      for (const k of ["email", "phoneNumber", "gender", "documentType", "documentNumber"] as const) {
        if (form[k]) body[k] = String(form[k]).trim();
      }
      await securityPersonnelApi.updateProfile(body as any);
      if (user && token) {
        login({ ...user, name: `${body.firstName} ${body.lastName}` }, token);
      }
      showToast("Profile updated", "success");
    } catch (err: any) {
      showToast(err?.message || "Could not update your profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-display">My Profile</h2>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">
          Keep your details up to date
        </p>
      </div>

      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
          <FloatingInput
            label="First Name" placeholder="First name" leading={<UserIcon className="h-3.5 w-3.5" />}
            value={form.firstName} onChange={(e) => set("firstName", e.target.value)}
          />
          <FloatingInput
            label="Last Name" placeholder="Last name" leading={<UserIcon className="h-3.5 w-3.5" />}
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
          <FloatingSelect
            label="Gender" placeholder="Select gender..." value={form.gender}
            options={GENDERS.map((g) => ({ value: g, label: genderLabel(g) }))}
            onChange={(v) => set("gender", v)}
          />
          <FloatingSelect
            label="Document Type" placeholder="Select document type..." value={form.documentType}
            options={DOCUMENT_TYPES.map((t) => ({ value: t, label: documentTypeLabel(t) }))}
            onChange={(v) => set("documentType", v)}
          />
          <div className="sm:col-span-2">
            <FloatingInput
              label="Document Number" placeholder="Enter document number"
              leading={<IdCard className="h-3.5 w-3.5" />}
              value={form.documentNumber} disabled={!form.documentType}
              onChange={(e) => set("documentNumber", e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button" onClick={save} disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-lg shadow-blue-100 disabled:opacity-50 transition-all"
          >
            {isSaving
              ? <span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Save className="h-3.5 w-3.5" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function SecurityPortal() {
  const location = useLocation();
  const section = useMemo(
    () => location.pathname.split("/").filter(Boolean)[1] ?? "dashboard",
    [location.pathname],
  );

  return (
    <PortalShell
      brand="Security" subtitle="Gate operations" brandIcon={ShieldCheck} nav={NAV}
      isActive={(i) => i.path.endsWith(section)}
    >
      {section === "profile" ? <ProfileForm /> : (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-display">Gate Check</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">
              Verify a visitor's access code
            </p>
          </div>
          <VerifyCodePanel />
        </div>
      )}
    </PortalShell>
  );
}
