import type { AppDefinition, AppId } from "@/types/app";
import {
  FinderIcon,
  SafariIcon,
  TerminalIcon,
  NotesIcon,
  CalculatorIcon,
  SettingsIcon,
  ActivityMonitorIcon,
  TrashIcon,
} from "@/icons/AppIcons";
import Finder from "@/apps/finder/Finder";
import Safari from "@/apps/safari/Safari";
import Terminal from "@/apps/terminal/Terminal";
import Notes from "@/apps/notes/Notes";
import Calculator from "@/apps/calculator/Calculator";
import Settings from "@/apps/settings/Settings";
import ActivityMonitor from "@/apps/activity-monitor/ActivityMonitor";
import Trash from "@/apps/trash/Trash";

export const APP_REGISTRY: Record<AppId, AppDefinition> = {
  finder: {
    id: "finder",
    name: "Finder",
    icon: FinderIcon,
    component: Finder,
    defaults: { width: 720, height: 460, minWidth: 480, minHeight: 320, resizable: true },
  },
  safari: {
    id: "safari",
    name: "Safari",
    icon: SafariIcon,
    component: Safari,
    defaults: { width: 800, height: 560, minWidth: 420, minHeight: 320, resizable: true },
  },
  terminal: {
    id: "terminal",
    name: "Terminal",
    icon: TerminalIcon,
    component: Terminal,
    defaults: { width: 620, height: 380, minWidth: 360, minHeight: 220, resizable: true },
  },
  notes: {
    id: "notes",
    name: "Notes",
    icon: NotesIcon,
    component: Notes,
    defaults: { width: 640, height: 440, minWidth: 420, minHeight: 300, resizable: true },
    singleton: true,
  },
  calculator: {
    id: "calculator",
    name: "Calculator",
    icon: CalculatorIcon,
    component: Calculator,
    defaults: { width: 280, height: 420, minWidth: 260, minHeight: 380, resizable: false },
    singleton: true,
  },
  settings: {
    id: "settings",
    name: "System Settings",
    icon: SettingsIcon,
    component: Settings,
    defaults: { width: 620, height: 460, minWidth: 520, minHeight: 380, resizable: true },
    singleton: true,
  },
  "activity-monitor": {
    id: "activity-monitor",
    name: "Activity Monitor",
    icon: ActivityMonitorIcon,
    component: ActivityMonitor,
    defaults: { width: 560, height: 440, minWidth: 460, minHeight: 340, resizable: true },
    singleton: true,
  },
  trash: {
    id: "trash",
    name: "Trash",
    icon: TrashIcon,
    component: Trash,
    defaults: { width: 420, height: 320, minWidth: 320, minHeight: 240, resizable: true },
    singleton: true,
    hideFromDock: true,
    hideFromLaunchpad: true,
  },
};

export function getAppDefinition(id: AppId): AppDefinition {
  const def = APP_REGISTRY[id];
  if (!def) throw new Error(`Unknown app id: ${id}`);
  return def;
}

export function listDockApps(): AppDefinition[] {
  return Object.values(APP_REGISTRY).filter((a) => !a.hideFromDock);
}

export function listLaunchpadApps(): AppDefinition[] {
  return Object.values(APP_REGISTRY).filter((a) => !a.hideFromLaunchpad);
}
