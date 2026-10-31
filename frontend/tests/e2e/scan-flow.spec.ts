import { test, expect } from "@playwright/test";

test.describe("SupplyShield Scan Demo Flow E2E", () => {
  test("unauthenticated visitor starts at landing page, runs demo scan for PR #482, and reaches high-risk verdict", async ({
    page,
    context,
  }) => {
    // Ensure clean state with no auth session
    await context.clearCookies();

    // 1. Start at landing page /
    await page.goto("/");
    await expect(page).toHaveTitle(/SupplyShield/);

    // 2. Click "Try a demo scan"
    const demoBtn = page.getByRole("link", { name: /Try a demo scan/i });
    await expect(demoBtn).toBeVisible();
    await demoBtn.click();

    // 3. Verify /scan loads without being redirected to /login
    await expect(page).toHaveURL(/\/scan\?demo=1/);
    await expect(page.locator("h1")).toContainText("Scan a pull request");
    await expect(page.locator("header:visible").getByText("Demo mode")).toBeVisible();

    // 4. Click the 482 example chip
    const chip482 = page.getByRole("button", { name: /482/ });
    await expect(chip482).toBeVisible();
    await chip482.click();

    // Verify input contains the 482 PR URL
    const input = page.locator("#pr-url-input");
    await expect(input).toHaveValue(
      "https://github.com/acme-corp/cloud-infra-orchestrator/pull/482"
    );

    // 5. Click submit
    const submitBtn = page.getByRole("button", { name: /Scan Pull Request/i });
    await submitBtn.click();

    // 6. Verify navigation to /analyses/{id}
    await expect(page).toHaveURL(/\/analyses\//);
    await expect(page.locator("h1")).toContainText("Analysis in Progress");

    // 7. Watch progress advance through steps
    await expect(page.getByTestId("timeline-step-queued")).toBeVisible();
    await expect(page.getByTestId("timeline-step-fetching_pr")).toBeVisible();

    // 8. Verify automatic navigation to /verdicts/{id} with high risk verdict
    await expect(page).toHaveURL(/\/verdicts\//, { timeout: 25000 });
    await expect(page.getByText("92").first()).toBeVisible();
    await expect(page.getByText(/HIGH/).first()).toBeVisible();
  });

  test("unauthenticated visit to /scan without demo=1 redirects to /login", async ({
    page,
    context,
  }) => {
    // Clear all cookies
    await context.clearCookies();

    // Direct navigation to /scan
    await page.goto("/scan");

    // Must be redirected to /login?from=/scan
    await expect(page).toHaveURL(/\/login\?from=%2Fscan/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
