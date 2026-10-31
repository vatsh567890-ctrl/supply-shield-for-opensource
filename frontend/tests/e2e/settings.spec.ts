import { test, expect } from "@playwright/test";

test.describe("Settings Page E2E", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: "ss_session",
        value: "mock-dev-session",
        domain: "localhost",
        path: "/",
      },
      {
        name: "ss_demo",
        value: "1",
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  test("visits /settings in mock mode: renders cleanly with no error overlay or boundary", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.goto("/settings");

    // Ensure error boundary is NOT displayed
    await expect(page.getByText("Security Boundary Intercept")).not.toBeVisible();
    await expect(page.getByText("An error occurred")).not.toBeVisible();

    // Check main elements
    await expect(page.locator("h1")).toContainText("Account & Perimeter Settings");
    await expect(page.getByRole("heading", { name: "Authenticated Identity" })).toBeVisible();
    await expect(page.getByText("sec-ops-lead")).toBeVisible();
    await expect(page.getByText("GitHub App Installations")).toBeVisible();
    await expect(page.getByText("acme-corp")).toBeVisible();
    await expect(page.getByText("Active", { exact: true })).toBeVisible();
    await expect(page.getByText("Suspended")).toBeVisible();

    // Confirm no uncaught page runtime errors
    expect(pageErrors).toEqual([]);
  });

  test("clicking Sign Out clears session cookies and navigates to /login", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByText("sec-ops-lead")).toBeVisible();

    // Click Sign Out button
    await page.getByRole("button", { name: /sign out/i }).click();

    // Verify redirect to /login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("h1")).toContainText("Sign in");

    // Verify session cookies were removed
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "ss_session");
    expect(sessionCookie?.value || "").toBe("");
  });
});
