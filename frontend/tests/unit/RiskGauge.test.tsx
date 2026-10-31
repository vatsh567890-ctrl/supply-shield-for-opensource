import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { RiskGauge } from "@/components/verdict/RiskGauge";

describe("RiskGauge", () => {
  it("renders score and text label for HIGH risk", () => {
    render(<RiskGauge score={85} level="HIGH" />);
    expect(screen.getByText("85")).toBeDefined();
    expect(screen.getByText("HIGH RISK")).toBeDefined();
  });

  it("renders score and text label for LOW risk", () => {
    render(<RiskGauge score={12} level="LOW" />);
    expect(screen.getByText("12")).toBeDefined();
    expect(screen.getByText("LOW RISK")).toBeDefined();
  });

  it("produces accessible aria-label and meter attributes", () => {
    render(<RiskGauge score={92} level="HIGH" />);
    const meter = screen.getByRole("meter");
    expect(meter).toBeDefined();
    expect(meter.getAttribute("aria-label")).toBe(
      "Risk score: 92 out of 100, HIGH risk"
    );
    expect(meter.getAttribute("aria-valuenow")).toBe("92");
    expect(meter.getAttribute("aria-valuemin")).toBe("0");
    expect(meter.getAttribute("aria-valuemax")).toBe("100");
  });

  it("infers level automatically from numerical score if not specified", () => {
    const { unmount } = render(<RiskGauge score={45} />);
    expect(screen.getByRole("meter").getAttribute("aria-label")).toContain(
      "MEDIUM risk"
    );
    unmount();

    render(<RiskGauge score={15} />);
    expect(screen.getByRole("meter").getAttribute("aria-label")).toContain(
      "LOW risk"
    );
  });
});
