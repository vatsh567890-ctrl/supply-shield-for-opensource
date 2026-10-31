import { test, expect } from "@playwright/test";

test.describe("SupplyShield Smoke Test Suite", () => {
  test("landing page renders with hero, 3D shield section, and how it works", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Supply\s*Shield/i);
    await expect(page.locator("h1")).toContainText("Supply Shield");
    await expect(page.locator("#how-it-works")).toBeAttached();
    await expect(page.getByText("Sign in with GitHub").first()).toBeVisible();
    await expect(page.getByText(/Supply\s*Shield never executes the code it checks/i).first()).toBeVisible();
  });

  test("login page renders with authentication controls and security pledge", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/Sign in \| SupplyShield/i);
    await expect(page.locator("h1")).toContainText("Sign in");
    await expect(page.getByText("Sign in with GitHub")).toBeVisible();
    await expect(page.getByText(/SupplyShield reads/i)).toBeVisible();
    await expect(page.getByText(/SupplyShield never executes/i)).toBeVisible();
  });

  test("unauthenticated visit to a dashboard route redirects to /login", async ({ page }) => {
    await page.goto("/repos");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("h1")).toContainText("Sign in");
  });

  test("mock-mode sign in button sets session cookies and navigates to overview", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Sign in");

    // Click "Sign in with GitHub" button
    await page.getByRole("button", { name: "Sign in with GitHub" }).click();

    // Verify navigation to /overview
    await expect(page).toHaveURL(/\/overview/);

    // Verify session cookies were set
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "ss_session");
    const demoCookie = cookies.find((c) => c.name === "ss_demo");
    expect(sessionCookie?.value).toBe("mock-dev-session");
    expect(demoCookie?.value).toBe("1");
  });
});
