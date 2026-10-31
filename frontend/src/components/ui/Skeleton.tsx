import React from "react";

export const Skeleton: React.FC<{ className?: string }> = ({
  className = "h-4 w-full",
}) => {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden rounded-xl bg-white/[0.06] animate-shimmer ${className}`}
    />
  );
};
