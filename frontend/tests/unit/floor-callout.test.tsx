import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { FloorCallout } from "@/components/verdict/FloorCallout";

describe("FloorCallout", () => {
  it("renders floor callout when floor_applied is set", () => {
    const { container } = render(<FloorCallout floorApplied={85} />);

    expect(
      screen.getByText("Deterministic Security Floor Applied: 85")
    ).toBeDefined();
    expect(screen.getByText("Minimum Baseline")).toBeDefined();
    expect(
      screen.getByText(/The threat score is pinned to a minimum baseline of 85/)
    ).toBeDefined();

    // Verify it does not look like an error (no red / error styles, but warm amber baseline)
    const region = screen.getByRole("region", { name: "Security floor notice" });
    expect(region).toBeDefined();
    expect(container.innerHTML).not.toContain("bg-red");
    expect(container.innerHTML).not.toContain("text-red");
  });

  it("returns null when floorApplied is null", () => {
    const { container } = render(<FloorCallout floorApplied={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when floorApplied is undefined", () => {
    const { container } = render(<FloorCallout floorApplied={undefined} />);
    expect(container.firstChild).toBeNull();
  });
});
