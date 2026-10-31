import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input: React.FC<InputProps> = ({
  className = "",
  error = false,
  ...props
}) => {
  return (
    <input
      className={`w-full px-4 py-2.5 rounded-[12px] bg-white border ${
        error
          ? "border-[#A3213F] text-[#A3213F] focus-visible:ring-[#A3213F]"
          : "border-[#F0DCE2] hover:border-[#B8556B]/50 focus-visible:border-[#B8556B] focus-visible:ring-[#B8556B]"
      } text-[#1E1A1C] placeholder:text-[#6E6268]/60 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white shadow-[0_1px_2px_rgba(30,26,28,0.04)] disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    />
  );
};
