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
      <div className="h-64 flex items-center justify-center text-xs text-[#6E6268] italic bg-[#FAF4F6] rounded-xl border border-[#F0DCE2]">
        No trend data recorded for this time range.
      </div>
    );
  }

  return (
    <div className="h-64 w-full bg-white p-4 rounded-xl border border-[#F0DCE2] shadow-[0_1px_2px_rgba(30,26,28,0.04)]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0DCE2" />
          <XAxis dataKey="date" stroke="#6E6268" fontSize={11} />
          <YAxis domain={[0, 100]} stroke="#6E6268" fontSize={11} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="max_score"
            stroke="#B8556B"
            strokeWidth={2}
            dot={{ fill: "#B8556B" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
