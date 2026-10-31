import React from "react";

export interface SparklineProps {
  data?: number[];
  level?: string | null;
  width?: number;
  height?: number;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data = [15, 18, 12, 22, 19, 45, 92],
  level = "LOW",
  width = 90,
  height = 28,
  className = "",
}) => {
  const points = data.length > 0 ? data : [10, 15, 12, 18, 14, 16];
  const min = Math.min(...points, 0);
  const max = Math.max(...points, 100);
  const range = max - min || 1;

  const strokeColor =
    level === "HIGH"
      ? "#F43F5E"
      : level === "MEDIUM"
      ? "#FBBF24"
      : "#34D399";

  const coords = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * (width - 4) + 2;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });

  const polylinePoints = coords.join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible ${className}`}
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polylinePoints}
        style={{
          filter: `drop-shadow(0 0 4px ${strokeColor}60)`,
        }}
      />
    </svg>
  );
};
