import React from "react";

interface ShieldSilhouetteSvgProps {
  className?: string;
}

export const ShieldSilhouetteSvg: React.FC<ShieldSilhouetteSvgProps> = ({
  className = "",
}) => {
  return (
    <div
      className={`w-full h-full flex items-center justify-center p-6 ${className}`}
      aria-label="SupplyShield 3D Shield representation"
      role="img"
    >
      <svg
        viewBox="0 0 200 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[280px] h-auto drop-shadow-[0_4px_16px_rgba(184,85,107,0.12)]"
      >
        <defs>
          <linearGradient id="shieldBaseGrad" x1="20" y1="20" x2="180" y2="230" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#F5ECEF" />
            <stop offset="100%" stopColor="#EAD8DE" />
          </linearGradient>
          <linearGradient id="shieldRimGrad" x1="30" y1="30" x2="170" y2="210" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#FAF2F4" />
            <stop offset="100%" stopColor="#DFCAD1" />
          </linearGradient>
        </defs>

        {/* Outer Shield Body */}
        <path
          d="M 20,30 L 180,30 C 185,120 155,185 100,225 C 45,185 15,120 20,30 Z"
          fill="url(#shieldBaseGrad)"
          stroke="#F0DCE2"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Inset Rim */}
        <path
          d="M 32,42 L 168,42 C 172,118 147,175 100,210 C 53,175 28,118 32,42 Z"
          fill="none"
          stroke="url(#shieldRimGrad)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Subtle center spine ridge */}
        <line
          x1="100"
          y1="46"
          x2="100"
          y2="204"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />
      </svg>
    </div>
  );
};

