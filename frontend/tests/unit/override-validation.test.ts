import { describe, it, expect } from "vitest";
import { OverrideInputSchema } from "@/lib/schemas/verdicts";

describe("OverrideInputSchema Validation", () => {
  it("accepts a valid 'accept' decision with a valid justification reason", () => {
    const input = {
      action: "accept",
      reason: "Verified telemetry endpoint is an internal corporate metrics collector.",
    };
    const result = OverrideInputSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.action).toBe("accept");
      expect(result.data.reason).toBe(input.reason);
    }
  });

  it("accepts a valid 'reject' decision with a valid justification reason", () => {
    const input = {
      action: "reject",
      reason: "Confirmed credential harvesting attempt. Blocking PR immediately.",
    };
    const result = OverrideInputSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.action).toBe("reject");
      expect(result.data.reason).toBe(input.reason);
    }
  });

  it("rejects an empty reason string", () => {
    const input = {
      action: "accept",
      reason: "",
    };
    const result = OverrideInputSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("1 character");
    }
  });

  it("rejects a reason that exceeds 500 characters", () => {
    const longReason = "a".repeat(501);
    const input = {
      action: "accept",
      reason: longReason,
    };
    const result = OverrideInputSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("cannot exceed 500 characters");
    }
  });

  it("accepts exactly 1 character and exactly 500 characters", () => {
    const minInput = { action: "reject", reason: "x" };
    const maxInput = { action: "accept", reason: "z".repeat(500) };

    expect(OverrideInputSchema.safeParse(minInput).success).toBe(true);
    expect(OverrideInputSchema.safeParse(maxInput).success).toBe(true);
  });

  it("rejects invalid action values other than accept or reject", () => {
    const input = {
      action: "bypass",
      reason: "Legitimate reason but invalid action",
    };
    const result = OverrideInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});
