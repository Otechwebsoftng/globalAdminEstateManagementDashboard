import { ReactNode } from "react";
import { ArrowLeft, Check } from "lucide-react";

export interface WizardChromeProps {
  stepIndex: number;
  totalSteps: number;
  progress: number;
  stepTitle: string;
  isFirst: boolean;
  isLast: boolean;
  isSubmitting: boolean;
  /** When false the Continue/Submit button is greyed out, as designed. */
  isStepValid?: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  children: ReactNode;
  footerSlot?: ReactNode;
}

/**
 * Shared wizard chrome: step label, progress bar, Back/Next/Submit footer.
 * `footerSlot` exists so a board with bespoke footer content never has to fork this.
 */
export default function WizardChrome({
  stepIndex, totalSteps, progress, stepTitle,
  isFirst, isLast, isSubmitting, isStepValid = true,
  onBack, onNext, onSubmit,
  submitLabel = "Submit",
  children, footerSlot,
}: WizardChromeProps) {
  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{stepTitle}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Step {stepIndex + 1} of {totalSteps}
          </span>
          <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div>{children}</div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <div>
          <button
            type="button"
            onClick={onBack}
            disabled={isFirst || isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-slate-50 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
        </div>

        <div className="flex items-center gap-2">
          {footerSlot}
          <button
            type="button"
            onClick={isLast ? onSubmit : onNext}
            disabled={isSubmitting || !isStepValid}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-lg shadow-blue-100 disabled:bg-blue-300 disabled:shadow-none disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting && (
              <span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {isLast ? (isSubmitting ? "Submitting..." : submitLabel) : "Continue"}
            {isLast && !isSubmitting && <Check className="h-3.5 w-3.5 stroke-[3]" />}
          </button>
        </div>
      </div>
    </div>
  );
}
