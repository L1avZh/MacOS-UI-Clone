import { expect, test } from "@playwright/test";
import { bootDesktop, unlockDesktop } from "./utils";

test("a note survives closing and reopening Notes", async ({ page }) => {
  await bootDesktop(page);
  const dock = page.getByRole("toolbar", { name: "Dock" });

  await dock.getByRole("button", { name: "Notes" }).click();
  const notesWindow = page.getByRole("dialog", { name: "Notes" });
  await notesWindow.getByRole("button", { name: "New note" }).click();

  const editor = notesWindow.getByLabel("Note content");
  await editor.fill("Grocery List\nMilk\nEggs\nBread");
  await expect(notesWindow.getByText("Grocery List").first()).toBeVisible();

  await notesWindow.getByRole("button", { name: "Close window" }).click();
  await expect(notesWindow).toHaveCount(0);

  await dock.getByRole("button", { name: "Notes" }).click();
  await expect(page.getByRole("dialog", { name: "Notes" }).getByText("Grocery List").first()).toBeVisible();
});

test("a note survives a full page reload", async ({ page }) => {
  await bootDesktop(page);
  const dock = page.getByRole("toolbar", { name: "Dock" });

  await dock.getByRole("button", { name: "Notes" }).click();
  const notesWindow = page.getByRole("dialog", { name: "Notes" });
  await notesWindow.getByRole("button", { name: "New note" }).click();
  await notesWindow.getByLabel("Note content").fill("Reload Test Note");
  await expect(notesWindow.getByText("Reload Test Note").first()).toBeVisible();

  await page.reload();
  await unlockDesktop(page);

  await page.getByRole("toolbar", { name: "Dock" }).getByRole("button", { name: "Notes" }).click();
  await expect(page.getByRole("dialog", { name: "Notes" }).getByText("Reload Test Note").first()).toBeVisible();
});
