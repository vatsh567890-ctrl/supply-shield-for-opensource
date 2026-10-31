import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { FindingList } from "@/components/verdict/FindingList";
import { groupFindingsByPackageAndFile } from "@/lib/findings";
import { FindingResponse } from "@/lib/schemas/verdicts";

describe("FindingList & Grouping Logic", () => {
  const sampleFindings: FindingResponse[] = [
    {
      id: "f1",
      rule_id: "INSTALL_SCRIPT_NETWORK",
      severity: "HIGH",
      weight: 50,
      package_ecosystem: "npm",
      package_name: "demo-package-exfil",
      package_version: "1.0.4",
      file_path: "package.json",
      line_start: 12,
      line_end: 14,
      message: "Lifecycle script 'postinstall' triggers outbound network connections",
      evidence: 'node -e "require(\'https\')"',
    },
    {
      id: "f2",
      rule_id: "ENV_SECRET_READ",
      severity: "HIGH",
      weight: 35,
      package_ecosystem: "npm",
      package_name: "demo-package-exfil",
      package_version: "1.0.4",
      file_path: "setup.js",
      line_start: 5,
      line_end: 8,
      message: "Accesses sensitive environment variable names",
      evidence: "process.env.AWS_SECRET_ACCESS_KEY",
    },
    {
      id: "f3",
      rule_id: "UNPINNED_GIT_DEPENDENCY",
      severity: "MEDIUM",
      weight: 30,
      package_ecosystem: "npm",
      package_name: "custom-logger",
      package_version: "git+https://github.com.invalid",
      file_path: "package.json",
      line_start: 24,
      line_end: 24,
      message: "Package dependency points to raw git repository",
      evidence: '"custom-logger": "git+https://github.com.invalid"',
    },
  ];

  it("groupFindingsByPackageAndFile groups by package then by file correctly", () => {
    const groups = groupFindingsByPackageAndFile(sampleFindings);

    expect(groups).toHaveLength(2);

    // First package: demo-package-exfil
    const pkg1 = groups[0];
    expect(pkg1.packageName).toBe("demo-package-exfil");
    expect(pkg1.ecosystem).toBe("npm");
    expect(pkg1.version).toBe("1.0.4");
    expect(pkg1.files).toHaveLength(2);
    expect(pkg1.files[0].filePath).toBe("package.json");
    expect(pkg1.files[0].findings).toHaveLength(1);
    expect(pkg1.files[1].filePath).toBe("setup.js");
    expect(pkg1.files[1].findings).toHaveLength(1);

    // Second package: custom-logger
    const pkg2 = groups[1];
    expect(pkg2.packageName).toBe("custom-logger");
    expect(pkg2.files).toHaveLength(1);
    expect(pkg2.files[0].filePath).toBe("package.json");
    expect(pkg2.files[0].findings).toHaveLength(1);
  });

  it("groupFindingsByPackageAndFile handles empty findings array", () => {
    const groups = groupFindingsByPackageAndFile([]);
    expect(groups).toEqual([]);
  });

  it("groupFindingsByPackageAndFile falls back to 'Root Project' when package_name is missing", () => {
    const rootFinding: FindingResponse = {
      id: "f4",
      rule_id: "GLOBAL_SCRIPT",
      severity: "LOW",
      weight: 10,
      file_path: "Makefile",
      line_start: 1,
      line_end: 5,
      message: "Root makefile script",
    };
    const groups = groupFindingsByPackageAndFile([rootFinding]);
    expect(groups[0].packageName).toBe("Root Project");
    expect(groups[0].files[0].filePath).toBe("Makefile");
  });

  it("renders empty state message when findings array is empty", () => {
    render(<FindingList findings={[]} />);
    expect(
      screen.getByText("No suspicious heuristics identified")
    ).toBeDefined();
  });

  it("renders grouped packages, files, severity badges, and toggleable evidence block", () => {
    render(<FindingList findings={sampleFindings} />);

    // Package names rendered
    expect(screen.getByText("demo-package-exfil")).toBeDefined();
    expect(screen.getByText("custom-logger")).toBeDefined();

    // File paths rendered
    expect(screen.getByText("setup.js")).toBeDefined();

    // Rule names and line numbers rendered
    expect(screen.getByText("INSTALL_SCRIPT_NETWORK")).toBeDefined();
    expect(screen.getByText("L12–L14")).toBeDefined();
    expect(screen.getByText("ENV_SECRET_READ")).toBeDefined();
    expect(screen.getByText("L5–L8")).toBeDefined();

    // Toggle evidence block
    const toggleButtons = screen.getAllByRole("button", { name: /Inspect Raw Evidence/i });
    expect(toggleButtons.length).toBeGreaterThan(0);

    fireEvent.click(toggleButtons[0]);
    expect(screen.getByText('node -e "require(\'https\')"', { exact: false })).toBeDefined();
  });
});
