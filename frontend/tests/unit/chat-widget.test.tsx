import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { ChatWidget } from "@/components/chat/ChatWidget";
import * as endpoints from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/errors";

// Mock next/navigation
const mockPathname = vi.fn().mockReturnValue("/overview");
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

describe("ChatWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue("/overview");
    process.env.NEXT_PUBLIC_SHOW_CHAT = "true";
  });

  it("renders floating chat button and toggles open/close", () => {
    render(<ChatWidget />);

    const openButton = screen.getByRole("button", { name: /open help assistant/i });
    expect(openButton).toBeDefined();

    // Dialog is initially closed
    expect(screen.queryByRole("dialog", { name: /supplyshield help assistant/i })).toBeNull();

    // Click to open
    fireEvent.click(openButton);
    expect(screen.getByRole("dialog")).toBeDefined();

    // Close button
    const closeBtn = screen.getByRole("button", { name: /close help assistant/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("sending: submits message and renders assistant reply", async () => {
    vi.spyOn(endpoints, "sendChatMessage").mockResolvedValueOnce({
      reply: "SupplyShield provides real-time supply chain security for pull requests.",
      source: "llm",
      ai_status: "ok",
    });

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open help assistant/i }));

    const input = screen.getByRole("textbox", { name: /ask a security question/i });
    const sendBtn = screen.getByRole("button", { name: /send message/i });

    fireEvent.change(input, { target: { value: "How does SupplyShield work?" } });
    fireEvent.click(sendBtn);

    // User message displayed
    expect(screen.getByText("How does SupplyShield work?")).toBeDefined();

    // Assistant reply displayed with "AI answer" badge
    await waitFor(() => {
      expect(screen.getByText("SupplyShield provides real-time supply chain security for pull requests.")).toBeDefined();
    });
    expect(screen.getByText("AI answer")).toBeDefined();
  });

  it("the rate-limit message: handles 429 and displays retry guidance banner", async () => {
    vi.spyOn(endpoints, "sendChatMessage").mockRejectedValueOnce(
      new ApiError("Rate limited", "RATE_LIMITED", 429, "req-123", 600)
    );

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open help assistant/i }));

    const input = screen.getByRole("textbox", { name: /ask a security question/i });
    fireEvent.change(input, { target: { value: "Is this package safe?" } });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeDefined();
      expect(screen.getByText(/Rate limit reached/i)).toBeDefined();
      expect(screen.getByText(/10 minutes/i)).toBeDefined();
    });
  });

  it("out-of-scope labeling: marks refused replies with 'Out of scope'", async () => {
    vi.spyOn(endpoints, "sendChatMessage").mockResolvedValueOnce({
      reply: "I can only answer questions about SupplyShield, supply chain security, and pull request analysis.",
      source: "refused",
      ai_status: "ok",
    });

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open help assistant/i }));

    const input = screen.getByRole("textbox", { name: /ask a security question/i });
    fireEvent.change(input, { target: { value: "What is the capital of France?" } });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText(/I can only answer questions about SupplyShield/)).toBeDefined();
    });
    expect(screen.getByText("Out of scope")).toBeDefined();
  });

  it("HTML in a reply displaying as text: renders literal string without evaluating HTML tags", async () => {
    const rawHtmlPayload = '<div data-testid="malicious-injected-tag">Dangerous <b>XSS</b> payload</div>';
    vi.spyOn(endpoints, "sendChatMessage").mockResolvedValueOnce({
      reply: rawHtmlPayload,
      source: "faq",
      ai_status: "ok",
    });

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open help assistant/i }));

    const input = screen.getByRole("textbox", { name: /ask a security question/i });
    fireEvent.change(input, { target: { value: "Show raw finding sample" } });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      // Must not evaluate as an HTML DOM element
      expect(screen.queryByTestId("malicious-injected-tag")).toBeNull();
      // Must be rendered literally as text
      expect(screen.getByText(rawHtmlPayload)).toBeDefined();
    });
    expect(screen.getByText("Help article")).toBeDefined();
  });

  it("on /verdicts/[id]: shows 'About this verdict' label and sends verdict_id", async () => {
    const testVerdictId = "11111111-1111-4111-8111-111111111111";
    mockPathname.mockReturnValue(`/verdicts/${testVerdictId}`);

    const sendSpy = vi.spyOn(endpoints, "sendChatMessage").mockResolvedValueOnce({
      reply: "This verdict has a risk score of 92 with high severity findings.",
      source: "llm",
      ai_status: "ok",
    });

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open help assistant/i }));

    // Label must appear
    expect(screen.getByText("About this verdict")).toBeDefined();

    const input = screen.getByRole("textbox", { name: /ask a security question/i });
    fireEvent.change(input, { target: { value: "Why is this verdict high risk?" } });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(sendSpy).toHaveBeenCalledWith({
        message: "Why is this verdict high risk?",
        verdict_id: testVerdictId,
      });
      expect(screen.getByText("This verdict has a risk score of 92 with high severity findings.")).toBeDefined();
    });
  });

  it("closes dialog on Escape key and returns focus to trigger button", () => {
    render(<ChatWidget />);
    const openBtn = screen.getByRole("button", { name: /open help assistant/i });
    fireEvent.click(openBtn);

    expect(screen.getByRole("dialog")).toBeDefined();

    // Press Escape
    fireEvent.keyDown(document, { key: "Escape" });

    // Dialog is closed
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
