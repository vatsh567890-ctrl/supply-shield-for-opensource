import React from "react";

export const UserMenu: React.FC<{ login?: string; avatarUrl?: string }> = ({
  login = "User",
}) => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-[#2D2A6E] text-white flex items-center justify-center font-bold text-xs">
        {login.charAt(0).toUpperCase()}
      </div>
      <span className="text-sm font-medium text-slate-700">{login}</span>
    </div>
  );
};
