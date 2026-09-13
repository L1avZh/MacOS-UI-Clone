import { create } from "zustand";
import type { AppId } from "@/types/app";
import type { Rect, WindowInstance } from "@/types/window";
import { createId } from "@/utils/id";
import { getAppDefinition } from "@/apps/registry";

const MENU_BAR_HEIGHT = 28;
const DOCK_RESERVED_HEIGHT = 96;
/** Minimum strip of a window that must stay reachable on screen. */
const MIN_VISIBLE_MARGIN = 80;
/** Must match --motion-fast in tokens.css — the close animation's duration. */
const CLOSE_ANIMATION_MS = 120;

/** Pending "finish closing" timers, keyed by window id, so a window removed
 * some other way (Quit, closeApp) never leaves a stray timer trying to close
 * an id that's already gone. */
const pendingCloseTimers = new Map<string, ReturnType<typeof setTimeout>>();

function clearPendingClose(id: string): void {
  const timer = pendingCloseTimers.get(id);
  if (timer !== undefined) {
    clearTimeout(timer);
    pendingCloseTimers.delete(id);
  }
}

interface OpenOptions {
  title?: string;
  rect?: Partial<Rect>;
}

interface WindowState {
  windows: Record<string, WindowInstance>;
  order: string[];
  topZ: number;
  viewport: { width: number; height: number };
  setViewport: (width: number, height: number) => void;
  open: (appId: AppId, options?: OpenOptions) => string;
  /** Starts the close animation (or removes immediately if `immediate`); the store removes the window when it finishes. */
  requestClose: (id: string, immediate?: boolean) => void;
  close: (id: string) => void;
  closeApp: (appId: AppId) => void;
  focus: (id: string) => void;
  minimize: (id: string) => void;
  restore: (id: string) => void;
  toggleMaximize: (id: string) => void;
  move: (id: string, x: number, y: number) => void;
  resize: (id: string, rect: Rect) => void;
  setTitle: (id: string, title: string) => void;
  focusedWindowId: () => string | null;
  windowsForApp: (appId: AppId) => WindowInstance[];
}

function clampToViewport(rect: Rect, viewport: { width: number; height: number }): Rect {
  const maxX = Math.max(MIN_VISIBLE_MARGIN - rect.width, viewport.width - MIN_VISIBLE_MARGIN);
  const minX = -(rect.width - MIN_VISIBLE_MARGIN);
  const x = Math.min(Math.max(rect.x, minX), maxX);
  const maxY = Math.max(MENU_BAR_HEIGHT, viewport.height - DOCK_RESERVED_HEIGHT - MIN_VISIBLE_MARGIN);
  const y = Math.min(Math.max(rect.y, MENU_BAR_HEIGHT), maxY);
  return { ...rect, x, y };
}

function cascadeOffset(count: number): { x: number; y: number } {
  const step = 28;
  const cycle = count % 8;
  return { x: 80 + step * cycle, y: 60 + step * cycle };
}

