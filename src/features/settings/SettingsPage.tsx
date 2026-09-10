import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, User as UserIcon, Lock, ShieldCheck } from "lucide-react";
import { FloatingInput } from "../../components/ui/Field";
import ImageUpload from "../../components/ui/ImageUpload";
import PasswordStrengthMeter, { scorePassword } from "../../components/ui/PasswordStrengthMeter";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { globalAdminApi, authApi } from "../../services/api";

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  address: string;
  city: string;
}

const splitName = (name?: string) => {
  const [first = "", ...rest] = (name || "").trim().split(" ");
  return { firstName: first, lastName: rest.join(" ") };
};

const AVATAR_KEY = "global_estates_avatar";

export default function SettingsPage() {
  const { user, login, token } = useAuth();
  const { showToast } = useToast();

  const initial: ProfileForm = {
    ...splitName(user?.name),
    email: user?.email ?? "",
    countryCode: "+234",
    phoneNumber: "",
    address: "",
    city: "",
  };

  const [form, setForm] = useState<ProfileForm>(initial);
  const [savedForm, setSavedForm] = useState<ProfileForm>(initial);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // No avatar upload endpoint exists yet, so the picked image is kept per-browser.
  const [avatar, setAvatar] = useState<string | null>(null);
  useEffect(() => {
    try { setAvatar(localStorage.getItem(AVATAR_KEY)); } catch { /* storage blocked */ }
  }, []);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const set = <K extends keyof ProfileForm>(k: K, v: ProfileForm[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);

  const onAvatarChange = (dataUrl: string | null) => {
    setAvatar(dataUrl);
    try {
      if (dataUrl) localStorage.setItem(AVATAR_KEY, dataUrl);
      else localStorage.removeItem(AVATAR_KEY);
    } catch {
      showToast("Could not save the photo in this browser.");
    }
  };

  const saveProfile = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      showToast("First name, last name and email are required.");
      return;
    }
    setIsSavingProfile(true);
    try {
      // PUT /global-admin/edit-profile takes a full CreateAdminDto, including
      // roleId. Sending a partial risks clearing the caller's own role, so every
      // field is sent and roleId is carried through from the session.
      await globalAdminApi.editProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        countryCode: form.countryCode.trim(),
        phoneNumber: form.phoneNumber.trim(),
        roleId: user?.roleId ?? "",
      });
      setSavedForm(form);
      if (user && token) {
        login({ ...user, name: `${form.firstName.trim()} ${form.lastName.trim()}`, email: form.email.trim() }, token);
      }
      showToast("Profile updated", "success");
    } catch (err: any) {
      showToast(err?.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const savePassword = async () => {
    if (!currentPassword || !newPassword) {
      showToast("Enter your current and new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New password and confirmation do not match.");
      return;
    }
    if (scorePassword(newPassword).score < 2) {
      showToast("Choose a stronger password.");
      return;
    }
    setIsSavingPassword(true);
    try {
      // The backend exposes no authenticated change-password endpoint — only the
      // emailed-OTP reset flow — so this starts that flow for the signed-in user
      // and hands off to the existing verify/reset screens.
      await authApi.forgotPassword({ email: form.email.trim() });
      showToast(`We sent a confirmation code to ${form.email.trim()} to finish the change.`, "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showToast(err?.message || "Could not start the password change.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-display">Settings</h2>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">
          Manage your account and platform preferences.
        </p>
      </div>

      {/* Profile */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-7">
        <div>
          <h3 className="text-sm font-black text-slate-900">Profile</h3>
          <p className="text-[11px] text-gray-400 font-bold mt-0.5">Manage your personal information.</p>
        </div>

        <ImageUpload value={avatar} onChange={onAvatarChange} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7 pt-1">
          <FloatingInput
            label="First Name" placeholder="John" leading={<UserIcon className="h-3.5 w-3.5" />}
            value={form.firstName} onChange={(e) => set("firstName", e.target.value)}
          />
          <FloatingInput
            label="Last Name" placeholder="Doe" leading={<UserIcon className="h-3.5 w-3.5" />}
            value={form.lastName} onChange={(e) => set("lastName", e.target.value)}
          />
          <FloatingInput
            label="Email Address" type="email" placeholder="you@example.com"
            leading={<Mail className="h-3.5 w-3.5" />}
            value={form.email} onChange={(e) => set("email", e.target.value)}
          />
          <div className="grid grid-cols-[100px_1fr] gap-3">
            <FloatingInput
              label="Code" placeholder="+234"
              value={form.countryCode} onChange={(e) => set("countryCode", e.target.value)}
            />
            <FloatingInput
              label="Phone Number" placeholder="803 587 6754"
              leading={<Phone className="h-3.5 w-3.5" />}
              value={form.phoneNumber} onChange={(e) => set("phoneNumber", e.target.value)}
            />
          </div>
          {/*
            Address and city are in the design but CreateAdminDto -- the body
            PUT /global-admin/edit-profile expects -- has no fields for them, so
            they cannot be persisted yet. Say so rather than silently discarding
            what the user types.
          */}
          <FloatingInput
            label="Address" placeholder="12 Admiralty Way"
            leading={<MapPin className="h-3.5 w-3.5" />}
            value={form.address} onChange={(e) => set("address", e.target.value)}
          />
          <FloatingInput
            label="City" placeholder="Lekki" leading={<MapPin className="h-3.5 w-3.5" />}
            value={form.city} onChange={(e) => set("city", e.target.value)}
          />
          <p className="sm:col-span-2 -mt-3 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            Address and city are not saved yet — the profile endpoint has no fields for them.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => setForm(savedForm)}
            disabled={!isDirty || isSavingProfile}
            className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={saveProfile}
            disabled={!isDirty || isSavingProfile}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-lg shadow-blue-100 disabled:opacity-50 transition-all"
          >
            {isSavingProfile && (
              <span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {isSavingProfile ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </section>

      {/* Security */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-7">
        <div>
          <h3 className="text-sm font-black text-slate-900">Security</h3>
          <p className="text-[11px] text-gray-400 font-bold mt-0.5">Manage your account security.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
          <div className="sm:col-span-2">
            <FloatingInput
              label="Current Password" type="password" placeholder="••••••••"
              leading={<Lock className="h-3.5 w-3.5" />}
              value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2.5">
            <FloatingInput
              label="New Password" type="password" placeholder="••••••••"
              leading={<Lock className="h-3.5 w-3.5" />}
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            />
            <PasswordStrengthMeter password={newPassword} />
          </div>
          <FloatingInput
            label="Confirm New Password" type="password" placeholder="••••••••"
            leading={<Lock className="h-3.5 w-3.5" />}
            value={confirmPassword}
            error={confirmPassword && confirmPassword !== newPassword ? "Passwords do not match." : undefined}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
          <button
            type="button"
            className="flex items-center gap-1.5 text-[11px] font-black text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 transition-all"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Configure 2-factor authentication
          </button>
          <button
            type="button"
            onClick={savePassword}
            disabled={isSavingPassword}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-lg shadow-blue-100 disabled:opacity-50 transition-all"
          >
            {isSavingPassword ? "Saving..." : "Save Password"}
          </button>
        </div>
      </section>
    </div>
  );
}
