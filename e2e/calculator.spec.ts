import { expect, test } from "@playwright/test";
import { bootDesktop } from "./utils";

test("calculator computes results via button clicks", async ({ page }) => {
  await bootDesktop(page);
  const dock = page.getByRole("toolbar", { name: "Dock" });

  await dock.getByRole("button", { name: "Calculator" }).click();
  const calc = page.getByRole("dialog", { name: "Calculator" });

  await calc.getByRole("button", { name: "9", exact: true }).click();
  await calc.getByRole("button", { name: "×", exact: true }).click();
  await calc.getByRole("button", { name: "9", exact: true }).click();
  await calc.getByRole("button", { name: "=", exact: true }).click();

  await expect(calc.locator(".calculator-display")).toHaveText("81");
});

test("calculator supports keyboard input while focused", async ({ page }) => {
  await bootDesktop(page);
  const dock = page.getByRole("toolbar", { name: "Dock" });

  await dock.getByRole("button", { name: "Calculator" }).click();
  const calc = page.getByRole("dialog", { name: "Calculator" });
  await calc.click();
  await page.keyboard.type("12+8");
  await page.keyboard.press("Enter");

  await expect(calc.locator(".calculator-display")).toHaveText("20");
});