export const useWindowStore = create<WindowState>((set, get) => ({
  windows: {},
  order: [],
  topZ: 0,
  viewport: { width: typeof window !== "undefined" ? window.innerWidth : 1280, height: typeof window !== "undefined" ? window.innerHeight : 800 },

  setViewport: (width, height) => {
    set((state) => {
      const windows = { ...state.windows };
      for (const id of Object.keys(windows)) {
        const w = windows[id];
        if (!w || w.maximized) continue;
        windows[id] = { ...w, rect: clampToViewport(w.rect, { width, height }) };
      }
      return { viewport: { width, height }, windows };
    });
  },

  open: (appId, options) => {
    const def = getAppDefinition(appId);
    const state = get();

    if (def.singleton) {
      const existing = Object.values(state.windows).find((w) => w.appId === appId && !w.closing);
      if (existing) {
        get().restore(existing.id);
        return existing.id;
      }
    }

    const id = createId("win");
    const totalOpenWindows = Object.keys(state.windows).length;
    const offset = cascadeOffset(totalOpenWindows);
    const width = options?.rect?.width ?? def.defaults.width;
    const height = options?.rect?.height ?? def.defaults.height;
    const rect = clampToViewport(
      {
        x: options?.rect?.x ?? def.defaults.x ?? offset.x,
        y: options?.rect?.y ?? def.defaults.y ?? offset.y,
        width,
        height,
      },
      state.viewport
    );

    const topZ = state.topZ + 1;
    const instance: WindowInstance = {
      id,
      appId,
      title: options?.title ?? def.name,
      rect,
      restoreRect: null,
      zIndex: topZ,
      minimized: false,
      maximized: false,
      focused: true,
      closing: false,
    };

    set((s) => ({
      windows: {
        ...Object.fromEntries(Object.entries(s.windows).map(([wid, w]) => [wid, { ...w, focused: false }])),
        [id]: instance,
      },
      order: [...s.order, id],
      topZ,
    }));

    return id;
  },

  requestClose: (id, immediate) => {
    const w = get().windows[id];
    if (!w || w.closing) return;

    if (immediate) {
      get().close(id);
      return;
    }

    set((state) => ({ windows: { ...state.windows, [id]: { ...w, closing: true, focused: false } } }));
    const timer = setTimeout(() => {
      pendingCloseTimers.delete(id);
      get().close(id);
    }, CLOSE_ANIMATION_MS);
    pendingCloseTimers.set(id, timer);
  },

  close: (id) => {
    clearPendingClose(id);
    set((state) => {
      const windows = { ...state.windows };
      delete windows[id];
      return { windows, order: state.order.filter((w) => w !== id) };
    });
  },

  closeApp: (appId) => {
    set((state) => {
      const windows = { ...state.windows };
      const removed = new Set<string>();
      for (const [id, w] of Object.entries(windows)) {
        if (w.appId === appId) {
          clearPendingClose(id);
          delete windows[id];
          removed.add(id);
        }
      }
      return { windows, order: state.order.filter((id) => !removed.has(id)) };
    });
  },

  focus: (id) => {
    set((state) => {
      const target = state.windows[id];
      if (!target || target.closing) return state;
      const topZ = state.topZ + 1;
      const windows = Object.fromEntries(
        Object.entries(state.windows).map(([wid, w]) => [
          wid,
          wid === id ? { ...w, focused: true, zIndex: topZ, minimized: false } : { ...w, focused: false },
        ])
      );
      return { windows, topZ };
    });
  },

  minimize: (id) => {
    set((state) => {
      const w = state.windows[id];
      if (!w || w.closing) return state;
      return { windows: { ...state.windows, [id]: { ...w, minimized: true, focused: false } } };
    });
  },

  restore: (id) => {
    get().focus(id);
  },

  toggleMaximize: (id) => {
    set((state) => {
      const w = state.windows[id];
      if (!w || w.closing) return state;
      if (w.maximized) {
        const rect = w.restoreRect ?? w.rect;
        return { windows: { ...state.windows, [id]: { ...w, maximized: false, rect, restoreRect: null } } };
      }
      const rect: Rect = {
        x: 0,
        y: MENU_BAR_HEIGHT,
        width: state.viewport.width,
        height: state.viewport.height - MENU_BAR_HEIGHT,
      };
      return { windows: { ...state.windows, [id]: { ...w, maximized: true, restoreRect: w.rect, rect } } };
    });
  },

  move: (id, x, y) => {
    set((state) => {
      const w = state.windows[id];
      if (!w || w.maximized) return state;
      const rect = clampToViewport({ ...w.rect, x, y }, state.viewport);
      return { windows: { ...state.windows, [id]: { ...w, rect } } };
    });
  },

  resize: (id, rect) => {
    set((state) => {
      const w = state.windows[id];
      if (!w || w.maximized) return state;
      return { windows: { ...state.windows, [id]: { ...w, rect: clampToViewport(rect, state.viewport) } } };
    });
  },

  setTitle: (id, title) => {
    set((state) => {
      const w = state.windows[id];
      if (!w) return state;
      return { windows: { ...state.windows, [id]: { ...w, title } } };
    });
  },

  focusedWindowId: () => {
    const state = get();
    return Object.values(state.windows).find((w) => w.focused)?.id ?? null;
  },

  windowsForApp: (appId) => {
    return Object.values(get().windows).filter((w) => w.appId === appId && !w.closing);
  },
}));
