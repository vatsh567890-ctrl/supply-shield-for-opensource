"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAnalysis } from "@/lib/api/endpoints";

export function useAnalysisPolling(analysisId: string) {
  const [isTimedOut, setIsTimedOut] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    setIsTimedOut(false);
  }, [analysisId]);

  useEffect(() => {
    if (!analysisId) return;

    const timer = setInterval(() => {
      if (Date.now() - startTimeRef.current >= 60000) {
        setIsTimedOut(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [analysisId]);

  const query = useQuery({
    queryKey: ["analysis", analysisId],
    queryFn: () => fetchAnalysis(analysisId),
    enabled: !!analysisId && !isTimedOut,
    refetchInterval: (q) => {
      if (isTimedOut) return false;
      const status = q.state.data?.status;
      if (status === "succeeded" || status === "failed" || status === "superseded") {
        return false;
      }
      return 2000;
    },
  });

  return {
    ...query,
    isTimedOut,
    timeoutMessage: isTimedOut
      ? "Still running. You can leave this page; we will notify you in the PR."
      : null,
  };
}
