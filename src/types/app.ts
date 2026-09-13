import type { ComponentType } from "react";

export const APP_IDS = [
  "finder",
  "safari",
  "terminal",
  "notes",
  "calculator",
  "settings",
  "activity-monitor",
  "trash",
] as const;

export type AppId = (typeof APP_IDS)[number];

export interface AppWindowDefaults {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  resizable?: boolean;
  x?: number;
  y?: number;
}

export interface AppDefinition {
  id: AppId;
  name: string;
  icon: ComponentType<{ size?: number }>;
  component: ComponentType;
  defaults: AppWindowDefaults;
  singleton?: boolean;
  hideFromDock?: boolean;
  hideFromLaunchpad?: boolean;
}
