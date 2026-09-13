import { expect, test } from "@playwright/test";
import { bootDesktop } from "./utils";

test("minimizing a window preserves its in-progress, unsaved state", async ({ page }) => {
  await bootDesktop(page);
  const dock = page.getByRole("toolbar", { name: "Dock" });

  await dock.getByRole("button", { name: "Calculator" }).click();
  const calc = page.getByRole("dialog", { name: "Calculator" });
  await calc.getByRole("button", { name: "7", exact: true }).click();
  await calc.getByRole("button", { name: "7", exact: true }).click();
  await expect(calc.locator(".calculator-display")).toHaveText("77");

  await calc.getByRole("button", { name: "Minimize window" }).click();
  await expect(calc).toBeHidden();

  // Restoring must not have remounted (and reset) the app's own component state.
  await dock.getByRole("button", { name: "Calculator" }).click();
  await expect(calc).toBeVisible();
  await expect(calc.locator(".calculator-display")).toHaveText("77");
});

test("clicking a Dock icon while its window is mid-close does not resurrect it", async ({ page }) => {
  await bootDesktop(page);
  const dock = page.getByRole("toolbar", { name: "Dock" });

  await dock.getByRole("button", { name: "Calculator" }).click();
  const calc = page.getByRole("dialog", { name: "Calculator" });
  await calc.getByRole("button", { name: "Close window" }).click();
  // Click the Dock icon again immediately, before the close animation finishes.
  await dock.getByRole("button", { name: "Calculator" }).click();

  // Whatever happens, it must settle into exactly one clean Calculator window —
  // never zero (icon click ignored) and never a half-closed ghost.
  await expect(page.getByRole("dialog", { name: "Calculator" })).toHaveCount(1);
  await expect(page.getByRole("dialog", { name: "Calculator" })).toBeVisible();
});

test("opening Spotlight dismisses an already-open Control Center", async ({ page }) => {
  await bootDesktop(page);

  await page.getByRole("button", { name: "Control Center" }).click();
  await expect(page.getByRole("dialog", { name: "Control Center" })).toBeVisible();

  await page.getByRole("button", { name: "Spotlight Search" }).click();
  await expect(page.getByRole("dialog", { name: "Spotlight Search" })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Control Center" })).toHaveCount(0);
});

test("Notification Center opens from the menu-bar clock", async ({ page }) => {
  await bootDesktop(page);

  await page.getByRole("button", { name: "Notification Center" }).click();
  await expect(page.getByRole("dialog", { name: "Notification Center" })).toBeVisible();
});
