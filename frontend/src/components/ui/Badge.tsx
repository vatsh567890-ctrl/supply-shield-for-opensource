import React from "react";
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Info,
} from "lucide-react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  level?: "LOW" | "MEDIUM" | "HIGH" | "NEUTRAL" | "LIVE";
  showIcon?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  level = "NEUTRAL",
  showIcon = true,
  className = "",
  ...props
}) => {
  const styles = {
    LOW: "bg-[#2F7D5B]/10 text-[#2F7D5B] border-[#2F7D5B]/30",
    MEDIUM: "bg-[#9A6410]/10 text-[#9A6410] border-[#9A6410]/30",
    HIGH: "bg-[#A3213F]/10 text-[#A3213F] border-[#A3213F]/30",
    LIVE: "bg-[#B8556B]/10 text-[#B8556B] border-[#B8556B]/30",
    NEUTRAL: "bg-[#FAF4F6] text-[#6E6268] border-[#F0DCE2]",
  };

  const getIcon = () => {
    if (!showIcon) return null;
    switch (level) {
      case "LOW":
        return <ShieldCheck className="w-3.5 h-3.5 mr-1.5 shrink-0" aria-hidden="true" />;
      case "MEDIUM":
        return <AlertTriangle className="w-3.5 h-3.5 mr-1.5 shrink-0" aria-hidden="true" />;
      case "HIGH":
        return <AlertOctagon className="w-3.5 h-3.5 mr-1.5 shrink-0" aria-hidden="true" />;
      case "LIVE":
        return <span className="w-2 h-2 rounded-full bg-[#B8556B] mr-1.5 shrink-0" aria-hidden="true" />;
      default:
        return <Info className="w-3.5 h-3.5 mr-1.5 shrink-0" aria-hidden="true" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[level]} ${className}`}
      {...props}
    >
      {getIcon()}
      <span>{children}</span>
    </span>
  );
};
