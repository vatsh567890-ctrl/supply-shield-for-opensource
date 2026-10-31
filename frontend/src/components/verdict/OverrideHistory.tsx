import React from "react";
import { User, CheckCircle2, AlertOctagon, Clock } from "lucide-react";
import { OverrideResponse } from "@/lib/schemas/verdicts";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/format";

export const OverrideHistory: React.FC<{ overrides: OverrideResponse[] }> = ({
  overrides,
}) => {
  if (overrides.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-[#6E6268] italic rounded-[12px] bg-[#FAF4F6] border border-[#F0DCE2]">
        No manual override decisions submitted for this verdict.
      </div>
    );
  }

  return (
    <div
      data-testid="override-timeline"
      className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#F0DCE2]"
    >
      {overrides.map((ov) => {
        const isAccept = ov.action === "accept";

        return (
          <div key={ov.id} className="relative flex items-start gap-4">
            {/* Timeline Dot Icon */}
            <div
              className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                isAccept
                  ? "bg-[#2F7D5B]/15 text-[#2F7D5B] border border-[#2F7D5B]/30"
                  : "bg-[#A3213F]/15 text-[#A3213F] border border-[#A3213F]/30"
              }`}
            >
              {isAccept ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertOctagon className="w-3.5 h-3.5" />
              )}
            </div>

            {/* Content Card */}
            <div className="flex-1 p-4 rounded-[12px] bg-white border border-[#F0DCE2] shadow-[0_1px_2px_rgba(30,26,28,0.04)] space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#1E1A1C]">
                    <User className="w-3 h-3 text-[#B8556B]" />
                    {ov.user_login || "sec-ops-lead"}
                  </span>
                  <Badge level={isAccept ? "LOW" : "HIGH"}>
                    {isAccept ? "ACCEPTED (SAFE)" : "REJECTED (BLOCKED)"}
                  </Badge>
                </div>

                <span className="text-[11px] font-mono text-[#6E6268] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatRelativeTime(ov.created_at)}
                </span>
              </div>

              {/* Reason (strictly rendered as plain text) */}
              <p className="text-xs text-[#1E1A1C] leading-relaxed select-text">
                {ov.reason}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
