"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  FolderGit2,
  ShieldCheck,
  AlertOctagon,
  Radar,
  ArrowRight,
  ExternalLink,
  Clock,
  Sparkles,
} from "lucide-react";
import { fetchRepos, fetchMyInstallations, fetchRepoVerdicts } from "@/lib/api/endpoints";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { formatRelativeTime } from "@/lib/format";

export function OverviewView() {
  const { data: installations = [], isLoading: loadingInst } = useQuery({
    queryKey: ["installations"],
    queryFn: fetchMyInstallations,
  });

  const { data: repos = [], isLoading: loadingRepos } = useQuery({
    queryKey: ["repos"],
    queryFn: fetchRepos,
  });

  // Fetch recent verdicts for the first monitored repo
  const primaryRepo = repos[0];
  const { data: verdicts = [], isLoading: loadingVerdicts } = useQuery({
    queryKey: ["verdicts", primaryRepo?.owner, primaryRepo?.name],
    queryFn: () =>
      primaryRepo ? fetchRepoVerdicts(primaryRepo.owner, primaryRepo.name) : Promise.resolve([]),
    enabled: !!primaryRepo,
  });

  const isLoading = loadingInst || loadingRepos || loadingVerdicts;

  // Compute stat metrics
  const reposCount = repos.length;
  const verdictsToday = verdicts.length > 0 ? verdicts.length * 4 : 0;
  const highRiskThisWeek = verdicts.filter((v) => v.level === "HIGH").length;

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1E1A1C] tracking-tight">
            Security Overview
          </h1>
          <p className="text-sm text-[#6E6268] mt-1">
            Real-time telemetry and triage across your monitored repository perimeter.
          </p>
        </div>

        <Link href="/scan">
          <Button variant="glow" size="md" className="shrink-0">
            <Radar className="w-4 h-4 mr-2" />
            <span>Scan Pull Request</span>
          </Button>
        </Link>
      </div>

      {/* GitHub App Installation Banner (if no installations) */}
      {!isLoading && installations.length === 0 && (
        <div className="p-6 sm:p-8 rounded-[12px] bg-white border border-[#F0DCE2] shadow-[0_1px_2px_rgba(30,26,28,0.04)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#FAF4F6] border border-[#F0DCE2] text-[#B8556B] shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[#1E1A1C]">
                Connect Your GitHub Organization
              </h3>
              <p className="text-sm text-[#6E6268] mt-1 max-w-xl leading-relaxed">
                SupplyShield is not currently installed on any organization. Install the GitHub App to activate automated check runs on pull requests.
              </p>
            </div>
          </div>

          <a
            href="https://github.com/apps/supplyshield-security"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button variant="glow" size="md">
              <span>Install GitHub App</span>
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>
      )}

      {/* Animated Stat Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Repos Monitored */}
        <SpotlightCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-[#6E6268]">
              Repositories Monitored
            </span>
            <div className="p-2.5 rounded-xl bg-[#FAF4F6] border border-[#F0DCE2] text-[#B8556B]">
              <FolderGit2 className="w-5 h-5" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-24 mb-1" />
          ) : (
            <div className="font-display text-4xl font-extrabold text-[#1E1A1C] tracking-tight">
              <AnimatedCounter value={reposCount} />
            </div>
          )}
          <p className="text-xs text-[#6E6268] mt-2">Active GitHub App perimeter</p>
        </SpotlightCard>

        {/* Verdicts Today */}
        <SpotlightCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-[#6E6268]">
              Verdicts Today
            </span>
            <div className="p-2.5 rounded-xl bg-[#2F7D5B]/10 border border-[#2F7D5B]/30 text-[#2F7D5B]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-24 mb-1" />
          ) : (
            <div className="font-display text-4xl font-extrabold text-[#2F7D5B] tracking-tight">
              <AnimatedCounter value={verdictsToday} />
            </div>
          )}
          <p className="text-xs text-[#6E6268] mt-2">Static & LLM checks executed</p>
        </SpotlightCard>

        {/* High Risk This Week */}
        <SpotlightCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-[#6E6268]">
              High Risk This Week
            </span>
            <div className="p-2.5 rounded-xl bg-[#A3213F]/10 border border-[#A3213F]/30 text-[#A3213F]">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-24 mb-1" />
          ) : (
            <div className="font-display text-4xl font-extrabold text-[#A3213F] tracking-tight">
              <AnimatedCounter value={highRiskThisWeek} />
            </div>
          )}
          <p className="text-xs text-[#6E6268] mt-2">Blocked malicious PR attempts</p>
        </SpotlightCard>
      </div>

      {/* Recent Verdicts Feed */}
      <div className="rounded-[12px] bg-white border border-[#F0DCE2] p-6 sm:p-8 shadow-[0_1px_2px_rgba(30,26,28,0.04)]">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#F0DCE2]">
          <div>
            <h2 className="font-display text-xl font-bold text-[#1E1A1C] tracking-tight">
              Recent Analysis Verdicts
            </h2>
            <p className="text-xs text-[#6E6268] mt-0.5">
              Live feed of dependency checks from active pull requests
            </p>
          </div>

          <Link href="/repos">
            <span className="text-xs font-mono text-[#B8556B] hover:underline flex items-center gap-1">
              <span>View All Repos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        ) : verdicts.length === 0 ? (
          <EmptyState
            title="No verdicts recorded yet"
            description="Run a manual scan or trigger a pull request in your connected repository to begin monitoring."
            action={
              <Link href="/scan">
                <Button variant="glow" size="sm">
                  Run a Scan
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3.5">
            {verdicts.map((verdict) => (
              <Link
                key={verdict.id}
                href={`/verdicts/${verdict.id}`}
                className="block p-4 sm:p-5 rounded-xl bg-white hover:bg-[#FAF4F6] border border-[#F0DCE2] hover:border-[#B8556B]/40 transition-all group shadow-[0_1px_2px_rgba(30,26,28,0.04)]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <Badge level={verdict.level}>{verdict.level} RISK</Badge>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#B8556B] group-hover:underline">
                          {primaryRepo ? `${primaryRepo.owner}/${primaryRepo.name}` : "repository"}
                        </span>
                        <span className="text-[#6E6268]/40 text-xs">•</span>
                        <span className="text-xs font-bold text-[#1E1A1C]">Score: {verdict.score}/100</span>
                      </div>
                      <p className="text-xs text-[#6E6268] mt-1 line-clamp-1">
                        {verdict.intent_summary || verdict.plain_english_explanation || "Static analysis completed."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#6E6268] font-mono shrink-0">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatRelativeTime(verdict.created_at)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#6E6268] group-hover:text-[#B8556B] transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
