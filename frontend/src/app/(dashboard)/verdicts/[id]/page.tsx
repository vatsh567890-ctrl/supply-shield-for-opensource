"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ExternalLink,
  Lock,
  GitPullRequest,
} from "lucide-react";
import { fetchVerdict, createOverride } from "@/lib/api/endpoints";
import { VerdictDetailResponse, OverrideResponse } from "@/lib/schemas/verdicts";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { RiskGauge } from "@/components/verdict/RiskGauge";
import { FloorCallout } from "@/components/verdict/FloorCallout";
import { AiSummaryCard } from "@/components/verdict/AiSummaryCard";
import { FindingList } from "@/components/verdict/FindingList";
import { NetworkHostsPanel } from "@/components/verdict/NetworkHostsPanel";
import { DiffPreview } from "@/components/verdict/DiffPreview";
import { OverrideDialog } from "@/components/verdict/OverrideDialog";
import { OverrideHistory } from "@/components/verdict/OverrideHistory";
import { useToast } from "@/components/ui/Toast";
import { formatRelativeTime } from "@/lib/format";

export default function VerdictDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [overrideOpen, setOverrideOpen] = useState(false);

  const {
    data: verdict,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["verdict", id],
    queryFn: () => fetchVerdict(id),
  });

  // Optimistic override mutation with rollback on error
  const overrideMutation = useMutation({
    mutationFn: ({
      action,
      reason,
    }: {
      action: "accept" | "reject";
      reason: string;
    }) => createOverride(id, action, reason),
    onMutate: async ({ action, reason }) => {
      await queryClient.cancelQueries({ queryKey: ["verdict", id] });
      const previousVerdict = queryClient.getQueryData<VerdictDetailResponse>([
        "verdict",
        id,
      ]);

      if (previousVerdict) {
        const optimisticOverride: OverrideResponse = {
          id: `temp-${Date.now()}`,
          verdict_id: id,
          user_id: "00000000-0000-4000-8000-000000000001",
          user_login: "sec-ops-lead",
          action,
          reason,
          created_at: new Date().toISOString(),
        };

        queryClient.setQueryData<VerdictDetailResponse>(["verdict", id], {
          ...previousVerdict,
          overrides: [optimisticOverride, ...previousVerdict.overrides],
        });
      }

      return { previousVerdict };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousVerdict) {
        queryClient.setQueryData(["verdict", id], context.previousVerdict);
      }
      toast({
        type: "error",
        title: "Override Submission Failed",
        message: "Failed to persist override decision. Rolling back timeline.",
      });
    },
    onSuccess: () => {
      toast({
        type: "success",
        title: "Override Recorded",
        message: "Security override decision committed and check runs updated.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["verdict", id] });
    },
  });

  // Loading Skeleton matching final layout
  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <Skeleton className="h-6 w-36 rounded-lg" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-72 rounded-xl" />
          <Skeleton className="h-10 w-44 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-5 h-80 rounded-2xl" />
          <Skeleton className="lg:col-span-7 h-80 rounded-2xl" />
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  // Error State with error code
  if (isError || !verdict) {
    return (
      <div className="py-12">
        <ErrorState
          title="Verdict Retrieval Failure"
          message={
            error instanceof Error
              ? error.message
              : "Unable to retrieve threat assessment verdict. Analysis ID may be invalid."
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/overview"
          className="inline-flex items-center gap-1.5 text-xs text-[#8A84C4] hover:text-[#7CF5FF] transition-colors mb-3 font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#8A84C4]">
                Verdict ID: {id}
              </span>
              <span className="text-white/30">•</span>
              <span className="text-xs font-mono text-[#7CF5FF]">
                {formatRelativeTime(verdict.created_at)}
              </span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-white tracking-tight mt-0.5">
              Threat Assessment & Verdict Details
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {verdict.pr_url && (
              <a
                href={verdict.pr_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" size="md">
                  <GitPullRequest className="w-4 h-4 mr-2 text-[#7CF5FF]" />
                  <span>View on GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-70" />
                </Button>
              </a>
            )}

            <Button
              variant="glow"
              size="md"
              onClick={() => setOverrideOpen(true)}
            >
              <Lock className="w-4 h-4 mr-2" />
              <span>Override Decision</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Row: RiskGauge & Scoring Breakdown (5 cols) + AiSummaryCard (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: RiskGauge Hero Card */}
        <div className="lg:col-span-5">
          <SpotlightCard className="h-full flex flex-col justify-between p-6 sm:p-8">
            <div className="flex flex-col items-center">
              <RiskGauge
                score={verdict.score}
                level={verdict.level}
                size={200}
              />

              {/* Badges Row */}
              <div className="flex items-center gap-2.5 mt-5">
                <Badge level={verdict.level}>{verdict.level} TIER</Badge>
                <span
                  data-testid="hero-ai-status-badge"
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-medium border backdrop-blur-md ${
                    verdict.ai_status === "ok"
                      ? "bg-[#7CF5FF]/15 text-[#7CF5FF] border-[#7CF5FF]/40 shadow-[0_0_12px_rgba(124,245,255,0.2)]"
                      : verdict.ai_status === "disabled"
                      ? "bg-white/[0.06] text-[#A39EC8] border-[rgba(138,132,196,0.3)]"
                      : "bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/40 shadow-[0_0_12px_rgba(251,191,36,0.2)]"
                  }`}
                >
                  {verdict.ai_status === "ok"
                    ? "AI summary"
                    : verdict.ai_status === "disabled"
                    ? "Rule-based summary"
                    : "AI unavailable"}
                </span>
              </div>

              {/* Breakdown metrics */}
              <div className="w-full mt-6 pt-6 border-t border-white/[0.08] space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between text-[#A39EC8]">
                  <span>Static AST Score:</span>
                  <span className="text-white font-bold">
                    {verdict.rule_score}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#A39EC8]">
                  <span>LLM Adjustment:</span>
                  <span className="text-[#7CF5FF] font-bold">
                    {verdict.llm_adjustment >= 0
                      ? `+${verdict.llm_adjustment}`
                      : verdict.llm_adjustment}
                  </span>
                </div>
                {verdict.floor_applied !== null &&
                  verdict.floor_applied !== undefined && (
                    <div className="flex items-center justify-between text-[#A39EC8]">
                      <span>Floor Baseline:</span>
                      <span className="text-[#FBBF24] font-bold">
                        {verdict.floor_applied}
                      </span>
                    </div>
                  )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-[#8A84C4] text-center">
              Deterministic AST Rules • Taint Analysis Verification
            </div>
          </SpotlightCard>
        </div>

        {/* Right: AI Summary Card with Intent Summary */}
        <div className="lg:col-span-7">
          <AiSummaryCard
            aiStatus={verdict.ai_status}
            intentSummary={verdict.intent_summary}
            plainEnglishExplanation={verdict.plain_english_explanation}
          />
        </div>
      </div>

      {/* Deterministic Floor Callout */}
      {verdict.floor_applied !== null &&
        verdict.floor_applied !== undefined && (
          <FloorCallout floorApplied={verdict.floor_applied} />
        )}

      {/* Outbound Network Hosts Panel */}
      <NetworkHostsPanel hosts={verdict.network_hosts || []} />

      {/* Changed Files Diff Preview */}
      {verdict.diff_files && verdict.diff_files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-white tracking-tight">
              Package Diff Inspection
            </h2>
            <span className="text-xs font-mono text-[#8A84C4]">
              {verdict.diff_files.length} Modified File
              {verdict.diff_files.length !== 1 ? "s" : ""}
            </span>
          </div>
          <DiffPreview files={verdict.diff_files} />
        </div>
      )}

      {/* Grouped Findings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-white tracking-tight">
              Security Findings & AST Evidence
            </h2>
            <p className="text-xs text-[#A39EC8] mt-0.5">
              Code references grouped by dependency package and target file
            </p>
          </div>
          <span className="text-xs font-mono text-[#8A84C4]">
            {verdict.findings.length} Finding
            {verdict.findings.length !== 1 ? "s" : ""}
          </span>
        </div>

        <FindingList findings={verdict.findings} />
      </div>

      {/* Override History Section */}
      <div className="space-y-4 pt-6 border-t border-white/[0.08]">
        <div>
          <h2 className="font-display text-xl font-bold text-white tracking-tight">
            Security Override History
          </h2>
          <p className="text-xs text-[#A39EC8] mt-0.5">
            Audit log of manual clearances and confirmed blocks
          </p>
        </div>

        <OverrideHistory overrides={verdict.overrides || []} />
      </div>

      {/* Override Submission Dialog */}
      <OverrideDialog
        open={overrideOpen}
        onClose={() => setOverrideOpen(false)}
        onSubmit={async (action, reason) => {
          await overrideMutation.mutateAsync({ action, reason });
        }}
      />
    </div>
  );
}
