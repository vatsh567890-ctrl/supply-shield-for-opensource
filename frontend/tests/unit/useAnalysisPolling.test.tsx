import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAnalysisPolling } from "@/hooks/useAnalysisPolling";
import * as endpoints from "@/lib/api/endpoints";

describe("useAnalysisPolling Hook", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.restoreAllMocks();
  });

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  it("stops polling when status is succeeded", async () => {
    const fetchSpy = vi.spyOn(endpoints, "fetchAnalysis").mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      repo_id: "00000000-0000-4000-8000-000000000001",
      pr_number: 142,
      head_sha: "abc1234",
      status: "succeeded",
      verdict_id: "22222222-2222-4222-8222-222222222222",
      created_at: new Date().toISOString(),
    });

    const { result } = renderHook(
      () => useAnalysisPolling("11111111-1111-4111-8111-111111111111"),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.data?.status).toBe("succeeded");
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("stops polling when status is failed", async () => {
    const fetchSpy = vi.spyOn(endpoints, "fetchAnalysis").mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      repo_id: "00000000-0000-4000-8000-000000000001",
      pr_number: 142,
      head_sha: "abc1234",
      status: "failed",
      error_code: "DIFF_PARSE_ERROR",
      created_at: new Date().toISOString(),
    });

    const { result } = renderHook(
      () => useAnalysisPolling("11111111-1111-4111-8111-111111111111"),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.data?.status).toBe("failed");
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("stops polling when status is superseded", async () => {
    const fetchSpy = vi.spyOn(endpoints, "fetchAnalysis").mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      repo_id: "00000000-0000-4000-8000-000000000001",
      pr_number: 142,
      head_sha: "abc1234",
      status: "superseded",
      created_at: new Date().toISOString(),
    });

    const { result } = renderHook(
      () => useAnalysisPolling("11111111-1111-4111-8111-111111111111"),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.data?.status).toBe("superseded");
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("stops polling after 60 seconds and shows the timeout message", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    vi.spyOn(endpoints, "fetchAnalysis").mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      repo_id: "00000000-0000-4000-8000-000000000001",
      pr_number: 142,
      head_sha: "abc1234",
      status: "running",
      current_step: "analyzing",
      created_at: new Date().toISOString(),
    });

    const { result } = renderHook(
      () => useAnalysisPolling("11111111-1111-4111-8111-111111111111"),
      { wrapper: createWrapper() }
    );

    expect(result.current.isTimedOut).toBe(false);
    expect(result.current.timeoutMessage).toBeNull();

    // Advance 60 seconds
    act(() => {
      vi.advanceTimersByTime(61000);
    });

    expect(result.current.isTimedOut).toBe(true);
    expect(result.current.timeoutMessage).toBe(
      "Still running. You can leave this page; we will notify you in the PR."
    );

    vi.useRealTimers();
  });
});

