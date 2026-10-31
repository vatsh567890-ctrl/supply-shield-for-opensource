"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ShieldSilhouetteSvg } from "./ShieldSilhouetteSvg";

// Dynamic import with ssr: false to isolate 3D bundle and protect first paint
const ShieldCanvas = dynamic(
  () =>
    import("./ShieldCanvas").catch((err) => {
      console.warn("Failed to load 3D ShieldCanvas, falling back to SVG:", err);
      return { default: () => <ShieldSilhouetteSvg /> };
    }),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[360px] flex items-center justify-center">
        <ShieldSilhouetteSvg />
      </div>
    ),
  }
);

export interface ProceduralShieldProps {
  className?: string;
}

export const ProceduralShield: React.FC<ProceduralShieldProps> = ({
  className = "",
}) => {
  return (
    <div className={`w-full max-w-[460px] h-[380px] sm:h-[440px] relative mx-auto ${className}`}>
      <ShieldCanvas />
    </div>
  );
};

