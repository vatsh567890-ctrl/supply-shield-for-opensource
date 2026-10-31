import { describe, it, expect } from "vitest";
import { getRiskPresentation, calculateRiskLevel } from "@/lib/risk";

describe("getRiskPresentation", () => {
  it("maps LOW level to green color and label", () => {
    const res = getRiskPresentation("LOW");
    expect(res.label).toBe("Low Risk");
    expect(res.colorClass).toContain("green");
    expect(res.hex).toBe("#34D399");
  });

  it("maps MEDIUM level to amber color and label", () => {
    const res = getRiskPresentation("MEDIUM");
    expect(res.label).toBe("Medium Risk");
    expect(res.colorClass).toContain("amber");
    expect(res.hex).toBe("#FBBF24");
  });

  it("maps HIGH level to red color and label", () => {
    const res = getRiskPresentation("HIGH");
    expect(res.label).toBe("High Risk");
    expect(res.colorClass).toContain("red");
    expect(res.hex).toBe("#F43F5E");
  });
});

describe("calculateRiskLevel", () => {
  it("classifies scores >= 70 as HIGH", () => {
    expect(calculateRiskLevel(70)).toBe("HIGH");
    expect(calculateRiskLevel(92)).toBe("HIGH");
    expect(calculateRiskLevel(100)).toBe("HIGH");
  });

  it("classifies scores between 30 and 69 as MEDIUM", () => {
    expect(calculateRiskLevel(30)).toBe("MEDIUM");
    expect(calculateRiskLevel(50)).toBe("MEDIUM");
    expect(calculateRiskLevel(69)).toBe("MEDIUM");
  });

  it("classifies scores < 30 as LOW", () => {
    expect(calculateRiskLevel(0)).toBe("LOW");
    expect(calculateRiskLevel(15)).toBe("LOW");
    expect(calculateRiskLevel(29)).toBe("LOW");
  });
});
