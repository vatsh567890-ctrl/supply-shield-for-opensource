import React from "react";
import { Sparkles, Cpu, AlertCircle } from "lucide-react";

export interface AiSummaryCardProps {
  aiStatus: "ok" | "disabled" | "unavailable";
  intentSummary?: string | null;
  plainEnglishExplanation?: string | null;
}

export function getAiBadgeText(aiStatus: "ok" | "disabled" | "unavailable"): string {
  switch (aiStatus) {
    case "ok":
      return "AI summary";
    case "disabled":
      return "Rule-based summary";
    case "unavailable":
      return "AI unavailable";
  }
}

export const AiSummaryCard: React.FC<AiSummaryCardProps> = ({
  aiStatus,
  intentSummary,
  plainEnglishExplanation,
}) => {
  const badgeText = getAiBadgeText(aiStatus);

  const badgeStyles = {
    ok: "bg-[#B8556B]/15 text-[#B8556B] border-[#B8556B]/30",
    disabled:
      "bg-[#FAF4F6] text-[#6E6268] border-[#F0DCE2]",
    unavailable:
      "bg-[#9A6410]/15 text-[#9A6410] border-[#9A6410]/30",
  };

  const getBadgeIcon = () => {
    switch (aiStatus) {
      case "ok":
        return <Sparkles className="w-3.5 h-3.5 mr-1 text-[#B8556B]" />;
      case "disabled":
        return <Cpu className="w-3.5 h-3.5 mr-1 text-[#6E6268]" />;
      case "unavailable":
        return <AlertCircle className="w-3.5 h-3.5 mr-1 text-[#9A6410]" />;
    }
  };

  return (
    <div className="p-6 sm:p-7 rounded-[12px] bg-white border border-[#F0DCE2] shadow-[0_1px_2px_rgba(30,26,28,0.04)] space-y-5">
      {/* Card Header with AI Status Badge */}
      <div className="flex items-center justify-between pb-4 border-b border-[#F0DCE2]">
        <h3 className="font-display text-base font-bold text-[#1E1A1C] flex items-center gap-2">
          <span>Security Triage Summary</span>
        </h3>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-medium border ${badgeStyles[aiStatus]}`}
        >
          {getBadgeIcon()}
          <span>{badgeText}</span>
        </span>
      </div>

      {/* Intent Summary (Rendered Above) */}
      {intentSummary && (
        <div className="p-4 rounded-xl bg-[#FAF4F6] border border-[#F0DCE2]">
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#B8556B] mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#B8556B]" />
            Corroborated Package Intent
          </h4>
          <p className="text-sm text-[#1E1A1C] font-medium leading-relaxed">
            {intentSummary}
          </p>
        </div>
      )}

      {/* Plain-English Analysis */}
      <div>
        <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#6E6268] mb-2">
          Plain-English Explanation
        </h4>
        <p className="text-sm text-[#6E6268] leading-relaxed">
          {plainEnglishExplanation ||
            "Deterministic static checks completed. No malicious obfuscation, abnormal maintainer transfer, or unauthorized network calls identified."}
        </p>
      </div>
    </div>
  );
};
