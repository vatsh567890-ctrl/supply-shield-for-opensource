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
      <div className="absolute w-64 h-64 rounded-full bg-[#6C63FF]/25 blur-3xl" />
      <div className="absolute w-48 h-48 rounded-full bg-[#7CF5FF]/20 blur-2xl animate-live-pulse" />

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
            <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#2D2A6E" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0A0920" stopOpacity="0.95" />
          </linearGradient>

          {/* Border Glow Gradient */}
          <linearGradient id="shieldBorder" x1="0" y1="0" x2="280" y2="320" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7CF5FF" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#6C63FF" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#8A84C4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#7CF5FF" stopOpacity="0.8" />
          </linearGradient>

          {/* Core Emblem Gradient */}
          <linearGradient id="emblemGrad" x1="80" y1="80" x2="200" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7CF5FF" />
            <stop offset="100%" stopColor="#6C63FF" />
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
        <g filter="url(#neonGlow)">
          {/* Circuit nodes */}
          <circle cx="140" cy="140" r="14" fill="url(#emblemGrad)" />
          <circle cx="140" cy="140" r="24" stroke="#7CF5FF" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />

          {/* Secure check / lock glyph lines */}
          <path
            d="M133 140 L138 145 L148 135"
            stroke="#0A0920"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Radar scan trace rays */}
        <line x1="140" y1="55" x2="140" y2="105" stroke="#7CF5FF" strokeWidth="1.5" opacity="0.7" strokeDasharray="2 3" />
        <line x1="140" y1="175" x2="140" y2="235" stroke="#7CF5FF" strokeWidth="1.5" opacity="0.5" strokeDasharray="2 3" />
        <line x1="85" y1="140" x2="110" y2="140" stroke="#7CF5FF" strokeWidth="1.5" opacity="0.5" strokeDasharray="2 3" />
        <line x1="170" y1="140" x2="195" y2="140" stroke="#7CF5FF" strokeWidth="1.5" opacity="0.5" strokeDasharray="2 3" />

        {/* Satellite pulse markers */}
        <circle cx="140" cy="55" r="3" fill="#7CF5FF" />
        <circle cx="140" cy="235" r="3" fill="#6C63FF" />
        <circle cx="85" cy="140" r="3" fill="#7CF5FF" />
        <circle cx="195" cy="140" r="3" fill="#6C63FF" />
      </svg>
    </div>
  );
};
