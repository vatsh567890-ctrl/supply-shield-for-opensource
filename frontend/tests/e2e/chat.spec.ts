import { test, expect } from "@playwright/test";

test.describe("SupplyShield Chat Assistant E2E", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: "ss_session",
        value: "mock-session-cookie-e2e-chat",
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

  test("opens chat on /verdicts/[id], asks 'What does HIGH mean?', and receives FAQ reply", async ({
    page,
  }) => {
    await page.goto("/verdicts/11111111-1111-4111-8111-111111111111");

    // 1. Verify floating chat trigger button is visible
    const chatBtn = page.getByRole("button", { name: "Open help assistant" });
    await expect(chatBtn).toBeVisible();

    // 2. Open chat panel
    await chatBtn.click();

    const dialog = page.getByRole("dialog", { name: "SupplyShield Help Assistant" });
    await expect(dialog).toBeVisible();

    // 3. Verify context labels in header
    await expect(dialog.getByText("About this verdict")).toBeVisible();
    await expect(dialog.getByText("Demo mode")).toBeVisible();

    // 4. Input question
    const input = dialog.getByRole("textbox", { name: "Ask a security question" });
    await expect(input).toBeVisible();
    await input.fill("What does HIGH mean?");

    // 5. Send message
    const sendBtn = dialog.getByRole("button", { name: "Send message" });
    await sendBtn.click();

    // 6. Verify user message appears in list
    await expect(dialog.getByText("What does HIGH mean?")).toBeVisible();

    // 7. Verify assistant reply from FAQ appears with source badge
    await expect(
      dialog.getByText(
        "A HIGH risk verdict indicates critical security issues such as unauthorized network calls, suspicious install scripts, or credential access that should be reviewed before merging."
      )
    ).toBeVisible({ timeout: 10000 });

    await expect(dialog.getByText("Help article")).toBeVisible();

    // 8. Press Escape to close and verify focus returns to trigger button
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(chatBtn).toBeFocused();
  });
});

