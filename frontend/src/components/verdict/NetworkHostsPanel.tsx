import React from "react";
import { Globe, Radio, CheckCircle2 } from "lucide-react";

export interface NetworkHostsPanelProps {
  hosts: string[];
}

export const NetworkHostsPanel: React.FC<NetworkHostsPanelProps> = ({ hosts }) => {
  return (
    <div className="p-6 rounded-2xl bg-white/[0.04] border border-[rgba(138,132,196,0.25)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.36)] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#7CF5FF]" />
          <h3 className="font-display text-base font-bold text-white">
            Outbound Network Hosts
          </h3>
        </div>
        <span className="text-xs font-mono text-[#8A84C4]">
          {hosts.length} Host{hosts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {hosts.length === 0 ? (
        <div className="py-4 text-center text-xs text-[#8A84C4] flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
          <span>No external socket or HTTP hosts detected in package diff.</span>
        </div>
      ) : (
        <div>
          <p className="text-xs text-[#A39EC8] mb-3 leading-relaxed">
            The following network domains were targeted by outbound network calls or install scripts in this pull request:
          </p>
          <div className="flex flex-wrap gap-2.5">
            {hosts.map((host) => (
              <div
                key={host}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/40 border border-[#F43F5E]/40 text-xs font-mono text-white shadow-[0_0_15px_rgba(244,63,94,0.15)]"
              >
                <Radio className="w-3.5 h-3.5 text-[#F43F5E] animate-pulse" />
                <span>{host}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F43F5E]/20 text-[#F43F5E] uppercase tracking-wider">
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
