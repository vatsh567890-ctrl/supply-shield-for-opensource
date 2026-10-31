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
      <div className="p-6 text-center text-xs text-[#6E6268] rounded-[12px] bg-[#FAF4F6] border border-[#F0DCE2]">
        No diff preview available for this verdict.
      </div>
    );
  }

  const activeFile = files[activeFileIndex] || files[0];

  return (
    <div className="rounded-[12px] bg-white border border-[#F0DCE2] shadow-[0_1px_2px_rgba(30,26,28,0.04)] overflow-hidden">
      {/* File Header Tabs */}
      <div className="flex items-center gap-1.5 px-4 py-3 bg-[#FAF4F6] border-b border-[#F0DCE2] overflow-x-auto">
        {files.map((file, idx) => {
          const active = idx === activeFileIndex;
          return (
            <button
              key={file.filename}
              onClick={() => setActiveFileIndex(idx)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                active
                  ? "bg-white text-[#B8556B] border border-[#F0DCE2] shadow-sm"
                  : "text-[#6E6268] hover:text-[#1E1A1C] hover:bg-white/50"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{file.filename}</span>
            </button>
          );
        })}
      </div>

      {/* Code Lines Container with line numbers */}
      <div className="p-4 max-h-[420px] overflow-y-auto font-mono text-xs leading-relaxed select-text bg-[#FAF4F6]/50">
        <div className="space-y-0.5">
          {activeFile.lines.map((line, idx) => {
            const isAdd = line.type === "add";
            const isDel = line.type === "del";

            const rowStyles = isAdd
              ? "bg-[#2F7D5B]/10 text-[#2F7D5B] border-l-2 border-[#2F7D5B]"
              : isDel
              ? "bg-[#A3213F]/10 text-[#A3213F] border-l-2 border-[#A3213F]"
              : "text-[#1E1A1C] hover:bg-white/60";

            const prefix = isAdd ? "+" : isDel ? "-" : " ";

            return (
              <div
                key={idx}
                className={`flex items-start px-2 py-0.5 rounded-sm transition-colors ${rowStyles}`}
              >
                {/* Old line number */}
                <span className="w-9 shrink-0 text-right pr-2 text-[#6E6268] select-none text-[11px]">
                  {line.old_line ?? ""}
                </span>
                {/* New line number */}
                <span className="w-9 shrink-0 text-right pr-3 text-[#6E6268] select-none text-[11px] border-r border-[#F0DCE2] mr-3">
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
