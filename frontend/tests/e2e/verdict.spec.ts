import { test, expect } from "@playwright/test";

test.describe("SupplyShield Verdict Detail Screen E2E", () => {
  test.beforeEach(async ({ context }) => {
    // Session cookie to authenticate dashboard routes
    await context.addCookies([
      {
        name: "ss_session",
        value: "mock-session-cookie-e2e-verdicts",
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  test("verdict page loads all critical security telemetry and components", async ({
    page,
  }) => {
    // Navigate to HIGH risk verdict
    await page.goto("/verdicts/11111111-1111-4111-8111-111111111111");

    // 1. Verify Header and PR Link
    await expect(page.locator("h1")).toContainText("Threat Assessment & Verdict Details");
    const ghLink = page.getByRole("link", { name: /View on GitHub/i });
    await expect(ghLink).toBeVisible();
    await expect(ghLink).toHaveAttribute(
      "href",
      "https://github.com/acme-corp/cloud-infra-orchestrator/pull/142"
    );

    // 2. Verify Hero Row: RiskGauge score & badges
    await expect(page.getByText("92")).toBeVisible();
    await expect(page.getByText("HIGH TIER")).toBeVisible();
    await expect(page.getByTestId("hero-ai-status-badge")).toContainText("AI summary");

    // 3. Verify Deterministic Floor Callout
    await expect(page.getByRole("region", { name: "Security floor notice" })).toBeVisible();
    await expect(page.getByText("Deterministic Security Floor Applied: 85")).toBeVisible();
    await expect(page.getByText("Minimum Baseline", { exact: true })).toBeVisible();

    // 4. Verify AI Summary & Corroborated Package Intent
    await expect(page.getByText("Corroborated Package Intent")).toBeVisible();
    await expect(
      page.getByText(/Malicious postinstall lifecycle script attempting environment variable exfiltration/)
    ).toBeVisible();
    await expect(page.getByText("Plain-English Explanation")).toBeVisible();

    // 5. Verify Network Hosts Panel
    await expect(page.getByText("Outbound Network Hosts")).toBeVisible();
    await expect(
      page.getByText("telemetry.attacker-controlled.invalid", { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText("exfil-node.registry-cache.invalid", { exact: true })
    ).toBeVisible();

    // 6. Verify Changed Files Diff Preview
    await expect(page.getByText("Package Diff Inspection")).toBeVisible();
    await expect(page.getByRole("button", { name: "package.json" })).toBeVisible();
    await expect(page.getByRole("button", { name: "setup.js" })).toBeVisible();

    // 7. Verify Security Findings grouped by package
    await expect(page.getByText("Security Findings & AST Evidence")).toBeVisible();
    await expect(page.getByText("demo-package-exfil")).toBeVisible();
    await expect(page.getByText("INSTALL_SCRIPT_NETWORK")).toBeVisible();
    await expect(page.getByText("ENV_SECRET_READ")).toBeVisible();
  });

  test("override flow: successful override updates timeline optimistically with toast", async ({
    page,
  }) => {
    await page.goto("/verdicts/11111111-1111-4111-8111-111111111111");

    // Click Override Decision
    const overrideBtn = page.getByRole("button", { name: /Override Decision/i });
    await overrideBtn.click();

    // Verify Dialog opened
    await expect(page.getByText("Submit Security Override")).toBeVisible();

    // Select Accept
    await page.getByRole("button", { name: /Accept \(Safe\)/i }).click();

    // Input Justification Reason
    const reasonInput = page.locator("#override-reason");
    const testReason = "Approved by SecOps team under exemption RFC-8891.";
    await reasonInput.fill(testReason);

    // Submit
    const submitBtn = page.getByRole("button", { name: /Confirm Decision/i });
    await submitBtn.click();

    // Dialog should close
    await expect(page.getByText("Submit Security Override")).not.toBeVisible();

    // Success toast should appear
    await expect(page.getByText("Override Recorded")).toBeVisible();

    // Optimistic timeline update should show the new reason and login
    await expect(page.getByTestId("override-timeline")).toContainText(testReason);
    await expect(page.getByTestId("override-timeline")).toContainText("sec-ops-lead");
  });

  test("override flow: error response rolls back optimistic timeline and shows error toast", async ({
    page,
  }) => {
    await page.goto("/verdicts/11111111-1111-4111-8111-111111111111");

    // Click Override Decision
    const overrideBtn = page.getByRole("button", { name: /Override Decision/i });
    await overrideBtn.click();

    // Enter trigger-error in reason to trigger mock 500 error
    const reasonInput = page.locator("#override-reason");
    const failureReason = "trigger-error causing server exception";
    await reasonInput.fill(failureReason);

    // Submit
    const submitBtn = page.getByRole("button", { name: /Confirm Decision/i });
    await submitBtn.click();

    // Error toast should appear
    await expect(page.getByText("Override Submission Failed")).toBeVisible();

    // Timeline must NOT retain the rolled-back failureReason
    await expect(page.getByTestId("override-timeline")).not.toContainText(failureReason);
  });
});
