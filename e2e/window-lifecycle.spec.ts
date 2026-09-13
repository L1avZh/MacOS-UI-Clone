import { expect, test } from "@playwright/test";
import { bootDesktop } from "./utils";

test("a window can be opened, moved, minimized, restored, maximized, and closed", async ({ page }) => {
  await bootDesktop(page);
  const dock = page.getByRole("toolbar", { name: "Dock" });

  await dock.getByRole("button", { name: "Finder" }).click();
  const finderWindow = page.getByRole("dialog", { name: "Finder" });
  await expect(finderWindow).toBeVisible();

  const titlebar = finderWindow.locator(".window-titlebar");
  const box = await titlebar.boundingBox();
  if (!box) throw new Error("titlebar not measurable");
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 80, startY + 40, { steps: 5 });
  await page.mouse.up();
  const movedBox = await finderWindow.boundingBox();
  if (!movedBox) throw new Error("window not measurable after drag");
  // Exact pixel parity with the synthetic mouse path is brittle across browsers;
  // what matters is that the window actually tracked the drag in both axes.
  expect(movedBox.x).toBeGreaterThan(box.x + 40);
  expect(movedBox.y).toBeGreaterThan(box.y + 15);

  await finderWindow.getByRole("button", { name: "Minimize window" }).click();
  await expect(finderWindow).toBeHidden();

  await dock.getByRole("button", { name: "Finder" }).click();
  await expect(finderWindow).toBeVisible();

  await finderWindow.getByRole("button", { name: "Maximize window" }).click();
  await expect(finderWindow).toHaveClass(/maximized/);

  await finderWindow.getByRole("button", { name: "Maximize window" }).click();
  await expect(finderWindow).not.toHaveClass(/maximized/);

  await finderWindow.getByRole("button", { name: "Close window" }).click();
  await expect(finderWindow).toHaveCount(0);
});

test("multiple windows stack with the most recently focused on top", async ({ page }) => {
  await bootDesktop(page);
  const dock = page.getByRole("toolbar", { name: "Dock" });

  await dock.getByRole("button", { name: "Finder" }).click();
  await dock.getByRole("button", { name: "Terminal" }).click();

  const finderWindow = page.getByRole("dialog", { name: "Finder" });
  const terminalWindow = page.getByRole("dialog", { name: "Terminal" });

  await expect(terminalWindow).toHaveClass(/focused/);
  await expect(finderWindow).not.toHaveClass(/focused/);

  // Click Finder's title bar rather than its body: cascaded windows can
  // overlap in the middle, but each title bar stays clear of the others.
  await finderWindow.locator(".window-titlebar").click();
  await expect(finderWindow).toHaveClass(/focused/);
  await expect(terminalWindow).not.toHaveClass(/focused/);
});
