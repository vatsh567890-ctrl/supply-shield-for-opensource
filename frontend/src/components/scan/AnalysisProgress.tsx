"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Circle, Loader2, Check, X, ArrowRight, RotateCcw, AlertTriangle } from "lucide-react";
import { AnalysisStatusResponse } from "@/lib/schemas/analyses";

export const ANALYSIS_STEPS = [
  { id: "queued", label: "Queued" },
  { id: "fetching_pr", label: "Fetching PR" },
  { id: "resolving_versions", label: "Resolving versions" },
  { id: "downloading_packages", label: "Downloading packages" },
  { id: "analyzing", label: "Analyzing" },
  { id: "checking_advisories", label: "Checking advisories" },
  { id: "ai_review", label: "AI review" },
  { id: "publishing", label: "Publishing" },
] as const;

export type StepState = "pending" | "active" | "done" | "failed";

export function getStepIndex(stepIdentifier?: string | null): number {
  if (!stepIdentifier) return -1;
  const normalized = stepIdentifier.toLowerCase().replace(/[\s-]/g, "_");
  return ANALYSIS_STEPS.findIndex(
    (s) =>
      s.id === normalized ||
      s.label.toLowerCase() === stepIdentifier.toLowerCase()
  );
}

export function computeStepStates(
  status: "queued" | "running" | "succeeded" | "failed" | "superseded",
  currentStep?: string | null
): StepState[] {
  if (status === "succeeded") {
    return ANALYSIS_STEPS.map(() => "done");
  }

  if (status === "queued") {
    return ANALYSIS_STEPS.map((_, idx) => (idx === 0 ? "active" : "pending"));
  }

  if (status === "failed") {
    const activeIdx = getStepIndex(currentStep);
    const failIdx = activeIdx >= 0 ? activeIdx : 4; // default to analyzing if unknown
    return ANALYSIS_STEPS.map((_, idx) => {
      if (idx < failIdx) return "done";
      if (idx === failIdx) return "failed";
      return "pending";
    });
  }

  if (status === "running") {
    const activeIdx = getStepIndex(currentStep);
    const currentIdx = activeIdx >= 0 ? activeIdx : 1; // default to fetching_pr
    return ANALYSIS_STEPS.map((_, idx) => {
      if (idx < currentIdx) return "done";
      if (idx === currentIdx) return "active";
      return "pending";
    });
  }

  // Superseded or unknown
  return ANALYSIS_STEPS.map(() => "pending");
}

