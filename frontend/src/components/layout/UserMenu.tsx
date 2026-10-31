import React from "react";

export const UserMenu: React.FC<{ login?: string; avatarUrl?: string }> = ({
  login = "User",
}) => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-[#FAF4F6] border border-[#F0DCE2] text-[#B8556B] flex items-center justify-center font-bold text-xs">
        {login.charAt(0).toUpperCase()}
      </div>
      <span className="text-sm font-medium text-[#1E1A1C]">{login}</span>
    </div>
  );
};
