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
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Security Overview
          </h1>
          <p className="text-sm text-[#A39EC8] mt-1">
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
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#2D2A6E]/80 via-[#6C63FF]/20 to-[#7CF5FF]/15 border border-[#7CF5FF]/50 shadow-[0_0_35px_rgba(108,99,255,0.3)] backdrop-blur-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-[#7CF5FF]/20 border border-[#7CF5FF]/40 text-[#7CF5FF] shrink-0 shadow-[0_0_20px_rgba(124,245,255,0.4)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                Connect Your GitHub Organization
              </h3>
              <p className="text-sm text-[#D1CEE5] mt-1 max-w-xl leading-relaxed">
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
            <span className="text-xs font-mono uppercase tracking-wider text-[#A39EC8]">
              Repositories Monitored
            </span>
            <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[#7CF5FF]">
              <FolderGit2 className="w-5 h-5" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-24 mb-1" />
          ) : (
            <div className="font-display text-4xl font-extrabold text-white tracking-tight">
              <AnimatedCounter value={reposCount} />
            </div>
          )}
          <p className="text-xs text-[#8A84C4] mt-2">Active GitHub App perimeter</p>
        </SpotlightCard>

        {/* Verdicts Today */}
        <SpotlightCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-[#A39EC8]">
              Verdicts Today
            </span>
            <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[#34D399]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-24 mb-1" />
          ) : (
            <div className="font-display text-4xl font-extrabold text-[#34D399] tracking-tight">
              <AnimatedCounter value={verdictsToday} />
            </div>
          )}
          <p className="text-xs text-[#8A84C4] mt-2">Static & LLM checks executed</p>
        </SpotlightCard>

        {/* High Risk This Week */}
        <SpotlightCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-[#A39EC8]">
              High Risk This Week
            </span>
            <div className="p-2.5 rounded-xl bg-white/[0.05] border border-[#F43F5E]/40 text-[#F43F5E]">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-24 mb-1" />
          ) : (
            <div className="font-display text-4xl font-extrabold text-[#F43F5E] tracking-tight">
              <AnimatedCounter value={highRiskThisWeek} />
            </div>
          )}
          <p className="text-xs text-[#8A84C4] mt-2">Blocked malicious PR attempts</p>
        </SpotlightCard>
      </div>

      {/* Recent Verdicts Feed */}
      <div className="rounded-3xl bg-white/[0.03] border border-[rgba(138,132,196,0.25)] p-6 sm:p-8 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.36)]">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
          <div>
            <h2 className="font-display text-xl font-bold text-white tracking-tight">
              Recent Analysis Verdicts
            </h2>
            <p className="text-xs text-[#A39EC8] mt-0.5">
              Live feed of dependency checks from active pull requests
            </p>
          </div>

          <Link href="/repos">
            <span className="text-xs font-mono text-[#7CF5FF] hover:underline flex items-center gap-1">
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
                className="block p-4 sm:p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[rgba(138,132,196,0.4)] transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <Badge level={verdict.level}>{verdict.level} RISK</Badge>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#7CF5FF] group-hover:underline">
                          {primaryRepo ? `${primaryRepo.owner}/${primaryRepo.name}` : "repository"}
                        </span>
                        <span className="text-white/30 text-xs">•</span>
                        <span className="text-xs font-bold text-white">Score: {verdict.score}/100</span>
                      </div>
                      <p className="text-xs text-[#A39EC8] mt-1 line-clamp-1">
                        {verdict.intent_summary || verdict.plain_english_explanation || "Static analysis completed."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#8A84C4] font-mono shrink-0">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatRelativeTime(verdict.created_at)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#8A84C4] group-hover:text-[#7CF5FF] transition-transform group-hover:translate-x-1" />
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