export interface AnalysisProgressProps {
  analysis?: AnalysisStatusResponse | null;
  status?: "queued" | "running" | "succeeded" | "failed" | "superseded";
  currentStep?: string | null;
  verdictId?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  isTimedOut?: boolean;
  timeoutMessage?: string | null;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  analysis,
  status: statusProp,
  currentStep: currentStepProp,
  verdictId: verdictIdProp,
  errorCode: errorCodeProp,
  errorMessage: errorMessageProp,
  isTimedOut = false,
  timeoutMessage,
}) => {
  const router = useRouter();

  // Prefer analysis object if provided, fallback to direct props
  const effectiveStatus = analysis?.status || statusProp || "queued";
  const effectiveCurrentStep =
    analysis?.current_step !== undefined ? analysis.current_step : currentStepProp;
  const effectiveVerdictId = analysis?.verdict_id || verdictIdProp;
  const effectiveErrorCode = analysis?.error_code || errorCodeProp;
  const effectiveErrorMessage = analysis?.error_message || errorMessageProp;

  const stepStates = computeStepStates(effectiveStatus, effectiveCurrentStep);

  // Auto-navigate to verdict on succeeded after 1.5 seconds
  useEffect(() => {
    if (effectiveStatus === "succeeded" && effectiveVerdictId) {
      const timer = setTimeout(() => {
        router.push(`/verdicts/${effectiveVerdictId}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [effectiveStatus, effectiveVerdictId, router]);

  return (
    <div className="space-y-6">
      {/* Failed state: Show neutral card with error code and safe message */}
      {effectiveStatus === "failed" ? (
        <div
          role="alert"
          className="p-8 rounded-[12px] bg-white border border-[#F0DCE2] shadow-[0_1px_2px_rgba(30,26,28,0.04)] text-center space-y-4"
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-[#A3213F]/10 flex items-center justify-center text-[#A3213F]">
            <X className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-medium text-[#1E1A1C]">Analysis Terminated</h3>
            <p className="text-xs font-mono text-[#6E6268]">
              Error Code: {effectiveErrorCode || "GENERIC_FAILURE"}
            </p>
            <p className="text-sm text-[#6E6268] max-w-md mx-auto pt-1 leading-relaxed">
              {effectiveErrorMessage ||
                "The analysis run could not be completed. Please verify the pull request and repository permissions."}
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/scan"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-[12px] bg-white border border-[#F0DCE2] hover:bg-[#FAF4F6] text-[#1E1A1C] shadow-[0_1px_2px_rgba(30,26,28,0.04)] transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2 text-[#6E6268]" />
              <span>Start New Scan</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Standard Vertical Timeline Card */
        <div className="p-6 sm:p-8 rounded-[12px] bg-white border border-[#F0DCE2] shadow-[0_1px_2px_rgba(30,26,28,0.04)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0DCE2]">
            <div>
              <span className="text-xs font-medium text-[#B8556B] uppercase tracking-wider block">
                Verification Pipeline
              </span>
              <h2 className="text-lg font-medium text-[#1E1A1C] mt-0.5">
                {effectiveStatus === "succeeded"
                  ? "Scan Complete"
                  : effectiveStatus === "queued"
                  ? "Scan Queued"
                  : "Analysis in Progress"}
              </h2>
            </div>
            <span
              className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                effectiveStatus === "succeeded"
                  ? "bg-[#2F7D5B]/10 text-[#2F7D5B] border-[#2F7D5B]/30"
                  : "bg-[#B8556B]/10 text-[#B8556B] border-[#B8556B]/30"
              }`}
            >
              {effectiveStatus.toUpperCase()}
            </span>
          </div>

          {/* Vertical Timeline */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-[#F0DCE2]">
            {ANALYSIS_STEPS.map((step, idx) => {
              const state = stepStates[idx];
              const isDone = state === "done";
              const isActive = state === "active";
              const isFailed = state === "failed";
              const isPending = state === "pending";

              return (
                <div
                  key={step.id}
                  data-testid={`timeline-step-${step.id}`}
                  data-status={state}
                  className="relative flex items-center gap-4 group"
                >
                  {/* Step Icon */}
                  <div
                    className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center transition-all bg-white border ${
                      isDone
                        ? "border-[#2F7D5B] text-[#2F7D5B] bg-[#2F7D5B]/10"
                        : isActive
                        ? "border-[#B8556B] text-[#B8556B] bg-[#B8556B]/10 ring-2 ring-[#B8556B]/20"
                        : isFailed
                        ? "border-[#A3213F] text-[#A3213F] bg-[#A3213F]/10"
                        : "border-[#F0DCE2] text-[#6E6268]/40"
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    {isActive && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {isFailed && <X className="w-3.5 h-3.5 stroke-[2.5]" />}
                    {isPending && <Circle className="w-2 h-2 fill-current" />}
                  </div>

                  {/* Step Label */}
                  <div className="pl-4">
                    <span
                      className={`text-sm tracking-normal transition-colors ${
                        isDone
                          ? "text-[#1E1A1C] font-medium"
                          : isActive
                          ? "text-[#B8556B] font-medium"
                          : isFailed
                          ? "text-[#A3213F] font-medium"
                          : "text-[#6E6268]"
                      }`}
                    >
                      {step.label}
                    </span>
                    {isActive && (
                      <span className="block text-xs text-[#6E6268] mt-0.5">
                        In progress...
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Succeeded Actions */}
          {effectiveStatus === "succeeded" && effectiveVerdictId && (
            <div className="pt-4 border-t border-[#F0DCE2] flex items-center justify-between">
              <span className="text-xs text-[#6E6268]">
                Verdict ready. Redirecting automatically...
              </span>
              <Link
                href={`/verdicts/${effectiveVerdictId}`}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-[12px] bg-[#B8556B] hover:bg-[#A2485C] text-white shadow-[0_1px_2px_rgba(30,26,28,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8556B] transition-colors"
              >
                <span>View verdict</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 60s Timeout Notice */}
      {isTimedOut && effectiveStatus !== "succeeded" && effectiveStatus !== "failed" && (
        <div
          role="status"
          className="p-4 rounded-[12px] bg-white border border-[#F0DCE2] text-sm text-[#6E6268] flex items-center justify-between gap-4 shadow-[0_1px_2px_rgba(30,26,28,0.04)]"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#9A6410] shrink-0" />
            <span>
              {timeoutMessage ||
                "Still running. You can leave this page; we will notify you in the PR."}
            </span>
          </div>
          <Link
            href="/scan"
            className="text-xs font-medium text-[#B8556B] hover:underline shrink-0"
          >
            Return to Scan
          </Link>
        </div>
      )}
    </div>
  );
};
