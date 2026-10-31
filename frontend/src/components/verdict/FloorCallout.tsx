import React from "react";
import { Scale } from "lucide-react";

export interface FloorCalloutProps {
  floorApplied: number | null | undefined;
}

export const FloorCallout: React.FC<FloorCalloutProps> = ({ floorApplied }) => {
  if (floorApplied === null || floorApplied === undefined) return null;

  return (
    <div
      role="region"
      aria-label="Security floor notice"
      className="p-5 rounded-2xl bg-[#FBBF24]/10 border border-[#FBBF24]/35 shadow-[0_4px_20px_rgba(251,191,36,0.15)] backdrop-blur-xl flex items-start gap-4"
    >
      <div className="p-2.5 rounded-xl bg-[#FBBF24]/20 border border-[#FBBF24]/40 text-[#FBBF24] shrink-0 mt-0.5">
        <Scale className="w-5 h-5" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h4 className="font-display text-sm font-bold text-white">
            Deterministic Security Floor Applied: {floorApplied}
          </h4>
          <span className="px-2 py-0.5 rounded-md bg-[#FBBF24]/20 text-[10px] font-mono font-bold text-[#FBBF24]">
            Minimum Baseline
          </span>
        </div>
        <p className="text-xs text-[#E6E1FF] mt-1.5 leading-relaxed">
          The threat score is pinned to a minimum baseline of {floorApplied} because of a high-consequence combination: an active lifecycle script paired with an unverified outbound network connection. Deterministic policy rules prevent the aggregate score from falling below this threshold.
        </p>
      </div>
    </div>
  );
};
