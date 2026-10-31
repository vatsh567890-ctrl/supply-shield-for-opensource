import React from "react";
import Link from "next/link";
import { RepoSummaryResponse } from "@/lib/schemas/repos";
import { VerdictBadge } from "@/components/verdict/VerdictBadge";

export const RepoCard: React.FC<{ repo: RepoSummaryResponse }> = ({ repo }) => {
  return (
    <div className="bg-white rounded-xl border border-[#D6D3F0] p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <Link
          href={`/repos/${repo.owner}/${repo.name}`}
          className="font-bold text-[#2D2A6E] hover:underline"
        >
          {repo.owner}/{repo.name}
        </Link>
        {repo.latest_level && (
          <VerdictBadge level={repo.latest_level as "LOW" | "MEDIUM" | "HIGH"} />
        )}
      </div>
      <div className="text-xs text-slate-500">
        Default branch: <span className="font-mono">{repo.default_branch}</span>
      </div>
    </div>
  );
};
