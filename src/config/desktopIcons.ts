import type { AppId } from "@/types/app";

export interface DesktopIconDefinition {
  id: string;
  label: string;
  /** App this icon launches on double-click, if any. */
  appId?: AppId;
  glyph: "drive" | "trash" | "document" | "folder";
}

export const DESKTOP_ICONS: DesktopIconDefinition[] = [
  { id: "macintosh-hd", label: "Macintosh HD", appId: "finder", glyph: "drive" },
  { id: "readme", label: "About This Project", glyph: "document" },
  { id: "trash", label: "Trash", appId: "trash", glyph: "trash" },
];

export const README_CONTENT = `macOS UI Clone

This desktop is a browser-based simulation inspired by macOS. Nothing here
touches your real computer — windows, files, and settings all live in this
tab (and in your browser's local storage, on this device only).

Try:
  - Double-click Macintosh HD to open Finder
  - Cmd/Ctrl + Space to open Spotlight search
  - Right-click the desktop for more options
  - The Dock at the bottom to launch apps
`;
