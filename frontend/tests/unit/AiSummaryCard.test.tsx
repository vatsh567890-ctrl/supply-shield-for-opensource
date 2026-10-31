import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { AiSummaryCard, getAiBadgeText } from "@/components/verdict/AiSummaryCard";

describe("AiSummaryCard", () => {
  it("returns correct badge text for all three AI states", () => {
    expect(getAiBadgeText("ok")).toBe("AI summary");
    expect(getAiBadgeText("disabled")).toBe("Rule-based summary");
    expect(getAiBadgeText("unavailable")).toBe("AI unavailable");
  });

  it("renders 'AI summary' badge when status is 'ok'", () => {
    render(
      <AiSummaryCard
        aiStatus="ok"
        intentSummary="Exfiltration lifecycle hook in postinstall"
        plainEnglishExplanation="The pull request modifies package.json to add a postinstall hook."
      />
    );
    expect(screen.getByText("AI summary")).toBeDefined();
    expect(screen.getByText("Exfiltration lifecycle hook in postinstall")).toBeDefined();
    expect(
      screen.getByText("The pull request modifies package.json to add a postinstall hook.")
    ).toBeDefined();
  });

  it("renders 'Rule-based summary' badge when status is 'disabled'", () => {
    render(
      <AiSummaryCard
        aiStatus="disabled"
        plainEnglishExplanation="Standard AST rules triggered on dependency version bump."
      />
    );
    expect(screen.getByText("Rule-based summary")).toBeDefined();
    expect(
      screen.getByText("Standard AST rules triggered on dependency version bump.")
    ).toBeDefined();
    expect(screen.queryByText("Corroborated Package Intent")).toBeNull();
  });

  it("renders 'AI unavailable' badge when status is 'unavailable'", () => {
    render(
      <AiSummaryCard
        aiStatus="unavailable"
        plainEnglishExplanation="Deterministic static checks completed. Fallback to rule-based engine."
      />
    );
    expect(screen.getByText("AI unavailable")).toBeDefined();
    expect(
      screen.getByText("Deterministic static checks completed. Fallback to rule-based engine.")
    ).toBeDefined();
  });

  it("renders default fallback explanation when explanation is omitted", () => {
    render(<AiSummaryCard aiStatus="ok" />);
    expect(
      screen.getByText(
        "Deterministic static checks completed. No malicious obfuscation, abnormal maintainer transfer, or unauthorized network calls identified."
      )
    ).toBeDefined();
  });
});
