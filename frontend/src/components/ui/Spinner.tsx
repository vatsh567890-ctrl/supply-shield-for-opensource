import React from "react";

export const Spinner: React.FC<{
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}> = ({ size = "md", className = "", label = "Loading..." }) => {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-9 h-9 border-3",
  };

  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-block border-[#6C63FF]/30 border-t-[#7CF5FF] rounded-full animate-spin ${sizes[size]} ${className}`}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
};
