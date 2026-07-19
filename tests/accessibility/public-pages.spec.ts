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
  "/admin/login",
  "/admin/activate",
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
  await page.locator("#streetName").fill("Station Approach");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Train horn").check();
  await page.getByLabel("Vibration").check();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.locator("#incidentDate")).toHaveValue("2026-07-01");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByLabel("Train horn")).toBeChecked();
  await expect(page.getByLabel("Vibration")).toBeChecked();
});

test("report validation is clearly identified", async ({ page }) => {
  await page.goto("/report");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator("#error-summary")).toContainText(
    "Check your answers",
  );
  await expect(page.locator("#error-summary")).toBeFocused();
  await expect(page.getByText("Enter the date.").first()).toBeVisible();
});

test("public reports page presents a simple timeline", async ({ page }) => {
  await page.goto("/reports");
  await expect(
    page.getByRole("heading", { name: "Report timeline" }),
  ).toBeVisible();
  await expect(
    page.getByRole("list", { name: "Monthly report totals" }),
  ).toBeVisible();
  await expect(page.getByText("Filter reports")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Share" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Email" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy link" })).toBeVisible();
});

test("check answers hides the repeated introduction and requests an updates email", async ({
  page,
}) => {
  await page.goto("/report");
  await page.locator("#incidentDate").fill("2026-07-01");
  await page.locator("#approximateTime").fill("01:30");
  await page.getByLabel("Town centre and station").check();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByLabel("Train horn").check();
  await page.getByLabel("Vibration").check();
  await page.getByLabel("1-5 minutes").check();
  await page.getByLabel("Outdoors").check();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByLabel("Woke me or prevented sleep").check();
  await page.getByLabel("Very disruptive", { exact: true }).check();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByLabel("This was the first time").check();
  await page.getByLabel("Later the same day").check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(
    page.getByRole("heading", { name: "Check your answers" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Tell us what happened" }),
  ).toBeHidden();

  await page
    .getByLabel(
      "I would like to receive email updates about the challenges Saxmundham faces with increased traffic on rail and road.",
    )
    .check();
  await expect(page.getByLabel("Email address for updates")).toBeVisible();
});

test("later report steps use a compact introduction", async ({ page }) => {
  await page.goto("/report");
  await page.locator("#incidentDate").fill("2026-07-01");
  await page.locator("#approximateTime").fill("01:30");
  await page.getByLabel("Town centre and station").check();
  await page.getByRole("button", { name: "Continue" }).click();

  const heading = page.getByRole("heading", {
    name: "Tell us what happened",
  });
  await expect(heading).toBeVisible();
  await expect(heading).toHaveCSS("font-size", "22px");
});
