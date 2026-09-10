export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
}

export function scorePassword(pw: string): PasswordStrength {
  if (!pw) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const capped = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;
  return { score: capped, label: ["Very weak", "Weak", "Fair", "Good", "Strong"][capped] };
}

const TONES = [
  "bg-gray-200", "bg-rose-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500",
];
const TEXT = [
  "text-gray-400", "text-rose-600", "text-amber-600", "text-blue-600", "text-emerald-600",
];

export default function PasswordStrengthMeter({ password }: { password: string }) {
  const { score, label } = scorePassword(password);
  if (!password) return null;
  return (
    <div className="space-y-1.5">
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${TONES[score]}`}
          style={{ width: `${(score / 4) * 100}%` }}
        />
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest ${TEXT[score]}`}>{label}</span>
    </div>
  );
}
