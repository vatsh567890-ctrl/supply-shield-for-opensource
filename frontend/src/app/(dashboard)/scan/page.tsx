"use client";

import React from "react";
import { PrUrlForm } from "@/components/scan/PrUrlForm";

export default function ScanPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      {/* Page Title & Explanation */}
      <div className="space-y-2">
        <h1 className="text-3xl font-medium text-[#1E1A1C] tracking-tight">
          Scan a pull request
        </h1>
        <p className="text-base text-[#6E6268] leading-relaxed">
          Submit any public or monitored repository pull request URL to inspect dependency changes, lifecycle hooks, and exfiltration vectors.
        </p>
      </div>

      {/* Main Card */}
      <div className="p-6 sm:p-8 rounded-[12px] bg-white border border-[#F0DCE2] shadow-[0_1px_2px_rgba(30,26,28,0.04)]">
        <PrUrlForm />
      </div>
    </div>
  );
}
