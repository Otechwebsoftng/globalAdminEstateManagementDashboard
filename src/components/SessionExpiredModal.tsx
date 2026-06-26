import React from "react";
import { AlertTriangle } from "lucide-react";

interface SessionExpiredModalProps {
  isOpen: boolean;
  onLogin: () => void;
}

export default function SessionExpiredModal({ isOpen, onLogin }: SessionExpiredModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl text-center">
        <div className="mx-auto h-14 w-14 bg-red-50 rounded-full flex items-center justify-center mb-5">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>
        <h3 className="text-lg font-black text-slate-900 mb-2">Session Expired</h3>
        <p className="text-sm text-gray-500 mb-6">
          Your session has expired. Please sign in again to continue.
        </p>
        <button
          onClick={onLogin}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
        >
          Sign In Again
        </button>
      </div>
    </div>
  );
}
