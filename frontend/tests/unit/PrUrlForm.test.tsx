import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { PrUrlForm, DEMO_URL_CHIPS } from "@/components/scan/PrUrlForm";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("PrUrlForm Component", () => {
  it("renders the input and all 3 example chips", () => {
    render(<PrUrlForm />);

    const input = screen.getByLabelText(/GitHub Pull Request URL/i);
    expect(input).toBeDefined();

    DEMO_URL_CHIPS.forEach((chip) => {
      expect(screen.getByText(chip.label)).toBeDefined();
    });
  });

  it("fills the input when clicking an example chip", () => {
    render(<PrUrlForm />);

    const input = screen.getByLabelText(
      /GitHub Pull Request URL/i
    ) as HTMLInputElement;

    // Click 482 chip
    const chip482 = screen.getByText(/482/);
    fireEvent.click(chip482);
    expect(input.value).toBe(
      "https://github.com/acme-corp/cloud-infra-orchestrator/pull/482"
    );

    // Click 77 chip
    const chip77 = screen.getByText(/77/);
    fireEvent.click(chip77);
    expect(input.value).toBe("https://github.com/acme-corp/web-tools/pull/77");

    // Click 12 chip
    const chip12 = screen.getByText(/12/);
    fireEvent.click(chip12);
    expect(input.value).toBe("https://github.com/acme-corp/docs-site/pull/12");
  });

  it("shows inline error when URL contains query parameters", async () => {
    render(<PrUrlForm />);
    const input = screen.getByLabelText(/GitHub Pull Request URL/i);

    fireEvent.change(input, {
      target: {
        value: "https://github.com/owner/repo/pull/123?foo=bar",
      },
    });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeDefined();
      expect(screen.getByText(/query parameters/i)).toBeDefined();
    });
  });

  it("shows inline error when URL contains explicit port numbers", async () => {
    render(<PrUrlForm />);
    const input = screen.getByLabelText(/GitHub Pull Request URL/i);

    fireEvent.change(input, {
      target: {
        value: "https://github.com:8443/owner/repo/pull/123",
      },
    });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeDefined();
      expect(screen.getByText(/port numbers/i)).toBeDefined();
    });
  });

  it("shows inline error when URL contains userinfo / credentials", async () => {
    render(<PrUrlForm />);
    const input = screen.getByLabelText(/GitHub Pull Request URL/i);

    fireEvent.change(input, {
      target: {
        value: "https://user:token@github.com/owner/repo/pull/123",
      },
    });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeDefined();
      expect(
        screen.getByText(/user credentials|Invalid GitHub pull request URL/i)
      ).toBeDefined();
    });
  });

  it("shows inline error when URL is a non-GitHub host", async () => {
    render(<PrUrlForm />);
    const input = screen.getByLabelText(/GitHub Pull Request URL/i);

    fireEvent.change(input, {
      target: {
        value: "https://gitlab.com/owner/repo/pull/123",
      },
    });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeDefined();
      expect(
        screen.getByText(/github\.com|Invalid GitHub pull request URL/i)
      ).toBeDefined();
    });
  });

  it("submits valid URL and calls onSubmit callback", async () => {
    const handleSubmit = vi.fn();
    render(<PrUrlForm onSubmit={handleSubmit} />);

    const input = screen.getByLabelText(/GitHub Pull Request URL/i);
    const validUrl = "https://github.com/acme-corp/web-tools/pull/77";

    fireEvent.change(input, { target: { value: validUrl } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
      expect(handleSubmit).toHaveBeenCalledWith(validUrl);
    });
  });
});

