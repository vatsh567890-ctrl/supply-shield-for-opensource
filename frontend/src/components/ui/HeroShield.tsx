"use client";

import React from "react";

export const HeroShield: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      aria-hidden="true"
    >
      {/* Outer ambient glow */}
      <div className="absolute w-64 h-64 rounded-full bg-[#B8556B]/10 blur-3xl" />

      {/* SVG Shield Graphics */}
      <svg
        width="280"
        height="320"
        viewBox="0 0 280 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 transition-transform duration-500 hover:scale-105"
      >
        <defs>
          {/* Main Shield Gradient */}
          <linearGradient id="shieldGrad" x1="20" y1="20" x2="260" y2="300" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#FAF4F6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FBE4EA" stopOpacity="0.95" />
          </linearGradient>

          {/* Border Glow Gradient */}
          <linearGradient id="shieldBorder" x1="0" y1="0" x2="280" y2="320" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#B8556B" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#F0DCE2" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#B8556B" stopOpacity="0.6" />
          </linearGradient>

          {/* Core Emblem Gradient */}
          <linearGradient id="emblemGrad" x1="80" y1="80" x2="200" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#B8556B" />
            <stop offset="100%" stopColor="#A2485C" />
          </linearGradient>

          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Shield Geometry */}
        <path
          d="M140 18 L240 60 C240 160 195 245 140 295 C85 245 40 160 40 60 L140 18 Z"
          fill="url(#shieldGrad)"
          stroke="url(#shieldBorder)"
          strokeWidth="3"
          filter="drop-shadow(0 12px 30px rgba(0,0,0,0.7))"
        />

        {/* Inner Glass Facet */}
        <path
          d="M140 38 L220 72 C220 152 184 222 140 266 C96 222 60 152 60 72 L140 38 Z"
          fill="rgba(255, 255, 255, 0.03)"
          stroke="rgba(138, 132, 196, 0.3)"
          strokeWidth="1.5"
        />

        {/* Diagonal Light Reflection */}
        <path
          d="M140 40 L218 73 C218 105 210 138 198 168 L140 85 Z"
          fill="rgba(255, 255, 255, 0.06)"
        />

        {/* Central Luminous Node / Emblem */}
        <g>
          {/* Circuit nodes */}
          <circle cx="140" cy="140" r="14" fill="url(#emblemGrad)" />
          <circle cx="140" cy="140" r="24" stroke="#B8556B" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />

          {/* Secure check / lock glyph lines */}
          <path
            d="M133 140 L138 145 L148 135"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Radar scan trace rays */}
        <line x1="140" y1="55" x2="140" y2="105" stroke="#B8556B" strokeWidth="1.5" opacity="0.7" strokeDasharray="2 3" />
        <line x1="140" y1="175" x2="140" y2="235" stroke="#B8556B" strokeWidth="1.5" opacity="0.5" strokeDasharray="2 3" />
        <line x1="85" y1="140" x2="110" y2="140" stroke="#B8556B" strokeWidth="1.5" opacity="0.5" strokeDasharray="2 3" />
        <line x1="170" y1="140" x2="195" y2="140" stroke="#B8556B" strokeWidth="1.5" opacity="0.5" strokeDasharray="2 3" />

        {/* Satellite pulse markers */}
        <circle cx="140" cy="55" r="3" fill="#B8556B" />
        <circle cx="140" cy="235" r="3" fill="#B8556B" />
        <circle cx="85" cy="140" r="3" fill="#B8556B" />
        <circle cx="195" cy="140" r="3" fill="#B8556B" />
      </svg>
    </div>
  );
};
