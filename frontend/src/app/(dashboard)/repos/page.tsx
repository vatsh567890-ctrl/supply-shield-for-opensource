"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  FolderGit2,
  LayoutGrid,
  List,
  Search,
  ArrowRight,
  Clock,
  GitBranch,
  Radar,
} from "lucide-react";
import { fetchRepos } from "@/lib/api/endpoints";
import { filterRepos } from "@/lib/repos";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Sparkline } from "@/components/charts/Sparkline";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { formatRelativeTime } from "@/lib/format";

export default function ReposPage() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");

  const { data: repos = [], isLoading } = useQuery({
    queryKey: ["repos"],
    queryFn: fetchRepos,
  });

  const filteredRepos = filterRepos(repos, search, levelFilter);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF4F6] border border-[#F0DCE2] text-[#B8556B] text-xs font-mono mb-2">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Repository Perimeter</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-[#1E1A1C] tracking-tight">
            Monitored Repositories
          </h1>
          <p className="text-sm text-[#6E6268] mt-1">
            Active repositories guarded by SupplyShield pre-merge webhooks.
          </p>
        </div>

        <Link href="/scan">
          <Button variant="glow" size="md">
            <Radar className="w-4 h-4 mr-2" />
            <span>Scan PR</span>
          </Button>
        </Link>
      </div>

      {/* Control Bar: Search, Level Filters, Grid/Table Toggle */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#F0DCE2] shadow-[0_1px_2px_rgba(30,26,28,0.04)]">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6E6268] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by repository or owner..."
            className="pl-10 text-xs py-2"
          />
        </div>

        {/* Level Filters & Layout Toggle */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3">
          {/* Level Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#FAF4F6] border border-[#F0DCE2]">
            {["ALL", "HIGH", "MEDIUM", "LOW"].map((level) => {
              const active = levelFilter === level;
              return (
                <button
                  key={level}
                  onClick={() => setLevelFilter(level)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                    active
                      ? "bg-white text-[#B8556B] border border-[#F0DCE2] shadow-sm"
                      : "text-[#6E6268] hover:text-[#1E1A1C]"
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>

          {/* Grid vs Table Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#FAF4F6] border border-[#F0DCE2]">
            <button
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-[#B8556B] border border-[#F0DCE2] shadow-sm"
                  : "text-[#6E6268] hover:text-[#1E1A1C]"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              aria-label="Table view"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-[#B8556B] border border-[#F0DCE2] shadow-sm"
                  : "text-[#6E6268] hover:text-[#1E1A1C]"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering: Loading / Empty / Grid / Table */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : filteredRepos.length === 0 ? (
        <EmptyState
          title="No repositories match criteria"
          description="Adjust your search term or risk filter to view monitored repositories."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearch("");
                setLevelFilter("ALL");
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepos.map((repo) => {
            const riskLevel = (repo.latest_level as "LOW" | "MEDIUM" | "HIGH") || "LOW";
            return (
              <Link
                key={repo.id}
                href={`/repos/${repo.owner}/${repo.name}`}
                className="block group"
              >
                <SpotlightCard className="h-full flex flex-col justify-between p-6">
                  <div>
                    {/* Header: Name and Branch */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[11px] font-mono text-[#6E6268] block">
                          {repo.owner}
                        </span>
                        <h3 className="font-display text-lg font-bold text-[#1E1A1C] group-hover:text-[#B8556B] transition-colors truncate">
                          {repo.name}
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-[#FAF4F6] border border-[#F0DCE2] text-[10px] font-mono text-[#6E6268] flex items-center gap-1 shrink-0">
                        <GitBranch className="w-3 h-3" />
                        {repo.default_branch}
                      </span>
                    </div>

                    {/* Risk Badge and Score */}
                    <div className="flex items-center justify-between mt-4 py-2 border-y border-[#F0DCE2]">
                      <Badge level={riskLevel}>{riskLevel} RISK</Badge>
                      <span className="font-display text-base font-extrabold text-[#1E1A1C]">
                        {repo.latest_score !== null ? `${repo.latest_score}/100` : "No score"}
                      </span>
                    </div>
                  </div>

                  {/* Sparkline & Last Analyzed Footer */}
                  <div className="pt-4 mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#6E6268] block">
                        Recent 7-Day Trend
                      </span>
                      <Sparkline
                        level={repo.latest_level}
                        data={
                          repo.latest_level === "HIGH"
                            ? [12, 18, 14, 25, 40, 68, 92]
                            : repo.latest_level === "MEDIUM"
                            ? [10, 15, 20, 24, 30, 48, 54]
                            : [10, 12, 14, 11, 16, 15, 18]
                        }
                      />
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-[#6E6268] block">
                        Last Analyzed
                      </span>
                      <span className="text-xs text-[#6E6268] flex items-center gap-1 justify-end font-mono">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(repo.last_analyzed_at)}
                      </span>
                    </div>
                  </div>
                </SpotlightCard>
              </Link>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Repository</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Latest Score</TableHead>
              <TableHead>7-Day Trend</TableHead>
              <TableHead>Last Analyzed</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {filteredRepos.map((repo) => {
              const riskLevel = (repo.latest_level as "LOW" | "MEDIUM" | "HIGH") || "LOW";
              return (
                <TableRow key={repo.id}>
                  <TableCell>
                    <Link
                      href={`/repos/${repo.owner}/${repo.name}`}
                      className="group font-medium text-[#1E1A1C] hover:text-[#B8556B] transition-colors"
                    >
                      <span className="text-xs text-[#6E6268] block font-mono">
                        {repo.owner} /
                      </span>
                      <span className="text-sm font-bold font-display">
                        {repo.name}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge level={riskLevel}>{riskLevel}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-display font-bold text-[#1E1A1C] text-sm">
                      {repo.latest_score !== null ? `${repo.latest_score}/100` : "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Sparkline
                      level={repo.latest_level}
                      data={
                        repo.latest_level === "HIGH"
                          ? [12, 18, 14, 25, 40, 68, 92]
                          : repo.latest_level === "MEDIUM"
                          ? [10, 15, 20, 24, 30, 48, 54]
                          : [10, 12, 14, 11, 16, 15, 18]
                      }
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#6E6268]">
                    {formatRelativeTime(repo.last_analyzed_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/repos/${repo.owner}/${repo.name}`}>
                      <Button variant="ghost" size="sm">
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}
