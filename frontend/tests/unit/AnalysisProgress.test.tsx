import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import React from "react";
import {
  AnalysisProgress,
  ANALYSIS_STEPS,
  computeStepStates,
} from "@/components/scan/AnalysisProgress";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("AnalysisProgress Component", () => {
  beforeEach(() => {
    mockPush.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders all eight verification pipeline steps", () => {
    render(<AnalysisProgress status="queued" />);

    ANALYSIS_STEPS.forEach((step) => {
      expect(screen.getByText(step.label)).toBeDefined();
    });
    expect(ANALYSIS_STEPS).toHaveLength(8);
  });

  it("highlights the active step based on API running response", () => {
    render(
      <AnalysisProgress
        status="running"
        currentStep="downloading_packages"
      />
    );

    const stepEl = screen.getByTestId("timeline-step-downloading_packages");
    expect(stepEl.getAttribute("data-status")).toBe("active");
    expect(screen.getByText("In progress...")).toBeDefined();

    // Prior steps should be marked done
    expect(
      screen.getByTestId("timeline-step-queued").getAttribute("data-status")
    ).toBe("done");
    expect(
      screen.getByTestId("timeline-step-fetching_pr").getAttribute("data-status")
    ).toBe("done");
    expect(
      screen
        .getByTestId("timeline-step-resolving_versions")
        .getAttribute("data-status")
    ).toBe("done");

    // Later steps should be marked pending
    expect(
      screen.getByTestId("timeline-step-analyzing").getAttribute("data-status")
    ).toBe("pending");
    expect(
      screen.getByTestId("timeline-step-publishing").getAttribute("data-status")
    ).toBe("pending");
  });

  it("shows 'View verdict' button and automatically navigates on succeeded after 1.5s", async () => {
    const verdictId = "11111111-1111-4111-8111-111111111111";
    render(
      <AnalysisProgress status="succeeded" verdictId={verdictId} />
    );

    const viewVerdictBtn = screen.getByRole("link", { name: /view verdict/i });
    expect(viewVerdictBtn).toBeDefined();
    expect(viewVerdictBtn.getAttribute("href")).toBe(
      `/verdicts/${verdictId}`
    );

    // Verify all steps are marked done
    ANALYSIS_STEPS.forEach((step) => {
      expect(
        screen.getByTestId(`timeline-step-${step.id}`).getAttribute("data-status")
      ).toBe("done");
    });

    // Advance 1.5 seconds for auto-navigation
    expect(mockPush).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(mockPush).toHaveBeenCalledWith(`/verdicts/${verdictId}`);
  });

  it("shows error card on failed status with error_code and safe message without stack trace", () => {
    const { container } = render(
      <AnalysisProgress
        status="failed"
        errorCode="RATE_LIMITED"
        errorMessage="GitHub API rate limit exceeded. Please try again later."
      />
    );

    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText(/RATE_LIMITED/)).toBeDefined();
    expect(
      screen.getByText(/GitHub API rate limit exceeded/i)
    ).toBeDefined();

    // Must not display a stack trace
    expect(container.innerHTML).not.toContain("Error:");
    expect(container.innerHTML).not.toContain("at ");
    expect(container.innerHTML).not.toContain("node_modules");
  });
});

