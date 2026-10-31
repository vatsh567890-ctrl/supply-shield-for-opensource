import { describe, it, expect } from "vitest";
import { formatScore, formatRelativeTime } from "@/lib/format";

describe("format helpers", () => {
  it("formats numeric score out of 100", () => {
    expect(formatScore(85)).toBe("85 / 100");
    expect(formatScore(42.3)).toBe("42 / 100");
  });

  it("formats relative time gracefully", () => {
    const recent = new Date().toISOString();
    expect(formatRelativeTime(recent)).toBe("just now");
  });
});
