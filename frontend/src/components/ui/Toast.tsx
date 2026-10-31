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
              "border-[#34D399]/40 bg-[#0E0C2B]/95 text-white shadow-[0_4px_24px_rgba(52,211,153,0.2)]",
            error:
              "border-[#F43F5E]/40 bg-[#0E0C2B]/95 text-white shadow-[0_4px_24px_rgba(244,63,94,0.2)]",
            warning:
              "border-[#FBBF24]/40 bg-[#0E0C2B]/95 text-white shadow-[0_4px_24px_rgba(251,191,36,0.2)]",
            info:
              "border-[#6C63FF]/40 bg-[#0E0C2B]/95 text-white shadow-[0_4px_24px_rgba(108,99,255,0.2)]",
          };

          const icon = {
            success: <CheckCircle2 className="w-5 h-5 text-[#34D399] shrink-0" />,
            error: <AlertOctagon className="w-5 h-5 text-[#F43F5E] shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-[#FBBF24] shrink-0" />,
            info: <Info className="w-5 h-5 text-[#7CF5FF] shrink-0" />,
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
                  <p className="text-xs text-[#A39EC8] mt-0.5 leading-relaxed">
                    {t.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                aria-label="Dismiss notification"
                className="p-1 rounded-lg text-[#A39EC8] hover:text-white transition-colors"
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
