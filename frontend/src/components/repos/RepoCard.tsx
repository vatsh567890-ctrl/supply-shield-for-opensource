import React from "react";
import Link from "next/link";
import { RepoSummaryResponse } from "@/lib/schemas/repos";
import { VerdictBadge } from "@/components/verdict/VerdictBadge";

export const RepoCard: React.FC<{ repo: RepoSummaryResponse }> = ({ repo }) => {
  return (
    <div className="bg-white rounded-xl border border-[#F0DCE2] p-5 shadow-[0_1px_2px_rgba(30,26,28,0.04)] space-y-3">
      <div className="flex items-center justify-between">
        <Link
          href={`/repos/${repo.owner}/${repo.name}`}
          className="font-bold text-[#1E1A1C] hover:text-[#B8556B] transition-colors"
        >
          {repo.owner}/{repo.name}
        </Link>
        {repo.latest_level && (
          <VerdictBadge level={repo.latest_level as "LOW" | "MEDIUM" | "HIGH"} />
        )}
      </div>
      <div className="text-xs text-[#6E6268]">
        Default branch: <span className="font-mono">{repo.default_branch}</span>
      </div>
    </div>
  );
};
