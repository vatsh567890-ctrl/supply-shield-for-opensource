import React from "react";
import Link from "next/link";
import { Table } from "@/components/ui/Table";
import { VerdictBadge } from "@/components/verdict/VerdictBadge";
import { RepoSummaryResponse } from "@/lib/schemas/repos";
import { formatDate } from "@/lib/format";

export const RepoTable: React.FC<{ repos: RepoSummaryResponse[] }> = ({
  repos,
}) => {
  return (
    <Table>
      <thead>
        <tr className="border-b border-[#F0DCE2] text-[#6E6268] font-semibold text-xs uppercase bg-[#FAF4F6]">
          <th className="py-3 px-4">Repository</th>
          <th className="py-3 px-4">Latest Risk</th>
          <th className="py-3 px-4">Score</th>
          <th className="py-3 px-4">Last Analyzed</th>
          <th className="py-3 px-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {repos.map((r) => (
          <tr key={r.id} className="border-b border-[#F0DCE2] hover:bg-[#FAF4F6] transition-colors">
            <td className="py-3 px-4 font-medium text-[#1E1A1C]">
              {r.owner}/{r.name}
            </td>
            <td className="py-3 px-4">
              {r.latest_level ? (
                <VerdictBadge level={r.latest_level as "LOW" | "MEDIUM" | "HIGH"} />
              ) : (
                <span className="text-[#6E6268] text-xs">No scans</span>
              )}
            </td>
            <td className="py-3 px-4 font-mono font-medium text-[#1E1A1C]">
              {r.latest_score !== null ? r.latest_score : "—"}
            </td>
            <td className="py-3 px-4 text-[#6E6268] text-xs">
              {r.last_analyzed_at ? formatDate(r.last_analyzed_at) : "Never"}
            </td>
            <td className="py-3 px-4 text-right">
              <Link
                href={`/repos/${r.owner}/${r.name}`}
                className="text-xs text-[#B8556B] font-semibold hover:underline"
              >
                View History
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
