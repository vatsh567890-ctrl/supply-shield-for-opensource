"use client";

import React, { useEffect, useState } from "react";
import { GitPullRequest, Terminal, AlertOctagon } from "lucide-react";
import { RiskGauge } from "../verdict/RiskGauge";
import { Badge } from "../ui/Badge";

const LOG_LINES = [
  { text: "Triggered analysis for PR #142: chore(deps): bump telemetry-core", delay: 400 },
  { text: "Extracted 2 modified files (package.json, setup.js)", delay: 900 },
  { text: "Static rule INSTALL_SCRIPT_NETWORK flagged postinstall hook", delay: 1500, warn: true },
  { text: "Static rule ENV_SECRET_READ flagged access to AWS_SECRET_ACCESS_KEY", delay: 2100, warn: true },
  { text: "LLM triage: Corroborated credential exfiltration to *.invalid domain", delay: 2800, warn: true },
  { text: "Verdict compiled: Score 92/100 (HIGH). GitHub status: FAILURE", delay: 3400, crit: true },
];

export const ScanDemo: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showVerdict, setShowVerdict] = useState(false);

  useEffect(() => {
    // If reduced motion is requested, show final state immediately
    if (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function"
    ) {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) {
        setCurrentStep(LOG_LINES.length);
        setShowVerdict(true);
        return;
      }
    }

    let isMounted = true;

    const runLoop = async () => {
      while (isMounted) {
        // Reset state
        setCurrentStep(0);
        setShowVerdict(false);

        // Stream terminal log lines
        for (let i = 0; i < LOG_LINES.length; i++) {
          if (!isMounted) return;
          await new Promise((res) => setTimeout(res, 600));
          if (!isMounted) return;
          setCurrentStep(i + 1);
        }

        // Show final verdict and gauge sweep
        await new Promise((res) => setTimeout(res, 500));
        if (!isMounted) return;
        setShowVerdict(true);

        // Pause on completed blocked verdict for 5.5 seconds
        await new Promise((res) => setTimeout(res, 5500));
      }
    };

    runLoop();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      className={`rounded-[12px] bg-white border border-[#F0DCE2] shadow-[0_1px_2px_rgba(30,26,28,0.04)] overflow-hidden ${className}`}
    >
      {/* PR Card Header */}
      <div className="px-6 py-4 border-b border-[#F0DCE2] bg-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#FAF4F6] border border-[#F0DCE2] text-[#B8556B]">
            <GitPullRequest className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#6E6268]">acme-corp/cloud-infra-orchestrator</span>
              <span className="text-[#6E6268] font-mono text-xs">#142</span>
            </div>
            <p className="text-sm font-semibold text-[#1E1A1C] mt-0.5">
              chore(deps): upgrade dependencies & telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showVerdict ? (
            <Badge level="HIGH">Merge blocked</Badge>
          ) : (
            <Badge level="LIVE">Scanning active</Badge>
          )}
        </div>
      </div>

      {/* Main Body: Terminal Stream & Verdict Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-[#F0DCE2]">
        {/* Terminal log stream (Left 7 cols) */}
        <div className="lg:col-span-7 p-5 sm:p-6 bg-[#FAF4F6]/50 font-mono text-xs flex flex-col justify-between min-h-[280px]">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#F0DCE2] text-[#6E6268]">
              <Terminal className="w-4 h-4 text-[#B8556B]" />
              <span className="text-[11px] uppercase tracking-wider">Analysis Stream (Worker: runner-04)</span>
            </div>

            <div className="space-y-2.5">
              {LOG_LINES.slice(0, currentStep).map((line, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 leading-relaxed animate-in fade-in slide-in-from-left-2 duration-300 ${
                    line.crit
                      ? "text-[#A3213F] font-semibold"
                      : line.warn
                      ? "text-[#9A6410]"
                      : "text-[#1E1A1C]"
                  }`}
                >
                  <span className="text-[#6E6268] select-none shrink-0 font-mono">
                    {`00:${(idx * 2 + 1).toString().padStart(2, "0")}`}
                  </span>
                  <span className="break-all">{line.text}</span>
                </div>
              ))}

              {currentStep < LOG_LINES.length && (
                <div className="flex items-center gap-2 text-[#B8556B] pt-1">
                  <span className="w-2 h-2 rounded-full bg-[#B8556B] animate-live-pulse" />
                  <span className="text-[11px] animate-pulse">Running static rules & taint analysis...</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0DCE2] flex items-center justify-between text-[11px] text-[#6E6268]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D5B]" />
              Zero code execution sandbox
            </span>
            <span>SHA: e3b0c44...</span>
          </div>
        </div>

        {/* Verdict & Gauge Result (Right 5 cols) */}
        <div className="lg:col-span-5 p-6 bg-white flex flex-col items-center justify-center text-center">
          {showVerdict ? (
            <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
              <RiskGauge score={92} level="HIGH" size={170} />

              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A3213F]/15 border border-[#A3213F]/40 text-[#A3213F] text-xs font-bold">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  Merge blocked by SupplyShield
                </div>
                <p className="text-xs text-[#6E6268] mt-2 max-w-[220px]">
                  Postinstall script credential theft attempt detected
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center">
              <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-[#B8556B]/30 flex items-center justify-center animate-spin" style={{ animationDuration: "14s" }}>
                <div className="w-24 h-24 rounded-full border-2 border-[#B8556B] border-t-transparent animate-spin" style={{ animationDuration: "2s" }} />
              </div>
              <div className="mt-4 text-center">
                <p className="text-xs font-mono uppercase tracking-widest text-[#B8556B]">
                  Aggregating Risk Scores
                </p>
                <p className="text-xs text-[#6E6268] mt-1">Analyzing dependencies...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
