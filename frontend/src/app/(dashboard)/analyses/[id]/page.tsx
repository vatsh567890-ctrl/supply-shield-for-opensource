"use client";

import { use } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { AnalysisProgress } from "@/components/scan/AnalysisProgress";
import { useAnalysisPolling } from "@/hooks/useAnalysisPolling";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function AnalysisProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const isValidUuid = UUID_REGEX.test(id);

  const {
    data: analysis,
    isTimedOut,
    timeoutMessage,
  } = useAnalysisPolling(isValidUuid ? id : "");

  if (!isValidUuid) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div
          role="alert"
          className="p-8 rounded-[12px] bg-white border border-[#F0DCE2] shadow-[0_1px_2px_rgba(30,26,28,0.04)] text-center space-y-4"
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-[#A3213F]/10 flex items-center justify-center text-[#A3213F]">
            <AlertCircle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-medium text-[#1E1A1C]">
              Invalid Analysis ID
            </h2>
            <p className="text-sm text-[#6E6268] max-w-md mx-auto">
              The provided analysis identifier is not a valid UUID format:{" "}
              <code className="font-mono text-xs text-[#1E1A1C] bg-[#FAF4F6] px-1.5 py-0.5 rounded">
                {id}
              </code>
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/scan"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-[12px] bg-[#B8556B] hover:bg-[#A2485C] text-white shadow-[0_1px_2px_rgba(30,26,28,0.04)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Return to Scan</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Header Info */}
      <div className="space-y-1">
        <h1 className="text-3xl font-medium text-[#1E1A1C] tracking-tight">
          Analysis in Progress
        </h1>
        <p className="text-base text-[#6E6268]">
          Verifying package manifests, parsing diffs, and evaluating security heuristics.
        </p>
      </div>

      <AnalysisProgress
        analysis={analysis}
        isTimedOut={isTimedOut}
        timeoutMessage={timeoutMessage}
      />
    </div>
  );
}
