import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Several tests drive real pointer-drag gestures with tight frame-by-frame
  // timing expectations. Under CI's typically 2-core runners, several
  // parallel Chromium instances competing for that CPU can starve a
  // gesture's event loop turn between pointermove steps — not a product bug,
  // but a real source of flakiness. Serial execution in CI trades a few
  // seconds of wall-clock time for that reliability; local runs stay
  // parallel for fast iteration.
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run preview -- --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
