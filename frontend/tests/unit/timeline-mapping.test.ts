import { describe, it, expect } from "vitest";
import {
  getActiveStepIndex,
  TIMELINE_STEPS,
} from "@/components/scan/AnalysisTimeline";

describe("Analysis Timeline State Mapping", () => {
  it("maps 'queued' status to index 0", () => {
    expect(getActiveStepIndex("queued")).toBe(0);
  });

  it("maps 'succeeded' status to full completion (all steps checkmarked)", () => {
    expect(getActiveStepIndex("succeeded")).toBe(TIMELINE_STEPS.length);
  });

  it("maps 'failed' status to -1 (failure indicator)", () => {
    expect(getActiveStepIndex("failed")).toBe(-1);
  });

  it("maps 'running' status to current sub-step within valid boundaries", () => {
    expect(getActiveStepIndex("running", 2)).toBe(2);
    expect(getActiveStepIndex("running", 5)).toBe(5);

    // Enforce upper limit of TIMELINE_STEPS.length - 1
    expect(getActiveStepIndex("running", 99)).toBe(TIMELINE_STEPS.length - 1);

    // Enforce lower bound of 1 for active execution
    expect(getActiveStepIndex("running", 0)).toBe(1);
  });

  it("contains all eight standard pipeline verification milestones", () => {
    expect(TIMELINE_STEPS).toEqual([
      "Queued",
      "Fetching PR",
      "Resolving versions",
      "Downloading packages",
      "Analyzing",
      "Checking advisories",
      "AI review",
      "Publishing",
    ]);
  });
});
