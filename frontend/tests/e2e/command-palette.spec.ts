
import { test, expect } from "@playwright/test";

test.describe("SupplyShield Command Palette E2E", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: "ss_session",
        value: "mock-session-cookie-e2e-palette",
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  test("opens via keyboard shortcut Ctrl+K and topbar button", async ({ page }) => {
    await page.goto("/overview");

    // Click topbar trigger button
    const searchBtn = page.getByTestId("command-palette-trigger");
    await expect(searchBtn).toBeVisible();
    await searchBtn.click();

    // Verify command palette modal is displayed
    const palette = page.getByRole("dialog", { name: /Command palette/i });
    await expect(palette).toBeVisible();

    // Close with Escape
    await page.keyboard.press("Escape");
    await expect(palette).not.toBeVisible();

    // Reopen with shortcut
    await page.keyboard.press("Control+k");
    await expect(palette).toBeVisible();
  });

  test("searches pages, repositories from GET /repos, and recent verdicts with arrow key navigation", async ({
    page,
  }) => {
    await page.goto("/overview");

    // Open palette via trigger
    await page.getByTestId("command-palette-trigger").click();
    const palette = page.getByRole("dialog", { name: /Command palette/i });
    await expect(palette).toBeVisible();

    const input = page.getByTestId("command-palette-input");
    await expect(input).toBeVisible();

    const listbox = palette.getByRole("listbox", { name: "Command suggestions" });

    // 1. Search for repositories
    await input.fill("cloud-infra");
    await expect(listbox.getByText("acme-corp/cloud-infra-orchestrator")).toBeVisible();

    // 2. Clear and search for recent verdicts
    await input.fill("Verdict");
    await expect(listbox.getByText(/Verdict: PR #142/i)).toBeVisible();
    await expect(listbox.getByText(/Verdict: PR #88/i)).toBeVisible();

    // 3. Arrow Down to navigate items and press Enter
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // Palette closes and navigates to the selected route
    await expect(page).toHaveURL(/\/verdicts\//);
  });

  test("announces search result counts to screen readers via aria-live", async ({ page }) => {
    await page.goto("/overview");

    await page.getByTestId("command-palette-trigger").click();
    const palette = page.getByRole("dialog", { name: /Command palette/i });
    await expect(palette).toBeVisible();

    const input = page.getByTestId("command-palette-input");
    await expect(input).toBeVisible();

    await input.fill("Repositories");
    // Verify command palette's screen reader live region contains results announcement
    const liveRegion = palette.locator("[aria-live='polite']");
    await expect(liveRegion).toContainText(/search results available/i);

    // Search for non-existent term
    await input.fill("nonexistentquery12345");
    await expect(liveRegion).toContainText("No results found.");
  });
});
