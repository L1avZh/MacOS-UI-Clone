import sonomaHorizon from "@/assets/wallpapers/sonoma-horizon.jpg";

export type WallpaperKind = "image" | "gradient";

export interface Wallpaper {
  id: string;
  name: string;
  kind: WallpaperKind;
  /** CSS `background-image` value — a `url(...)` for images, a `linear-/radial-gradient(...)` for gradients. */
  css: string;
  /** Small representative color used for the Settings thumbnail border and menu-bar-on-image contrast checks. */
  swatch: string;
}

export const WALLPAPERS: Wallpaper[] = [
  {
    id: "sonoma-horizon",
    name: "Sonoma Horizon",
    kind: "image",
    css: `url(${sonomaHorizon})`,
    swatch: "#d98a5f",
  },
  {
    id: "twilight",
    name: "Twilight",
    kind: "gradient",
    css: "linear-gradient(160deg, #1c1c3c 0%, #3a1c5c 45%, #7a3b6d 75%, #d97a5f 100%)",
    swatch: "#3a1c5c",
  },
  {
    id: "aurora",
    name: "Aurora",
    kind: "gradient",
    css: "linear-gradient(135deg, #0f2027 0%, #203a43 40%, #2c9e8f 75%, #6fe3c6 100%)",
    swatch: "#2c9e8f",
  },
  {
    id: "sunrise",
    name: "Sunrise",
    kind: "gradient",
    css: "linear-gradient(160deg, #ff9a5a 0%, #ff6a88 45%, #a75cff 100%)",
    swatch: "#ff6a88",
  },
  {
    id: "graphite",
    name: "Graphite",
    kind: "gradient",
    css: "linear-gradient(160deg, #3a3a3f 0%, #1a1a1d 100%)",
    swatch: "#2a2a2d",
  },
  {
    id: "mono-light",
    name: "Cloud",
    kind: "gradient",
    css: "linear-gradient(160deg, #eef1f5 0%, #cfd9e6 100%)",
    swatch: "#cfd9e6",
  },
];

export function getWallpaper(id: string): Wallpaper {
  return WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0]!;
}
