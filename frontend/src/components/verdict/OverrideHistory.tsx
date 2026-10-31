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
      <div className="p-6 text-center text-xs text-[#8A84C4] italic rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        No manual override decisions submitted for this verdict.
      </div>
    );
  }

  return (
    <div
      data-testid="override-timeline"
      className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/[0.08]"
    >
      {overrides.map((ov) => {
        const isAccept = ov.action === "accept";

        return (
          <div key={ov.id} className="relative flex items-start gap-4">
            {/* Timeline Dot Icon */}
            <div
              className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                isAccept
                  ? "bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40"
                  : "bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/40"
              }`}
            >
              {isAccept ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertOctagon className="w-3.5 h-3.5" />
              )}
            </div>

            {/* Content Card */}
            <div className="flex-1 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-mono font-semibold text-white">
                    <User className="w-3 h-3 text-[#7CF5FF]" />
                    {ov.user_login || "sec-ops-lead"}
                  </span>
                  <Badge level={isAccept ? "LOW" : "HIGH"}>
                    {isAccept ? "ACCEPTED (SAFE)" : "REJECTED (BLOCKED)"}
                  </Badge>
                </div>

                <span className="text-[11px] font-mono text-[#8A84C4] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatRelativeTime(ov.created_at)}
                </span>
              </div>

              {/* Reason (strictly rendered as plain text) */}
              <p className="text-xs text-[#D1CEE5] leading-relaxed select-text">
                {ov.reason}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
