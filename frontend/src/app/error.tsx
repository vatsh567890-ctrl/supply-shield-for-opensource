"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (isDev) {
      // Log error to console in development only without transmitting external telemetry
      console.error("ErrorBoundary caught error:", error);
    }
  }, [error, isDev]);

  const displayMessage = isDev
    ? error.message || "An unexpected error occurred."
    : "An unexpected error occurred while loading this page.";

  const accessibleName = isDev && error.message
    ? `Error: ${error.message}`
    : "An error occurred";

  return (
    <main className="min-h-[70vh] flex items-center justify-center p-6">
      <div
        role="alert"
        aria-label={accessibleName}
        className="max-w-md w-full rounded-[12px] bg-white border border-[#F0DCE2] p-8 text-center shadow-[0_1px_2px_rgba(30,26,28,0.04)]"
      >
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#A3213F]/10 border border-[#A3213F]/20 flex items-center justify-center text-[#A3213F]">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-medium text-[#1E1A1C] mb-2 tracking-tight">
          An error occurred
        </h2>
        <p className="text-sm text-[#6E6268] mb-6 leading-relaxed break-words">
          {displayMessage}
        </p>
        {!isDev && error.digest && (
          <p className="text-xs font-mono text-[#6E6268] mb-6 bg-[#FAF4F6] p-2 rounded-[8px] border border-[#F0DCE2]">
            Request ID: {error.digest}
          </p>
        )}
        <Button
          variant="primary"
          onClick={() => {
            const isChunkLoadError =
              error.name === "ChunkLoadError" ||
              error.message?.includes("Loading chunk") ||
              error.message?.includes("dynamically imported module");
            if (isChunkLoadError && typeof window !== "undefined") {
              window.location.reload();
            } else {
              reset();
            }
          }}
          className="inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try again</span>
        </Button>
      </div>
    </main>
  );
}
