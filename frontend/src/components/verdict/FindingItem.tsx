"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Terminal } from "lucide-react";
import { FindingResponse } from "@/lib/schemas/verdicts";
import { Badge } from "@/components/ui/Badge";

export const FindingItem: React.FC<{ finding: FindingResponse }> = ({
  finding,
}) => {
  const [expanded, setExpanded] = useState(false);

  const severityLevel =
    finding.severity.toUpperCase() === "HIGH"
      ? "HIGH"
      : finding.severity.toUpperCase() === "MEDIUM"
      ? "MEDIUM"
      : "LOW";

  const lineRange =
    finding.line_start !== null && finding.line_start !== undefined
      ? finding.line_end && finding.line_end !== finding.line_start
        ? `L${finding.line_start}–L${finding.line_end}`
        : `L${finding.line_start}`
      : null;

  return (
    <div className="p-4 sm:p-5 rounded-[12px] bg-white border border-[#F0DCE2] shadow-[0_1px_2px_rgba(30,26,28,0.04)] space-y-3">
      {/* Finding Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <Badge level={severityLevel}>{severityLevel}</Badge>
          <span className="font-mono text-xs font-bold text-[#1E1A1C] tracking-wide">
            {finding.rule_id}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-[#6E6268]">
          {lineRange && (
            <span className="px-2 py-0.5 rounded bg-[#FAF4F6] border border-[#F0DCE2] text-[#B8556B]">
              {lineRange}
            </span>
          )}
          <span className="text-[11px]">Weight: {finding.weight}</span>
        </div>
      </div>

      {/* Message (Rendered strictly as plain text) */}
      <p className="text-sm text-[#1E1A1C] leading-relaxed">
        {finding.message}
      </p>

      {/* Expandable Evidence Block in JetBrains Mono */}
      {finding.evidence && (
        <div className="pt-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#B8556B] hover:text-[#A2485C] transition-colors cursor-pointer"
            aria-expanded={expanded}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{expanded ? "Collapse AST Evidence" : "Inspect Raw Evidence"}</span>
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {expanded && (
            <div className="mt-2.5 rounded-xl bg-[#FAF4F6] border border-[#F0DCE2] p-4 overflow-x-auto">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F0DCE2] text-[10px] font-mono text-[#6E6268]">
                <span>AST Evidence Capture</span>
                <span>Plain text snippet</span>
              </div>
              <pre className="font-mono text-xs text-[#1E1A1C] whitespace-pre-wrap leading-relaxed select-text">
                {finding.evidence}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
