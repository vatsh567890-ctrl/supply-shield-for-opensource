import React from "react";

export const AuroraBackground: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 overflow-hidden pointer-events-none z-[-1] ${className}`}
    >
      {/* Aurora Blob 1: Deep Indigo & Glow */}
      <div
        className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-gradient-to-br from-[#6C63FF]/20 to-[#2D2A6E]/30 blur-[130px] animate-aurora-1"
        style={{ willChange: "transform" }}
      />

      {/* Aurora Blob 2: Cyan Highlight Accent */}
      <div
        className="absolute top-[40%] -right-[15%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full bg-gradient-to-bl from-[#7CF5FF]/15 to-[#6C63FF]/20 blur-[140px] animate-aurora-2"
        style={{ willChange: "transform" }}
      />

      {/* Aurora Blob 3: Deep Core Baseline */}
      <div
        className="absolute -bottom-[20%] left-[20%] w-[55vw] h-[55vw] max-w-[750px] max-h-[750px] rounded-full bg-gradient-to-tr from-[#2D2A6E]/35 via-[#6C63FF]/15 to-transparent blur-[150px] animate-aurora-1"
        style={{ willChange: "transform" }}
      />

      {/* Subtle Noise Texture Overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.035] mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="aurora-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#aurora-noise)" />
      </svg>

      {children}
    </div>
  );
};
