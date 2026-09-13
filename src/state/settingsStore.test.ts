import { beforeEach, describe, expect, it } from "vitest";

beforeEach(() => {
  window.localStorage.clear();
  vi.resetModules();
});

describe("settingsStore", () => {
  it("starts with sensible defaults", async () => {
    const { useSettingsStore } = await import("./settingsStore");
    expect(useSettingsStore.getState().theme).toBe("auto");
    expect(useSettingsStore.getState().wallpaperId).toBe("sonoma-horizon");
  });

  it("persists an updated value across a simulated reload", async () => {
    const { useSettingsStore } = await import("./settingsStore");
    useSettingsStore.getState().update("theme", "dark");
    useSettingsStore.getState().update("wallpaperId", "aurora");

    vi.resetModules();
    const reloaded = await import("./settingsStore");
    expect(reloaded.useSettingsStore.getState().theme).toBe("dark");
    expect(reloaded.useSettingsStore.getState().wallpaperId).toBe("aurora");
  });

  it("reset restores every default", async () => {
    const { useSettingsStore } = await import("./settingsStore");
    useSettingsStore.getState().update("theme", "dark");
    useSettingsStore.getState().update("dockSize", 80);
    useSettingsStore.getState().reset();
    expect(useSettingsStore.getState().theme).toBe("auto");
    expect(useSettingsStore.getState().dockSize).toBe(60);
  });

  it("recovers from corrupted localStorage without crashing", async () => {
    window.localStorage.setItem("macos-ui-clone:settings", "not json{{{");
    const { useSettingsStore } = await import("./settingsStore");
    expect(useSettingsStore.getState().theme).toBe("auto");
  });
});
