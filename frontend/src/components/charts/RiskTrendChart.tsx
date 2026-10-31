"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendPoint } from "@/lib/schemas/repos";

export const RiskTrendChart: React.FC<{ data: TrendPoint[] }> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400 italic bg-slate-50 rounded-xl">
        No trend data recorded for this time range.
      </div>
    );
  }

  return (
    <div className="h-64 w-full bg-white p-4 rounded-xl border border-[#D6D3F0]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ECEBFA" />
          <XAxis dataKey="date" stroke="#8A84C4" fontSize={11} />
          <YAxis domain={[0, 100]} stroke="#8A84C4" fontSize={11} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="max_score"
            stroke="#2D2A6E"
            strokeWidth={2}
            dot={{ fill: "#8A84C4" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
