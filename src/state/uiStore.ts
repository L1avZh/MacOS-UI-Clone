import { create } from "zustand";

export interface ContextMenuItem {
  id: string;
  label?: string;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  onSelect?: () => void;
}

export interface ContextMenuState {
  x: number;
  y: number;
  items: ContextMenuItem[];
}

interface UiState {
  locked: boolean;
  spotlightOpen: boolean;
  launchpadOpen: boolean;
  controlCenterOpen: boolean;
  notificationCenterOpen: boolean;
  activeMenuBarMenu: string | null;
  contextMenu: ContextMenuState | null;

  unlock: () => void;
  lock: () => void;
  setSpotlightOpen: (open: boolean) => void;
  toggleSpotlight: () => void;
  setLaunchpadOpen: (open: boolean) => void;
  toggleLaunchpad: () => void;
  setControlCenterOpen: (open: boolean) => void;
  setNotificationCenterOpen: (open: boolean) => void;
  toggleNotificationCenter: () => void;
  setActiveMenuBarMenu: (id: string | null) => void;
  openContextMenu: (menu: ContextMenuState) => void;
  closeContextMenu: () => void;
  closeAllOverlays: () => void;
}

/** Only one floating overlay is ever meant to be on screen at once — opening
 * any of these dismisses the rest, the same way real macOS closes Control
 * Center when you invoke Spotlight, or closes a menu when you open another. */
const ALL_OVERLAYS_CLOSED = {
  spotlightOpen: false,
  launchpadOpen: false,
  controlCenterOpen: false,
  notificationCenterOpen: false,
  activeMenuBarMenu: null as string | null,
  contextMenu: null as ContextMenuState | null,
};

export const useUiStore = create<UiState>((set) => ({
  locked: true,
  ...ALL_OVERLAYS_CLOSED,

  unlock: () => set({ locked: false }),
  lock: () => set({ locked: true, ...ALL_OVERLAYS_CLOSED }),

  setSpotlightOpen: (open) => set(open ? { ...ALL_OVERLAYS_CLOSED, spotlightOpen: true } : { spotlightOpen: false }),
  toggleSpotlight: () => set((s) => (s.spotlightOpen ? { spotlightOpen: false } : { ...ALL_OVERLAYS_CLOSED, spotlightOpen: true })),

  setLaunchpadOpen: (open) => set(open ? { ...ALL_OVERLAYS_CLOSED, launchpadOpen: true } : { launchpadOpen: false }),
  toggleLaunchpad: () => set((s) => (s.launchpadOpen ? { launchpadOpen: false } : { ...ALL_OVERLAYS_CLOSED, launchpadOpen: true })),

  setControlCenterOpen: (open) => set(open ? { ...ALL_OVERLAYS_CLOSED, controlCenterOpen: true } : { controlCenterOpen: false }),

  setNotificationCenterOpen: (open) => set(open ? { ...ALL_OVERLAYS_CLOSED, notificationCenterOpen: true } : { notificationCenterOpen: false }),
  toggleNotificationCenter: () =>
    set((s) => (s.notificationCenterOpen ? { notificationCenterOpen: false } : { ...ALL_OVERLAYS_CLOSED, notificationCenterOpen: true })),

  // Menu-bar dropdowns and the desktop/dock context menu are allowed to
  // replace each other without going through the "close everything" reset —
  // Menu.tsx already handles switching between File/Edit/View on hover, and
  // a context menu is expected to coexist with... nothing else, so opening
  // one still clears the other overlay types.
  setActiveMenuBarMenu: (id) => set(id ? { ...ALL_OVERLAYS_CLOSED, activeMenuBarMenu: id } : { activeMenuBarMenu: null }),
  openContextMenu: (menu) => set({ ...ALL_OVERLAYS_CLOSED, contextMenu: menu }),
  closeContextMenu: () => set({ contextMenu: null }),

  closeAllOverlays: () => set(ALL_OVERLAYS_CLOSED),
}));
