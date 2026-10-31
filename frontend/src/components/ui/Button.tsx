"use client";

import React, { useRef, useState } from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost" | "glow";
  size?: "sm" | "md" | "lg";
  magnetic?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  magnetic = false,
  className = "",
  style,
  onMouseMove,
  onMouseLeave,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!magnetic || !buttonRef.current) {
      onMouseMove?.(e);
      return;
    }
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) * 0.1;
    const distanceY = (e.clientY - centerY) * 0.1;
    setOffset({ x: distanceX, y: distanceY });
    onMouseMove?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOffset({ x: 0, y: 0 });
    onMouseLeave?.(e);
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs rounded-[12px] gap-1.5",
    md: "px-4 py-2 text-sm rounded-[12px] gap-2",
    lg: "px-5 py-2.5 text-base rounded-[12px] gap-2.5",
  };

  const variantClasses = {
    primary:
      "bg-[#B8556B] hover:bg-[#A2485C] text-white shadow-[0_1px_2px_rgba(30,26,28,0.04)] border border-transparent",
    glow:
      "bg-[#B8556B] hover:bg-[#A2485C] text-white shadow-[0_1px_2px_rgba(30,26,28,0.04)] border border-transparent",
    secondary:
      "bg-white hover:bg-[#FAF4F6] text-[#1E1A1C] border border-[#F0DCE2] shadow-[0_1px_2px_rgba(30,26,28,0.04)]",
    danger:
      "bg-[#A3213F] hover:bg-[#8D1C36] text-white shadow-[0_1px_2px_rgba(30,26,28,0.04)] border border-transparent",
    outline:
      "bg-transparent hover:bg-[#FAF4F6] text-[#1E1A1C] border border-[#F0DCE2]",
    ghost:
      "bg-transparent hover:bg-[#FAF4F6] text-[#6E6268] hover:text-[#1E1A1C] border border-transparent",
  };

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: offset.x === 0 ? "transform 0.2s ease-out" : "none",
        ...style,
      }}
      className={`inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8556B] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
