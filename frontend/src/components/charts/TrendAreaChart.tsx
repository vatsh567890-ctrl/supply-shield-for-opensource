"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendPoint } from "@/lib/schemas/repos";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: TrendPoint }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;

  return (
    <div className="p-3 rounded-xl bg-[#0E0C2B]/95 border border-[rgba(138,132,196,0.35)] backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] text-xs">
      <span className="font-mono text-[#8A84C4] block">{data.date}</span>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-white font-bold font-display text-sm">
          Peak Score: {data.max_score}/100
        </span>
      </div>
      <span className="text-[11px] text-[#7CF5FF] mt-0.5 block font-mono">
        {data.count} scan{data.count !== 1 ? "s" : ""} recorded
      </span>
    </div>
  );
};

export interface TrendAreaChartProps {
  data: TrendPoint[];
}

export default function TrendAreaChart({ data }: TrendAreaChartProps) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#7CF5FF" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(138, 132, 196, 0.12)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#8A84C4"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "rgba(138, 132, 196, 0.2)" }}
            tickFormatter={(val) => {
              const parts = val.split("-");
              return `${parts[1]}/${parts[2]}`;
            }}
          />
          <YAxis
            stroke="#8A84C4"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="max_score"
            stroke="#7CF5FF"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#trendGradient)"
            animationDuration={1200}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
