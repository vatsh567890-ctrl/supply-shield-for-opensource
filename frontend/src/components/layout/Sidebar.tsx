import React from "react";
import Link from "next/link";
import Image from "next/image";

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white border-r border-[#F0DCE2] p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <Image src="/shield.svg" alt="SupplyShield" width={32} height={32} />
          <span className="text-xl font-bold text-[#1E1A1C]">SupplyShield</span>
        </div>
        <nav className="flex flex-col gap-1">
          <Link
            href="/overview"
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#1E1A1C] hover:bg-[#FAF4F6]"
          >
            Overview
          </Link>
          <Link
            href="/scan"
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#1E1A1C] hover:bg-[#FAF4F6]"
          >
            Scan PR
          </Link>
          <Link
            href="/repos"
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#1E1A1C] hover:bg-[#FAF4F6]"
          >
            Repositories
          </Link>
          <Link
            href="/settings"
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#1E1A1C] hover:bg-[#FAF4F6]"
          >
            Settings
          </Link>
        </nav>
      </div>
      <div className="text-xs text-[#6E6268]">SupplyShield v0.1.0</div>
    </aside>
  );
};
