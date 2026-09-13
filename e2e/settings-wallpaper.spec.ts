import { expect, test } from "@playwright/test";
import { bootDesktop, unlockDesktop } from "./utils";

test("changing the wallpaper persists across a reload", async ({ page }) => {
  await bootDesktop(page);
  const dock = page.getByRole("toolbar", { name: "Dock" });

  await dock.getByRole("button", { name: "System Settings" }).click();
  const settingsWindow = page.getByRole("dialog", { name: "System Settings" });
  await settingsWindow.getByRole("button", { name: "Wallpaper" }).click();
  await settingsWindow.getByRole("button", { name: "Aurora" }).click();

  const desktop = page.locator(".desktop");
  const before = await desktop.evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(before).toContain("gradient");

  await page.reload();
  await unlockDesktop(page);

  const after = await page.locator(".desktop").evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(after).toBe(before);
  expect(after).toContain("gradient");
});

test("changing theme to dark applies immediately", async ({ page }) => {
  await bootDesktop(page);
  const dock = page.getByRole("toolbar", { name: "Dock" });

  await dock.getByRole("button", { name: "System Settings" }).click();
  const settingsWindow = page.getByRole("dialog", { name: "System Settings" });
  await settingsWindow.getByRole("button", { name: "Appearance" }).click();
  await settingsWindow.getByRole("button", { name: "Dark", exact: true }).click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
