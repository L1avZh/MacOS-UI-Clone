import type { AppId } from "./app";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowInstance {
  id: string;
  appId: AppId;
  title: string;
  rect: Rect;
  restoreRect: Rect | null;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
  focused: boolean;
  /** True while the close animation plays; the window is removed from the store when it finishes. */
  closing: boolean;
}
