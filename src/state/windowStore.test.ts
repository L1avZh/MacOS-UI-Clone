import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWindowStore } from "./windowStore";

const initialState = useWindowStore.getState();

beforeEach(() => {
  useWindowStore.setState({ ...initialState, windows: {}, order: [], topZ: 0, viewport: { width: 1280, height: 800 } }, true);
});

describe("windowStore", () => {
  it("opens a new window for an app", () => {
    const id = useWindowStore.getState().open("finder");
    const state = useWindowStore.getState();
    expect(state.windows[id]).toBeDefined();
    expect(state.windows[id]?.appId).toBe("finder");
    expect(state.windows[id]?.focused).toBe(true);
  });

  it("opens independent windows for a non-singleton app", () => {
    const a = useWindowStore.getState().open("finder");
    const b = useWindowStore.getState().open("finder");
    expect(a).not.toBe(b);
    expect(Object.keys(useWindowStore.getState().windows)).toHaveLength(2);
  });

  it("reuses the existing window for a singleton app", () => {
    const a = useWindowStore.getState().open("calculator");
    const b = useWindowStore.getState().open("calculator");
    expect(a).toBe(b);
    expect(Object.keys(useWindowStore.getState().windows)).toHaveLength(1);
  });

  it("focusing a window raises its z-index above the rest", () => {
    const a = useWindowStore.getState().open("finder");
    const b = useWindowStore.getState().open("terminal");
    useWindowStore.getState().focus(a);
    const state = useWindowStore.getState();
    expect(state.windows[a]!.zIndex).toBeGreaterThan(state.windows[b]!.zIndex);
    expect(state.windows[a]!.focused).toBe(true);
    expect(state.windows[b]!.focused).toBe(false);
  });

  it("minimizing hides a window and unfocuses it, restoring brings it back focused", () => {
    const id = useWindowStore.getState().open("notes");
    useWindowStore.getState().minimize(id);
    expect(useWindowStore.getState().windows[id]!.minimized).toBe(true);
    expect(useWindowStore.getState().windows[id]!.focused).toBe(false);

    useWindowStore.getState().restore(id);
    expect(useWindowStore.getState().windows[id]!.minimized).toBe(false);
    expect(useWindowStore.getState().windows[id]!.focused).toBe(true);
  });

  it("toggling maximize saves and restores the previous rect", () => {
    const id = useWindowStore.getState().open("finder");
    const originalRect = useWindowStore.getState().windows[id]!.rect;

    useWindowStore.getState().toggleMaximize(id);
    const maximized = useWindowStore.getState().windows[id]!;
    expect(maximized.maximized).toBe(true);
    expect(maximized.rect).not.toEqual(originalRect);

    useWindowStore.getState().toggleMaximize(id);
    const restored = useWindowStore.getState().windows[id]!;
    expect(restored.maximized).toBe(false);
    expect(restored.rect).toEqual(originalRect);
  });

  it("closing a window removes it entirely", () => {
    const id = useWindowStore.getState().open("finder");
    useWindowStore.getState().close(id);
    expect(useWindowStore.getState().windows[id]).toBeUndefined();
  });

  it("closeApp removes every window belonging to that app", () => {
    const a = useWindowStore.getState().open("finder");
    const b = useWindowStore.getState().open("finder");
    useWindowStore.getState().open("terminal");
    useWindowStore.getState().closeApp("finder");
    const state = useWindowStore.getState();
    expect(state.windows[a]).toBeUndefined();
    expect(state.windows[b]).toBeUndefined();
    expect(Object.keys(state.windows)).toHaveLength(1);
  });

  it("does not move or resize a maximized window", () => {
    const id = useWindowStore.getState().open("finder");
    useWindowStore.getState().toggleMaximize(id);
    const maximizedRect = useWindowStore.getState().windows[id]!.rect;
    useWindowStore.getState().move(id, 999, 999);
    expect(useWindowStore.getState().windows[id]!.rect).toEqual(maximizedRect);
  });

  it("keeps a usable strip of a window on screen when opened near the edge", () => {
    const id = useWindowStore.getState().open("finder", { rect: { x: -5000, y: -5000, width: 720, height: 460 } });
    const rect = useWindowStore.getState().windows[id]!.rect;
    expect(rect.x).toBeGreaterThan(-720);
    expect(rect.y).toBeGreaterThanOrEqual(0);
  });

  it("reports the focused window id", () => {
    const a = useWindowStore.getState().open("finder");
    useWindowStore.getState().open("terminal");
    useWindowStore.getState().focus(a);
    expect(useWindowStore.getState().focusedWindowId()).toBe(a);
  });

  describe("requestClose (animated close)", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("marks the window closing immediately but keeps it until the animation finishes", () => {
      const id = useWindowStore.getState().open("finder");
      useWindowStore.getState().requestClose(id);
      expect(useWindowStore.getState().windows[id]?.closing).toBe(true);
      expect(useWindowStore.getState().windows[id]?.focused).toBe(false);

      vi.advanceTimersByTime(200);
      expect(useWindowStore.getState().windows[id]).toBeUndefined();
    });

    it("removes immediately when reduced motion asks for no animation", () => {
      const id = useWindowStore.getState().open("finder");
      useWindowStore.getState().requestClose(id, true);
      expect(useWindowStore.getState().windows[id]).toBeUndefined();
    });

    it("ignores focus/minimize/maximize on a window that is already closing", () => {
      const id = useWindowStore.getState().open("finder");
      useWindowStore.getState().requestClose(id);

      useWindowStore.getState().focus(id);
      useWindowStore.getState().minimize(id);
      useWindowStore.getState().toggleMaximize(id);

      const w = useWindowStore.getState().windows[id]!;
      expect(w.focused).toBe(false);
      expect(w.minimized).toBe(false);
      expect(w.maximized).toBe(false);
      expect(w.closing).toBe(true);
    });

    it("Dock-style reopen of a closing singleton app creates a fresh window instead of resurrecting the dying one", () => {
      const first = useWindowStore.getState().open("calculator");
      useWindowStore.getState().requestClose(first);

      const second = useWindowStore.getState().open("calculator");
      expect(second).not.toBe(first);
      expect(useWindowStore.getState().windows[second]?.closing).toBe(false);

      vi.advanceTimersByTime(200);
      // The old instance is gone; the fresh one survives untouched.
      expect(useWindowStore.getState().windows[first]).toBeUndefined();
      expect(useWindowStore.getState().windows[second]).toBeDefined();
    });

    it("windowsForApp excludes windows that are closing", () => {
      const id = useWindowStore.getState().open("finder");
      useWindowStore.getState().requestClose(id);
      expect(useWindowStore.getState().windowsForApp("finder")).toHaveLength(0);
    });

    it("closeApp cancels a pending close timer instead of leaving a stray one", () => {
      const id = useWindowStore.getState().open("finder");
      useWindowStore.getState().requestClose(id);
      useWindowStore.getState().closeApp("finder");
      expect(useWindowStore.getState().windows[id]).toBeUndefined();

      // The pending timer, if it fired, would call close() on an id that's
      // already gone — harmless, but let's prove it doesn't throw or resurrect anything.
      expect(() => vi.advanceTimersByTime(500)).not.toThrow();
      expect(useWindowStore.getState().windows[id]).toBeUndefined();
    });

    it("calling requestClose twice on the same window does not double-schedule removal", () => {
      const id = useWindowStore.getState().open("finder");
      useWindowStore.getState().requestClose(id);
      useWindowStore.getState().requestClose(id);
      vi.advanceTimersByTime(200);
      expect(useWindowStore.getState().windows[id]).toBeUndefined();
    });
  });
});
