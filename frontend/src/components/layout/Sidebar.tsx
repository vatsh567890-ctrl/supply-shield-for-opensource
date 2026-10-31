import React from "react";
import Link from "next/link";
import Image from "next/image";

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white border-r border-[#D6D3F0] p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <Image src="/shield.svg" alt="SupplyShield" width={32} height={32} />
          <span className="text-xl font-bold text-[#2D2A6E]">SupplyShield</span>
        </div>
        <nav className="flex flex-col gap-1">
          <Link
            href="/overview"
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-[#ECEBFA]"
          >
            Overview
          </Link>
          <Link
            href="/scan"
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-[#ECEBFA]"
          >
            Scan PR
          </Link>
          <Link
            href="/repos"
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-[#ECEBFA]"
          >
            Repositories
          </Link>
          <Link
            href="/settings"
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-[#ECEBFA]"
          >
            Settings
          </Link>
        </nav>
      </div>
      <div className="text-xs text-slate-400">SupplyShield v0.1.0</div>
    </aside>
  );
};
