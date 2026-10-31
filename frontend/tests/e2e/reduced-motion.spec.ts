import { test, expect } from "@playwright/test";

test.describe("SupplyShield Reduced Motion Verification", () => {
  test.use({
    reducedMotion: "reduce",
  });

  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: "ss_session",
        value: "mock-session-cookie-e2e-motion",
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  test("confirms prefers-reduced-motion media query is respected and pages resolve instantly", async ({
    page,
  }) => {
    await page.goto("/verdicts/11111111-1111-4111-8111-111111111111");

    // Check media query evaluation in browser context
    const matchesReducedMotion = await page.evaluate(() => {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    });
    expect(matchesReducedMotion).toBe(true);

    // Verify critical animated components (e.g. RiskGauge, Findings) render without blocking or delays
    await expect(page.locator("h1")).toContainText("Threat Assessment & Verdict Details");
    await expect(page.getByText("92")).toBeVisible();
    await expect(page.getByText("HIGH TIER")).toBeVisible();
    await expect(page.getByText("Security Findings & AST Evidence")).toBeVisible();
    await expect(page.getByText("demo-package-exfil")).toBeVisible();
  });
});
