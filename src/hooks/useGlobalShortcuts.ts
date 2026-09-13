import { useEffect } from "react";
import { useWindowStore } from "@/state/windowStore";
import { useUiStore } from "@/state/uiStore";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/**
 * App-wide keyboard shortcuts. Registered once at the desktop root.
 * Cmd on macOS, Ctrl elsewhere — both are accepted so the shortcuts work
 * regardless of the host OS the browser runs on.
 */
export function useGlobalShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const ui = useUiStore.getState();

      if (mod && e.code === "Space") {
        e.preventDefault();
        ui.toggleSpotlight();
        return;
      }

      if (e.key === "Escape") {
        if (ui.spotlightOpen || ui.launchpadOpen || ui.controlCenterOpen || ui.notificationCenterOpen || ui.contextMenu || ui.activeMenuBarMenu) {
          e.preventDefault();
          ui.closeAllOverlays();
          return;
        }
      }

      // Everything below acts on the focused window — skip while the user is typing
      // in a form field (e.g. Cmd+W inside a Notes textarea should not close the window
      // unless the field itself has no other meaning for it) except for close/quit,
      // which macOS itself always honors.
      const windows = useWindowStore.getState();
      const focusedId = windows.focusedWindowId();

      if (mod && e.key.toLowerCase() === "w" && focusedId) {
        e.preventDefault();
        windows.close(focusedId);
        return;
      }

      if (mod && e.key.toLowerCase() === "q" && focusedId) {
        e.preventDefault();
        const appId = windows.windows[focusedId]?.appId;
        if (appId) windows.closeApp(appId);
        return;
      }

      if (mod && e.key.toLowerCase() === "m" && focusedId && !isTypingTarget(e.target)) {
        e.preventDefault();
        windows.minimize(focusedId);
        return;
      }

      if (mod && e.key === ",") {
        e.preventDefault();
        windows.open("settings");
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
