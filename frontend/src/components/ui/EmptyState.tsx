import React from "react";
import { ShieldCheck } from "lucide-react";

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
}) => {
  return (
    <div className="text-center py-12 px-6 rounded-[12px] border border-dashed border-[#F0DCE2] bg-white shadow-[0_1px_2px_rgba(30,26,28,0.04)]">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#B8556B]/10 border border-[#B8556B]/20 flex items-center justify-center text-[#B8556B]">
        {icon || <ShieldCheck className="w-6 h-6 text-[#B8556B]" />}
      </div>
      <h3 className="text-base font-medium text-[#1E1A1C] mb-1">
        {title}
      </h3>
      <p className="text-sm text-[#6E6268] mb-4 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
};
