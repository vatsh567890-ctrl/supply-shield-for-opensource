"use client";

import React, { useState } from "react";
import { FileCode } from "lucide-react";
import { DiffFile } from "@/lib/schemas/verdicts";

export interface DiffPreviewProps {
  files: DiffFile[];
}

export const DiffPreview: React.FC<DiffPreviewProps> = ({ files }) => {
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  if (files.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-[#8A84C4] rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        No diff preview available for this verdict.
      </div>
    );
  }

  const activeFile = files[activeFileIndex] || files[0];

  return (
    <div className="rounded-2xl bg-white/[0.04] border border-[rgba(138,132,196,0.25)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.36)] overflow-hidden">
      {/* File Header Tabs */}
      <div className="flex items-center gap-1.5 px-4 py-3 bg-black/40 border-b border-white/[0.08] overflow-x-auto">
        {files.map((file, idx) => {
          const active = idx === activeFileIndex;
          return (
            <button
              key={file.filename}
              onClick={() => setActiveFileIndex(idx)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                active
                  ? "bg-[#2D2A6E] text-[#7CF5FF] border border-[#6C63FF]/50 shadow-sm"
                  : "text-[#8A84C4] hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{file.filename}</span>
            </button>
          );
        })}
      </div>

      {/* Code Lines Container with line numbers */}
      <div className="p-4 max-h-[420px] overflow-y-auto font-mono text-xs leading-relaxed select-text bg-[#070617]/90">
        <div className="space-y-0.5">
          {activeFile.lines.map((line, idx) => {
            const isAdd = line.type === "add";
            const isDel = line.type === "del";

            const rowStyles = isAdd
              ? "bg-[#34D399]/10 text-[#34D399] border-l-2 border-[#34D399]"
              : isDel
              ? "bg-[#F43F5E]/10 text-[#F43F5E] border-l-2 border-[#F43F5E]"
              : "text-[#C2BEDE] hover:bg-white/[0.02]";

            const prefix = isAdd ? "+" : isDel ? "-" : " ";

            return (
              <div
                key={idx}
                className={`flex items-start px-2 py-0.5 rounded-sm transition-colors ${rowStyles}`}
              >
                {/* Old line number */}
                <span className="w-9 shrink-0 text-right pr-2 text-[#716C9B] select-none text-[11px]">
                  {line.old_line ?? ""}
                </span>
                {/* New line number */}
                <span className="w-9 shrink-0 text-right pr-3 text-[#716C9B] select-none text-[11px] border-r border-white/[0.08] mr-3">
                  {line.new_line ?? ""}
                </span>
                {/* Prefix symbol */}
                <span className="w-4 shrink-0 font-bold select-none">{prefix}</span>
                {/* Code content */}
                <span className="whitespace-pre-wrap break-all flex-1">
                  {line.content}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
