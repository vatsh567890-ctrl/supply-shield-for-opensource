import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import ErrorBoundary from "@/app/error";

describe("ErrorBoundary", () => {
  const mockReset = vi.fn();

  beforeEach(() => {
    mockReset.mockClear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("in development (NODE_ENV=development): displays real error message and logs to console", () => {
    vi.stubEnv("NODE_ENV", "development");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const testError = new Error("Specific fatal component parse error at runtime");

    render(<ErrorBoundary error={testError} reset={mockReset} />);

    // Shows real error message
    expect(screen.getByText("Specific fatal component parse error at runtime")).toBeDefined();
    expect(consoleSpy).toHaveBeenCalledWith("ErrorBoundary caught error:", testError);

    // Accessible role="alert"
    const alertBox = screen.getByRole("alert");
    expect(alertBox).toBeDefined();

    // Try again button
    const retryBtn = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryBtn);
    expect(mockReset).toHaveBeenCalled();
  });

  it("in production (NODE_ENV=production): shows generic message and request ID digest, without exposing internal message", () => {
    vi.stubEnv("NODE_ENV", "production");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const testError = Object.assign(new Error("Sensitive internal stack and token details"), {
      digest: "req-digest-12345",
    });

    render(<ErrorBoundary error={testError} reset={mockReset} />);

    // Does NOT show sensitive message
    expect(screen.queryByText("Sensitive internal stack and token details")).toBeNull();
    // Shows generic message
    expect(screen.getByText("An unexpected error occurred while loading this page.")).toBeDefined();
    // Shows request ID digest
    expect(screen.getByText(/Request ID: req-digest-12345/)).toBeDefined();
    // Does NOT log to console in production
    expect(consoleSpy).not.toHaveBeenCalled();
  });
});
