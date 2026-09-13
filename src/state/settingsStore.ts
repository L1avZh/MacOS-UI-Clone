import { create } from "zustand";
import { readStorage, writeStorage } from "@/utils/storage";

export type ThemeMode = "light" | "dark" | "auto";
export type DockPosition = "bottom" | "left" | "right";
export type Language = "en" | "he";

export interface SettingsData {
  wallpaperId: string;
  theme: ThemeMode;
  accent: string;
  dockSize: number;
  dockPosition: DockPosition;
  dockAutoHide: boolean;
  dockMagnification: boolean;
  reduceMotion: boolean;
  highContrast: boolean;
  language: Language;
  clock24Hour: boolean;
  userName: string;
  wifiEnabled: boolean;
  bluetoothEnabled: boolean;
  focusEnabled: boolean;
  brightness: number;
  volume: number;
}

const STORAGE_KEY = "macos-ui-clone:settings";

const DEFAULT_SETTINGS: SettingsData = {
  wallpaperId: "sonoma-horizon",
  theme: "auto",
  accent: "#0a84ff",
  dockSize: 60,
  dockPosition: "bottom",
  dockAutoHide: false,
  dockMagnification: true,
  reduceMotion: false,
  highContrast: false,
  language: "en",
  clock24Hour: false,
  userName: "Guest",
  wifiEnabled: true,
  bluetoothEnabled: true,
  focusEnabled: false,
  brightness: 80,
  volume: 60,
};

interface SettingsState extends SettingsData {
  update: <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => void;
  reset: () => void;
}

function loadInitial(): SettingsData {
  const stored = readStorage<Partial<SettingsData>>(STORAGE_KEY, {});
  return { ...DEFAULT_SETTINGS, ...stored };
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...loadInitial(),
  update: (key, value) => {
    set({ [key]: value } as Pick<SettingsData, typeof key>);
    const { update: _update, reset: _reset, ...data } = get();
    writeStorage(STORAGE_KEY, data);
  },
  reset: () => {
    set(DEFAULT_SETTINGS);
    writeStorage(STORAGE_KEY, DEFAULT_SETTINGS);
  },
}));
