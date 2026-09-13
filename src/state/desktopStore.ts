import { create } from "zustand";
import { DESKTOP_ICONS, type DesktopIconDefinition } from "@/config/desktopIcons";
import { createId } from "@/utils/id";
import { readStorage, writeStorage } from "@/utils/storage";

export interface IconPosition {
  x: number;
  y: number;
}

const POSITIONS_KEY = "macos-ui-clone:desktop-icon-positions";
const CUSTOM_ICONS_KEY = "macos-ui-clone:desktop-custom-icons";
const GRID_X = 108;
const GRID_Y = 116;
const START_X = 24;
const START_Y = 40;
const COLUMN_CAPACITY = 6;

function isCustomIcon(value: unknown): value is DesktopIconDefinition {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === "string" && typeof v.label === "string" && v.glyph === "folder";
}

function loadCustomIcons(): DesktopIconDefinition[] {
  const stored = readStorage<unknown[]>(CUSTOM_ICONS_KEY, []);
  return Array.isArray(stored) ? stored.filter(isCustomIcon) : [];
}

function defaultPositionFor(index: number): IconPosition {
  const column = Math.floor(index / COLUMN_CAPACITY);
  const row = index % COLUMN_CAPACITY;
  return { x: START_X + column * GRID_X, y: START_Y + row * GRID_Y };
}

function loadPositions(allIcons: DesktopIconDefinition[]): Record<string, IconPosition> {
  const stored = readStorage<Record<string, IconPosition>>(POSITIONS_KEY, {});
  const merged: Record<string, IconPosition> = {};
  allIcons.forEach((icon, index) => {
    const pos = stored[icon.id];
    merged[icon.id] = pos && typeof pos.x === "number" && typeof pos.y === "number" ? pos : defaultPositionFor(index);
  });
  return merged;
}

interface DesktopState {
  customIcons: DesktopIconDefinition[];
  positions: Record<string, IconPosition>;
  selectedIds: string[];
  allIcons: () => DesktopIconDefinition[];
  moveIcon: (id: string, position: IconPosition) => void;
  select: (ids: string[]) => void;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  addFolder: () => void;
  removeCustomIcon: (id: string) => void;
  arrangeByName: () => void;
  arrangeByKind: () => void;
}

function persistIcons(icons: DesktopIconDefinition[]): void {
  writeStorage(CUSTOM_ICONS_KEY, icons);
}

function persistPositions(positions: Record<string, IconPosition>): void {
  writeStorage(POSITIONS_KEY, positions);
}

const initialCustomIcons = loadCustomIcons();

export const useDesktopStore = create<DesktopState>((set, get) => ({
  customIcons: initialCustomIcons,
  positions: loadPositions([...DESKTOP_ICONS, ...initialCustomIcons]),
  selectedIds: [],

  allIcons: () => [...DESKTOP_ICONS, ...get().customIcons],

  moveIcon: (id, position) => {
    const positions = { ...get().positions, [id]: position };
    persistPositions(positions);
    set({ positions });
  },
  select: (ids) => set({ selectedIds: ids }),
  toggleSelect: (id) => {
    set((state) => ({
      selectedIds: state.selectedIds.includes(id) ? state.selectedIds.filter((s) => s !== id) : [...state.selectedIds, id],
    }));
  },
  clearSelection: () => set({ selectedIds: [] }),

  addFolder: () => {
    const state = get();
    const existingUntitled = state.customIcons.filter((i) => i.label.startsWith("untitled folder")).length;
    const label = existingUntitled === 0 ? "untitled folder" : `untitled folder ${existingUntitled + 1}`;
    const icon: DesktopIconDefinition = { id: createId("folder"), label, glyph: "folder" };
    const customIcons = [...state.customIcons, icon];
    const allCount = DESKTOP_ICONS.length + customIcons.length;
    const positions = { ...state.positions, [icon.id]: defaultPositionFor(allCount - 1) };
    persistIcons(customIcons);
    persistPositions(positions);
    set({ customIcons, positions, selectedIds: [icon.id] });
  },

  removeCustomIcon: (id) => {
    const state = get();
    const customIcons = state.customIcons.filter((i) => i.id !== id);
    persistIcons(customIcons);
    set({ customIcons, selectedIds: state.selectedIds.filter((s) => s !== id) });
  },

  arrangeByName: () => {
    const state = get();
    const sorted = [...state.allIcons()].sort((a, b) => a.label.localeCompare(b.label));
    const positions: Record<string, IconPosition> = {};
    sorted.forEach((icon, index) => {
      positions[icon.id] = defaultPositionFor(index);
    });
    persistPositions(positions);
    set({ positions });
  },

  arrangeByKind: () => {
    const state = get();
    const sorted = [...state.allIcons()].sort((a, b) => a.glyph.localeCompare(b.glyph) || a.label.localeCompare(b.label));
    const positions: Record<string, IconPosition> = {};
    sorted.forEach((icon, index) => {
      positions[icon.id] = defaultPositionFor(index);
    });
    persistPositions(positions);
    set({ positions });
  },
}));

export { GRID_X, GRID_Y };
