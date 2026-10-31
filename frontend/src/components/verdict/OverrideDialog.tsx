"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertOctagon, AlertTriangle } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { OverrideInputSchema } from "@/lib/schemas/verdicts";

export interface OverrideDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (action: "accept" | "reject", reason: string) => Promise<void> | void;
}

export const OverrideDialog: React.FC<OverrideDialogProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [action, setAction] = useState<"accept" | "reject">("accept");
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validation = OverrideInputSchema.safeParse({ action, reason });
    if (!validation.success) {
      setErrorMsg(validation.error.issues[0]?.message || "Invalid override data.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(validation.data.action, validation.data.reason);
      setReason("");
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to submit override.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Submit Security Override"
      description="Apply a manual policy override to this pull request check run."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Action Selection Pills */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#A39EC8] mb-2.5">
            Decision Action
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAction("accept")}
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                action === "accept"
                  ? "bg-[#34D399]/20 border-[#34D399] text-[#34D399] shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                  : "bg-white/[0.04] border-white/[0.08] text-[#8A84C4] hover:bg-white/[0.06]"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Accept (Safe)</span>
            </button>

            <button
              type="button"
              onClick={() => setAction("reject")}
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                action === "reject"
                  ? "bg-[#F43F5E]/20 border-[#F43F5E] text-[#F43F5E] shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                  : "bg-white/[0.04] border-white/[0.08] text-[#8A84C4] hover:bg-white/[0.06]"
              }`}
            >
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span>Reject (Block)</span>
            </button>
          </div>
        </div>

        {/* Reason Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="override-reason"
              className="text-xs font-mono uppercase tracking-wider text-[#A39EC8]"
            >
              Required Justification (1–500 chars)
            </label>
            <span className="text-[11px] font-mono text-[#8A84C4]">
              {reason.length}/500
            </span>
          </div>

          <textarea
            id="override-reason"
            rows={4}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="Explain why this finding is safe or being rejected..."
            className="w-full p-3.5 rounded-xl bg-white/[0.04] border border-[rgba(138,132,196,0.3)] focus:border-[#6C63FF] focus:ring-2 focus:ring-[#7CF5FF] text-white text-xs placeholder:text-[#716C9B] backdrop-blur-md outline-none transition-all resize-none font-sans"
          />

          {errorMsg && (
            <div
              role="alert"
              className="mt-2 flex items-center gap-2 text-xs text-[#FCA5A5] p-2.5 rounded-lg bg-[#F43F5E]/15 border border-[#F43F5E]/40"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#F43F5E]" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            type="button"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="glow"
            size="sm"
            type="submit"
            disabled={submitting || !reason.trim()}
          >
            {submitting ? "Recording..." : "Confirm Decision"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
