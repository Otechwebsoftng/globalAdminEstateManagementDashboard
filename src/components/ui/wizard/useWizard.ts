import { useCallback, useMemo, useState } from "react";

export type WizardErrors<T> = Partial<Record<keyof T, string>>;

export interface WizardStep<T> {
  id: string;
  title: string;
  subtitle?: string;
  /** Return an error map to block Next, or null/{} to advance. */
  validate?: (values: T) => WizardErrors<T> | null;
}

export interface UseWizardOptions<T> {
  steps: WizardStep<T>[];
  initialValues: T;
  onSubmit: (values: T) => Promise<void> | void;
}

/**
 * Headless multi-step form state, shared by every board's wizard.
 *
 * Values are one flat object for the whole wizard (not per-step) so a review
 * step can read everything and back-navigation is lossless.
 */
export function useWizard<T extends object>({ steps, initialValues, onSubmit }: UseWizardOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState<WizardErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const runValidation = useCallback(() => {
    const found = step?.validate?.(values) ?? null;
    if (found && Object.keys(found).length > 0) {
      setErrors(found);
      return false;
    }
    setErrors({});
    return true;
  }, [step, values]);

  const next = useCallback(() => {
    if (!runValidation()) return false;
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    return true;
  }, [runValidation, steps.length]);

  const back = useCallback(() => {
    setErrors({});
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const submit = useCallback(async () => {
    if (!runValidation()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch {
      // The caller surfaces the error (toast); the wizard just stays open on
      // the last step so the user can correct and retry.
    } finally {
      setIsSubmitting(false);
    }
  }, [runValidation, onSubmit, values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setStepIndex(0);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  const progress = useMemo(() => (stepIndex + 1) / steps.length, [stepIndex, steps.length]);

  return {
    values, setValue, setValues,
    step, stepIndex, totalSteps: steps.length, isFirst, isLast, progress,
    errors, next, back, goTo: setStepIndex, submit, isSubmitting, reset,
  };
}
