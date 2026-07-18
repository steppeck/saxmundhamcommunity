import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const path of [
  "/",
  "/report",
  "/reports",
  "/statistics",
  "/how-it-works",
  "/privacy",
  "/accessibility",
]) {
  test(`${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      results.violations.filter((item) =>
        ["serious", "critical"].includes(item.impact || ""),
      ),
    ).toEqual([]);
  });
}

test("report answers persist after going back", async ({ page }) => {
  await page.goto("/report");
  await page.locator("#incidentDate").fill("2026-07-01");
  await page.locator("#approximateTime").fill("01:30");
  await page.getByLabel("Town centre and station").check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.locator("#incidentDate")).toHaveValue("2026-07-01");
});

test("report validation is clearly identified", async ({ page }) => {
  await page.goto("/report");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator("#error-summary")).toContainText(
    "Check your answers",
  );
  await expect(page.getByText("Enter the date.").first()).toBeVisible();
});
