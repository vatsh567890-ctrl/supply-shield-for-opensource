"use client";

import React from "react";
import { motion } from "framer-motion";
import { Package, FileCode, ShieldCheck } from "lucide-react";
import { FindingResponse } from "@/lib/schemas/verdicts";
import { groupFindingsByPackageAndFile } from "@/lib/findings";
import { FindingItem } from "./FindingItem";

export const FindingList: React.FC<{ findings: FindingResponse[] }> = ({
  findings,
}) => {
  if (findings.length === 0) {
    return (
      <div className="p-8 text-center rounded-[12px] bg-[#FAF4F6] border border-[#F0DCE2] text-[#6E6268]">
        <ShieldCheck className="w-8 h-8 text-[#2F7D5B] mx-auto mb-2" />
        <p className="text-sm font-medium text-[#1E1A1C]">No suspicious heuristics identified</p>
        <p className="text-xs text-[#6E6268] mt-1">
          Zero dangerous lifecycle scripts, secret exfiltration, or obfuscated calls.
        </p>
      </div>
    );
  }

  const packageGroups = groupFindingsByPackageAndFile(findings);

  return (
    <div className="space-y-6">
      {packageGroups.map((pkgGroup, pIdx) => (
        <motion.div
          key={pkgGroup.packageName}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: pIdx * 0.1 }}
          className="rounded-[12px] bg-white border border-[#F0DCE2] p-5 sm:p-6 shadow-[0_1px_2px_rgba(30,26,28,0.04)] space-y-5"
        >
          {/* Package Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F0DCE2]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#FAF4F6] border border-[#F0DCE2] text-[#B8556B]">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <span className="font-display text-base font-bold text-[#1E1A1C]">
                  {pkgGroup.packageName}
                </span>
                {pkgGroup.version && (
                  <span className="ml-2 font-mono text-xs text-[#6E6268]">
                    v{pkgGroup.version}
                  </span>
                )}
              </div>
            </div>

            {pkgGroup.ecosystem && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF4F6] border border-[#F0DCE2] text-[11px] font-mono text-[#6E6268]">
                {pkgGroup.ecosystem}
              </span>
            )}
          </div>

          {/* Files within this package */}
          <div className="space-y-4">
            {pkgGroup.files.map((fileGroup, fIdx) => (
              <motion.div
                key={fileGroup.filePath}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: fIdx * 0.05 }}
                className="space-y-2.5"
              >
                {/* File Sub-header */}
                <div className="flex items-center gap-2 text-xs font-mono text-[#B8556B]">
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{fileGroup.filePath}</span>
                  <span className="text-[#6E6268]/30">•</span>
                  <span className="text-[#6E6268]">
                    {fileGroup.findings.length} finding{fileGroup.findings.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Individual Findings */}
                <div className="space-y-2.5">
                  {fileGroup.findings.map((f) => (
                    <FindingItem key={f.id} finding={f} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
