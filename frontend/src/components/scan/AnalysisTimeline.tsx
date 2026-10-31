"use client";

import { Check, Loader2, Circle } from "lucide-react";

export const TIMELINE_STEPS = [
  "Queued",
  "Fetching PR",
  "Resolving versions",
  "Downloading packages",
  "Analyzing",
  "Checking advisories",
  "AI review",
  "Publishing",
] as const;

export type TimelineStep = (typeof TIMELINE_STEPS)[number];

export function getActiveStepIndex(
  status: "queued" | "running" | "succeeded" | "failed" | "superseded",
  runningSubStep: number = 4
): number {
  if (status === "queued") return 0;
  if (status === "succeeded") return TIMELINE_STEPS.length;
  if (status === "failed") return -1;
  return Math.max(1, Math.min(runningSubStep, TIMELINE_STEPS.length - 1));
}

export interface AnalysisTimelineProps {
  status: "queued" | "running" | "succeeded" | "failed" | "superseded";
  activeStepIndex?: number;
}

export const AnalysisTimeline: React.FC<AnalysisTimelineProps> = ({
  status,
  activeStepIndex = 0,
}) => {
  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/[0.08]">
      {TIMELINE_STEPS.map((step, idx) => {
        const isCompleted =
          status === "succeeded" || (status === "running" && idx < activeStepIndex);
        const isCurrent =
          (status === "queued" && idx === 0) ||
          (status === "running" && idx === activeStepIndex);

        return (
          <div key={step} className="relative flex items-center gap-4 group">
            {/* Step Icon Indicator */}
            <div
              className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                isCompleted
                  ? "bg-[#34D399] text-[#0A0920] shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                  : isCurrent
                  ? "bg-[#2D2A6E] border-2 border-[#7CF5FF] text-[#7CF5FF] shadow-[0_0_12px_rgba(124,245,255,0.6)]"
                  : "bg-white/[0.04] border border-white/[0.1] text-[#716C9B]"
              }`}
            >
              {isCompleted ? (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              ) : isCurrent ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Circle className="w-2 h-2 fill-current" />
              )}
            </div>

            {/* Step Label */}
            <div className="pl-4">
              <span
                className={`text-sm font-medium tracking-wide transition-colors ${
                  isCompleted
                    ? "text-white font-semibold"
                    : isCurrent
                    ? "text-[#7CF5FF] font-bold"
                    : "text-[#716C9B]"
                }`}
              >
                {step}
              </span>
              {isCurrent && (
                <span className="block text-[11px] font-mono text-[#8A84C4] mt-0.5">
                  In progress...
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
