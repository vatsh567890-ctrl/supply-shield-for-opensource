"use client";

import { use, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  ArrowRight,
  Radar,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import { fetchRepoTrends, fetchRepoVerdicts } from "@/lib/api/endpoints";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { formatRelativeTime } from "@/lib/format";

// Dynamic import for chart with SSR disabled to prevent layout shift & hydration mismatch
const TrendAreaChart = dynamic(
  () => import("@/components/charts/TrendAreaChart"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-72 w-full rounded-2xl" />,
  }
);

export default function RepoDetailPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = use(params);

  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [displayLimit, setDisplayLimit] = useState<number>(5);

  // Fetch 30-day trends
  const { data: trendsData, isLoading: loadingTrends } = useQuery({
    queryKey: ["repoTrends", owner, repo, 30],
    queryFn: () => fetchRepoTrends(owner, repo, 30),
  });

  // Fetch repository verdicts
  const { data: verdicts = [], isLoading: loadingVerdicts } = useQuery({
    queryKey: ["repoVerdicts", owner, repo],
    queryFn: () => fetchRepoVerdicts(owner, repo),
  });

  const isLoading = loadingTrends || loadingVerdicts;

  // Filter verdicts by risk level
  const filteredVerdicts = verdicts.filter((v) => {
    if (levelFilter === "ALL") return true;
    return v.level.toUpperCase() === levelFilter.toUpperCase();
  });

  // Paginated slice
  const paginatedVerdicts = filteredVerdicts.slice(0, displayLimit);
  const hasMore = displayLimit < filteredVerdicts.length;

  const handleLoadMore = () => {
    setDisplayLimit((prev) => prev + 5);
  };

  // Last 30 points for chart
  const chartPoints = trendsData?.trends.slice(-30) || [];

  return (
    <div className="space-y-8">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/repos"
          className="inline-flex items-center gap-1.5 text-xs text-[#8A84C4] hover:text-[#7CF5FF] transition-colors mb-3 font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Repositories</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#8A84C4]">{owner} /</span>
              <span className="px-2 py-0.5 rounded-full bg-[#34D399]/15 border border-[#34D399]/30 text-[#34D399] text-[10px] font-mono">
                Active Check Runs
              </span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-white tracking-tight mt-0.5">
              {repo}
            </h1>
            <p className="text-sm text-[#A39EC8] mt-1">
              Historical verdicts, taint analysis logs, and 30-day supply chain risk trends.
            </p>
          </div>

          <Link href="/scan">
            <Button variant="glow" size="md">
              <Radar className="w-4 h-4 mr-2" />
              <span>Scan a PR</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 30-Day Trend Chart Card */}
      <SpotlightCard className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#2D2A6E] border border-[#6C63FF]/40 text-[#7CF5FF]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                30-Day Risk Trajectory
              </h2>
              <span className="text-xs text-[#8A84C4]">
                Daily peak threat score calculated from dependency manifests
              </span>
            </div>
          </div>
          <span className="text-xs font-mono text-[#7CF5FF]">Daily Ingestion</span>
        </div>

        {isLoading ? (
          <Skeleton className="h-72 w-full rounded-2xl" />
        ) : chartPoints.length > 0 ? (
          <TrendAreaChart data={chartPoints} />
        ) : (
          <div className="h-48 flex items-center justify-center text-xs text-[#8A84C4]">
            No telemetry recorded in the last 30 days.
          </div>
        )}
      </SpotlightCard>

      {/* Verdict History Table */}
      <div className="space-y-4">
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-white tracking-tight">
              Verdict History
            </h2>
            <p className="text-xs text-[#A39EC8] mt-0.5">
              Pull request evaluations and automated status decisions
            </p>
          </div>

          {/* Level Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] shrink-0">
            {["ALL", "HIGH", "MEDIUM", "LOW"].map((level) => {
              const active = levelFilter === level;
              return (
                <button
                  key={level}
                  onClick={() => {
                    setLevelFilter(level);
                    setDisplayLimit(5);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                    active
                      ? "bg-[#2D2A6E] text-[#7CF5FF] border border-[#6C63FF]/50 shadow-sm"
                      : "text-[#8A84C4] hover:text-white"
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        ) : filteredVerdicts.length === 0 ? (
          <EmptyState
            title="No verdicts found"
            description="No pull request scans have been recorded matching the active filter criteria."
            action={
              <Link href="/scan">
                <Button variant="glow" size="sm">
                  Scan a PR
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Summary / Intent</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {paginatedVerdicts.map((verdict) => (
                  <TableRow key={verdict.id}>
                    <TableCell>
                      <Badge level={verdict.level}>{verdict.level}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-display font-bold text-white text-sm">
                        {verdict.score}/100
                      </span>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-xs text-[#D1CEE5] line-clamp-2 leading-relaxed">
                        {verdict.intent_summary ||
                          verdict.plain_english_explanation ||
                          "Static rules completed successfully."}
                      </p>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#A39EC8]">
                      {formatRelativeTime(verdict.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/verdicts/${verdict.id}`}>
                        <Button variant="ghost" size="sm">
                          <span>Inspect</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>

            {/* Load More Pagination */}
            {hasMore && (
              <div className="text-center pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLoadMore}
                  className="inline-flex items-center gap-1.5"
                >
                  <ChevronDown className="w-4 h-4" />
                  <span>Load More Verdicts</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
