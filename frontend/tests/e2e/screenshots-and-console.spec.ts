import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Landing Page Verification: Screenshots and Console Errors", () => {
  const viewports = [
    { width: 360, height: 800, name: "360" },
    { width: 768, height: 1024, name: "768" },
    { width: 1440, height: 900, name: "1440" },
  ];

  for (const vp of viewports) {
    test(`renders cleanly at ${vp.width}px without CSP violations or console errors and captures top & mid-section screenshots`, async ({
      page,
    }) => {
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      page.on("pageerror", (err) => {
        pageErrors.push(err.message);
      });

      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/", { waitUntil: "networkidle" });

      // Ensure 3D canvas or fallback has loaded
      await page.waitForTimeout(1000);

      // Verify zero console errors & zero unhandled exceptions
      expect(consoleErrors).toEqual([]);
      expect(pageErrors).toEqual([]);

      // Screenshot 1: Top of page
      const screenshotDir = path.join(process.cwd(), "test-results", "screenshots");
      await page.screenshot({
        path: path.join(screenshotDir, `landing-${vp.name}-top.png`),
        fullPage: false,
      });

      // Scroll halfway through section C (#how-it-works)
      const sectionC = page.locator("#how-it-works");
      await expect(sectionC).toBeVisible();

      await page.evaluate(() => {
        const el = document.getElementById("how-it-works");
        if (el) {
          const rect = el.getBoundingClientRect();
          const targetY = window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2;
          window.scrollTo({ top: targetY, behavior: "instant" });
        }
      });

      await page.waitForTimeout(500);

      // Screenshot 2: Scrolled halfway through Section C
      await page.screenshot({
        path: path.join(screenshotDir, `landing-${vp.name}-mid.png`),
        fullPage: false,
      });
    });
  }
});

