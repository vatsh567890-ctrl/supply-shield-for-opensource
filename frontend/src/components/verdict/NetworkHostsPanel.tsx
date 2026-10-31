import React from "react";
import { Globe, Radio, CheckCircle2 } from "lucide-react";

export interface NetworkHostsPanelProps {
  hosts: string[];
}

export const NetworkHostsPanel: React.FC<NetworkHostsPanelProps> = ({ hosts }) => {
  return (
    <div className="p-6 rounded-[12px] bg-white border border-[#F0DCE2] shadow-[0_1px_2px_rgba(30,26,28,0.04)] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0DCE2]">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#B8556B]" />
          <h3 className="font-display text-base font-bold text-[#1E1A1C]">
            Outbound Network Hosts
          </h3>
        </div>
        <span className="text-xs font-mono text-[#6E6268]">
          {hosts.length} Host{hosts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {hosts.length === 0 ? (
        <div className="py-4 text-center text-xs text-[#6E6268] flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#2F7D5B]" />
          <span>No external socket or HTTP hosts detected in package diff.</span>
        </div>
      ) : (
        <div>
          <p className="text-xs text-[#6E6268] mb-3 leading-relaxed">
            The following network domains were targeted by outbound network calls or install scripts in this pull request:
          </p>
          <div className="flex flex-wrap gap-2.5">
            {hosts.map((host) => (
              <div
                key={host}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FAF4F6] border border-[#A3213F]/30 text-xs font-mono text-[#1E1A1C]"
              >
                <Radio className="w-3.5 h-3.5 text-[#A3213F] animate-pulse" />
                <span>{host}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#A3213F]/15 text-[#A3213F] uppercase tracking-wider">
                  NEW
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
