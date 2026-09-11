/**
 * Marks a screen whose data has no backend behind it. Driven by the service's
 * exported *_IS_MOCK flag, so it disappears on its own when the resolver flips.
 */
export default function MockBadge({ label = "Demo data" }: { label?: string }) {
  return (
    <span
      title="No backend endpoint exists for this screen yet — records are stored in this browser."
      className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      {label}
    </span>
  );
}
