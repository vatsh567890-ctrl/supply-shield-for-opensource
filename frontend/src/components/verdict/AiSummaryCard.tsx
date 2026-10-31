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
    ok: "bg-[#7CF5FF]/15 text-[#7CF5FF] border-[#7CF5FF]/40 shadow-[0_0_12px_rgba(124,245,255,0.2)]",
    disabled:
      "bg-white/[0.06] text-[#A39EC8] border-[rgba(138,132,196,0.3)]",
    unavailable:
      "bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/40 shadow-[0_0_12px_rgba(251,191,36,0.2)]",
  };

  const getBadgeIcon = () => {
    switch (aiStatus) {
      case "ok":
        return <Sparkles className="w-3.5 h-3.5 mr-1 text-[#7CF5FF]" />;
      case "disabled":
        return <Cpu className="w-3.5 h-3.5 mr-1 text-[#A39EC8]" />;
      case "unavailable":
        return <AlertCircle className="w-3.5 h-3.5 mr-1 text-[#FBBF24]" />;
    }
  };

  return (
    <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.04] border border-[rgba(138,132,196,0.25)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.36)] space-y-5">
      {/* Card Header with AI Status Badge */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
        <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
          <span>Security Triage Summary</span>
        </h3>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-medium border backdrop-blur-md ${badgeStyles[aiStatus]}`}
        >
          {getBadgeIcon()}
          <span>{badgeText}</span>
        </span>
      </div>

      {/* Intent Summary (Rendered Above) */}
      {intentSummary && (
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#7CF5FF] mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#7CF5FF]" />
            Corroborated Package Intent
          </h4>
          <p className="text-sm text-white font-medium leading-relaxed">
            {intentSummary}
          </p>
        </div>
      )}

      {/* Plain-English Analysis */}
      <div>
        <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#8A84C4] mb-2">
          Plain-English Explanation
        </h4>
        <p className="text-sm text-[#D1CEE5] leading-relaxed">
          {plainEnglishExplanation ||
            "Deterministic static checks completed. No malicious obfuscation, abnormal maintainer transfer, or unauthorized network calls identified."}
        </p>
      </div>
    </div>
  );
};
