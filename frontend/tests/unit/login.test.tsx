import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import LoginPage from "@/app/login/page";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("LoginPage Authentication Flow", () => {
  const originalEnv = process.env.NEXT_PUBLIC_USE_MOCKS;

  beforeEach(() => {
    mockPush.mockClear();
    vi.restoreAllMocks();
    // Clear cookies
    document.cookie = "ss_session=; path=/; max-age=0";
    document.cookie = "ss_demo=; path=/; max-age=0";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_USE_MOCKS = originalEnv;
  });

  it("in mock mode (NEXT_PUBLIC_USE_MOCKS=true): sets demo session cookie and navigates to /overview without calling API", async () => {
    process.env.NEXT_PUBLIC_USE_MOCKS = "true";
    const fetchSpy = vi.spyOn(global, "fetch");

    render(<LoginPage />);

    const button = screen.getByRole("button", { name: /sign in with github/i });
    fireEvent.click(button);

    // Verify cookies were set
    expect(document.cookie).toContain("ss_session=mock-dev-session");
    expect(document.cookie).toContain("ss_demo=1");

    // Verify router navigation
    expect(mockPush).toHaveBeenCalledWith("/overview");

    // Verify fetch was NOT called
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("when mock mode is off and backend returns 501 NOT_IMPLEMENTED: shows not set up message with demo link", async () => {
    process.env.NEXT_PUBLIC_USE_MOCKS = "false";

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 501,
      headers: new Headers({ "X-Request-ID": "req-uuid-501" }),
      json: async () => ({
        error: {
          code: "NOT_IMPLEMENTED",
          message: "GitHub sign-in is not configured yet.",
          request_id: "req-uuid-501",
        },
      }),
    } as unknown as Response);

    render(<LoginPage />);

    const button = screen.getByRole("button", { name: /sign in with github/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(/GitHub sign-in is not set up yet\./i)
      ).toBeDefined();
    });

    const demoLink = screen.getByRole("link", {
      name: /use the demo scan instead\./i,
    });
    expect(demoLink).toBeDefined();
    expect(demoLink.getAttribute("href")).toBe("/scan?demo=1");

    // Ensure user was not routed or given session
    expect(mockPush).not.toHaveBeenCalled();
    expect(document.cookie).not.toContain("ss_session=mock-dev-session");
  });

  it("when mock mode is off and backend returns unexpected 500 error: shows safe message and request_id", async () => {
    process.env.NEXT_PUBLIC_USE_MOCKS = "false";

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers({ "X-Request-ID": "req-uuid-crash-500" }),
      json: async () => ({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred. Please try again later.",
          request_id: "req-uuid-crash-500",
        },
      }),
    } as unknown as Response);

    render(<LoginPage />);

    const button = screen.getByRole("button", { name: /sign in with github/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(
          /an unexpected error occurred\. please try again later\./i
        )
      ).toBeDefined();
    });

    expect(screen.getByText(/Request ID: req-uuid-crash-500/i)).toBeDefined();

    // Verify no raw json object is shown
    expect(screen.queryByText(/INTERNAL_SERVER_ERROR/)).toBeNull();
  });
});

