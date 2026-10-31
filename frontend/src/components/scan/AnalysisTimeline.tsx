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
    <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#F0DCE2]">
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
                  ? "bg-[#2F7D5B] text-white"
                  : isCurrent
                  ? "bg-[#FAF4F6] border-2 border-[#B8556B] text-[#B8556B]"
                  : "bg-white border border-[#F0DCE2] text-[#6E6268]"
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
                    ? "text-[#1E1A1C] font-semibold"
                    : isCurrent
                    ? "text-[#B8556B] font-bold"
                    : "text-[#6E6268]"
                }`}
              >
                {step}
              </span>
              {isCurrent && (
                <span className="block text-[11px] font-mono text-[#6E6268] mt-0.5">
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
