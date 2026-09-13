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

export const useUiStore = create<UiState>((set) => ({
  locked: true,
  spotlightOpen: false,
  launchpadOpen: false,
  controlCenterOpen: false,
  notificationCenterOpen: false,
  activeMenuBarMenu: null,
  contextMenu: null,

  unlock: () => set({ locked: false }),
  lock: () => set({ locked: true }),
  setSpotlightOpen: (open) => set({ spotlightOpen: open }),
  toggleSpotlight: () => set((s) => ({ spotlightOpen: !s.spotlightOpen, launchpadOpen: false })),
  setLaunchpadOpen: (open) => set({ launchpadOpen: open }),
  toggleLaunchpad: () => set((s) => ({ launchpadOpen: !s.launchpadOpen, spotlightOpen: false })),
  setControlCenterOpen: (open) => set({ controlCenterOpen: open }),
  setNotificationCenterOpen: (open) => set({ notificationCenterOpen: open }),
  toggleNotificationCenter: () => set((s) => ({ notificationCenterOpen: !s.notificationCenterOpen })),
  setActiveMenuBarMenu: (id) => set({ activeMenuBarMenu: id }),
  openContextMenu: (menu) => set({ contextMenu: menu }),
  closeContextMenu: () => set({ contextMenu: null }),
  closeAllOverlays: () =>
    set({
      spotlightOpen: false,
      launchpadOpen: false,
      controlCenterOpen: false,
      notificationCenterOpen: false,
      activeMenuBarMenu: null,
      contextMenu: null,
    }),
}));
