import type { Page } from "@playwright/test";

/**
 * Starts from a clean slate (no persisted state) and unlocks the desktop.
 * Clears storage once via an explicit reload rather than `addInitScript`,
 * which would re-fire (and wipe state) on every later reload a test performs.
 */
export async function bootDesktop(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await unlockDesktop(page);
}

export async function unlockDesktop(page: Page): Promise<void> {
  await page.getByPlaceholder("Enter Password").fill("anything");
  await page.getByRole("button", { name: "Unlock" }).click();
  await page.getByRole("toolbar", { name: "Dock" }).waitFor();
}
