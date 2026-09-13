import { beforeEach, describe, expect, it } from "vitest";
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
});
