"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  description,
  children,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0920]/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="bg-[#0F0D28]/95 border border-[rgba(138,132,196,0.35)] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(108,99,255,0.15)] relative overflow-hidden backdrop-blur-2xl"
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3
              id="dialog-title"
              className="font-display text-xl font-bold text-white tracking-tight"
            >
              {title}
            </h3>
            {description && (
              <p className="text-xs text-[#A39EC8] mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-[#A39EC8] hover:text-white hover:bg-white/[0.08] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CF5FF]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="relative z-10 text-sm text-[#D1CEE5]">{children}</div>
      </div>
    </div>
  );
};
