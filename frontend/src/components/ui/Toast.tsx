"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertOctagon, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (options: { type?: ToastType; title: string; message?: string }) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({
      type = "info",
      title,
      message,
    }: {
      type?: ToastType;
      title: string;
      message?: string;
    }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);

      // Auto dismiss after 4.5 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => addToast({ type: "success", title, message }),
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string) => addToast({ type: "error", title, message }),
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string) => addToast({ type: "info", title, message }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      {children}
      {/* Toast container */}
      <div
        role="region"
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none p-4"
      >
        {toasts.map((t) => {
          const typeStyles = {
            success:
              "border-[#2F7D5B]/30 bg-white text-[#1E1A1C] shadow-[0_4px_24px_rgba(30,26,28,0.08)]",
            error:
              "border-[#A3213F]/30 bg-white text-[#1E1A1C] shadow-[0_4px_24px_rgba(30,26,28,0.08)]",
            warning:
              "border-[#9A6410]/30 bg-white text-[#1E1A1C] shadow-[0_4px_24px_rgba(30,26,28,0.08)]",
            info:
              "border-[#F0DCE2] bg-white text-[#1E1A1C] shadow-[0_4px_24px_rgba(30,26,28,0.08)]",
          };

          const icon = {
            success: <CheckCircle2 className="w-5 h-5 text-[#2F7D5B] shrink-0" />,
            error: <AlertOctagon className="w-5 h-5 text-[#A3213F] shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-[#9A6410] shrink-0" />,
            info: <Info className="w-5 h-5 text-[#B8556B] shrink-0" />,
          }[t.type];

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-2xl transition-all duration-300 animate-in slide-in-from-bottom-5 ${typeStyles[t.type]}`}
            >
              {icon}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold tracking-tight">{t.title}</p>
                {t.message && (
                  <p className="text-xs text-[#6E6268] mt-0.5 leading-relaxed">
                    {t.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                aria-label="Dismiss notification"
                className="p-1 rounded-lg text-[#6E6268] hover:text-[#1E1A1C] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
