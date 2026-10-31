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
      <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-dashed border-[rgba(138,132,196,0.3)] text-[#A39EC8]">
        <ShieldCheck className="w-8 h-8 text-[#34D399] mx-auto mb-2" />
        <p className="text-sm font-medium text-white">No suspicious heuristics identified</p>
        <p className="text-xs text-[#8A84C4] mt-1">
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
          className="rounded-3xl bg-white/[0.02] border border-[rgba(138,132,196,0.25)] p-5 sm:p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] space-y-5"
        >
          {/* Package Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#2D2A6E]/60 border border-[#6C63FF]/30 text-[#7CF5FF]">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <span className="font-display text-base font-bold text-white">
                  {pkgGroup.packageName}
                </span>
                {pkgGroup.version && (
                  <span className="ml-2 font-mono text-xs text-[#8A84C4]">
                    v{pkgGroup.version}
                  </span>
                )}
              </div>
            </div>

            {pkgGroup.ecosystem && (
              <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-[#A39EC8]">
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
                <div className="flex items-center gap-2 text-xs font-mono text-[#7CF5FF]">
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{fileGroup.filePath}</span>
                  <span className="text-white/30">•</span>
                  <span className="text-[#8A84C4]">
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
