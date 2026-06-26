import { useState, useEffect, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ErrorBoundary({ children, fallback }: Props) {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      event.preventDefault();
      setError(event.error);
    };
    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  useEffect(() => {
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      setError(new Error(String(event.reason)));
    };
    window.addEventListener("unhandledrejection", rejectionHandler);
    return () => window.removeEventListener("unhandledrejection", rejectionHandler);
  }, []);

  if (error) {
    return (
      fallback ?? (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-lg font-black text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-500 mb-4">
              {error.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    );
  }
  return children;
}
