import { useEffect, useRef } from "react";
import Menu, { type MenuItemSpec } from "./Menu";
import { useWindowStore } from "@/state/windowStore";
import { useUiStore } from "@/state/uiStore";
import { useSettingsStore } from "@/state/settingsStore";
import { useClock } from "@/hooks/useClock";
import { getAppDefinition } from "@/apps/registry";
import { AppleGlyph, WifiGlyph, BatteryGlyph, SearchGlyph, ControlCenterGlyph } from "@/icons/Glyphs";
import "./menubar.css";

export default function MenuBar() {
  const windows = useWindowStore((s) => s.windows);
  const focusedId = useWindowStore((s) => s.focusedWindowId());
  const focus = useWindowStore((s) => s.focus);
  const minimize = useWindowStore((s) => s.minimize);
  const close = useWindowStore((s) => s.close);
  const closeApp = useWindowStore((s) => s.closeApp);
  const open = useWindowStore((s) => s.open);
  const toggleMaximize = useWindowStore((s) => s.toggleMaximize);

  const activeMenu = useUiStore((s) => s.activeMenuBarMenu);
  const setActiveMenu = useUiStore((s) => s.setActiveMenuBarMenu);
  const toggleSpotlight = useUiStore((s) => s.toggleSpotlight);
  const controlCenterOpen = useUiStore((s) => s.controlCenterOpen);
  const setControlCenterOpen = useUiStore((s) => s.setControlCenterOpen);
  const lock = useUiStore((s) => s.lock);

  const clock24Hour = useSettingsStore((s) => s.clock24Hour);
  const now = useClock();
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeMenu) return;
    function handlePointerDown(e: PointerEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [activeMenu, setActiveMenu]);

  const focusedWindow = focusedId ? windows[focusedId] : null;
  const focusedAppName = focusedWindow ? getAppDefinition(focusedWindow.appId).name : "Finder";

  const appleItems: MenuItemSpec[] = [
    { id: "about", label: `About This Mac`, onSelect: () => open("settings") },
    { id: "settings", label: "System Settings…", onSelect: () => open("settings"), shortcut: "⌘," },
    { id: "sep1", separator: true },
    { id: "sleep", label: "Sleep", onSelect: () => lock() },
    { id: "logout", label: "Log Out…", onSelect: () => lock() },
    { id: "sep2", separator: true },
    {
      id: "restart",
      label: "Restart…",
      onSelect: () => {
        if (window.confirm("Are you sure you want to restart this demo? Any unsaved settings are kept.")) {
          window.location.reload();
        }
      },
    },
  ];

  const appItems: MenuItemSpec[] = [
    { id: "about-app", label: `About ${focusedAppName}` },
    { id: "sep", separator: true },
    {
      id: "quit",
      label: `Quit ${focusedAppName}`,
      shortcut: "⌘Q",
      disabled: !focusedWindow,
      onSelect: () => focusedWindow && closeApp(focusedWindow.appId),
    },
  ];

  const fileItems: MenuItemSpec[] = [
    {
      id: "new-window",
      label: "New Window",
      shortcut: "⌘N",
      disabled: !focusedWindow,
      onSelect: () => focusedWindow && open(focusedWindow.appId),
    },
    {
      id: "close-window",
      label: "Close Window",
      shortcut: "⌘W",
      disabled: !focusedId,
      onSelect: () => focusedId && close(focusedId),
    },
  ];

  const viewItems: MenuItemSpec[] = [
    {
      id: "fullscreen",
      label: focusedWindow?.maximized ? "Exit Full Screen" : "Enter Full Screen",
      disabled: !focusedId,
      onSelect: () => focusedId && toggleMaximize(focusedId),
    },
  ];

  const openWindows = Object.values(windows);
  const windowItems: MenuItemSpec[] = [
    { id: "minimize", label: "Minimize", shortcut: "⌘M", disabled: !focusedId, onSelect: () => focusedId && minimize(focusedId) },
    { id: "zoom", label: "Zoom", disabled: !focusedId, onSelect: () => focusedId && toggleMaximize(focusedId) },
    ...(openWindows.length > 0
      ? ([{ id: "sep-w", separator: true }, ...openWindows.map((w) => ({
          id: w.id,
          label: `${w.minimized ? "◦ " : w.focused ? "● " : "○ "}${w.title}`,
          onSelect: () => focus(w.id),
        }))] as MenuItemSpec[])
      : []),
  ];

  const helpItems: MenuItemSpec[] = [{ id: "search", label: "Search", onSelect: () => toggleSpotlight() }];

  const timeString = now.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: !clock24Hour,
  });
  const dateString = now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="menubar" ref={barRef} role="menubar">
      <div className="menubar-left">
        <Menu id="apple" label={<AppleGlyph size={15} />} items={appleItems} />
        <Menu id="app" label={focusedAppName} items={appItems} bold />
        <div className="menubar-secondary-menus">
          <Menu id="file" label="File" items={fileItems} />
          <Menu id="edit" label="Edit" items={[{ id: "noop", label: "No selection", disabled: true }]} />
          <Menu id="view" label="View" items={viewItems} />
          <Menu id="window" label="Window" items={windowItems} />
          <Menu id="help" label="Help" items={helpItems} />
        </div>
      </div>
      <div className="menubar-right">
        <button type="button" className="menubar-icon-btn" onClick={toggleSpotlight} aria-label="Spotlight Search">
          <SearchGlyph size={14} />
        </button>
        <span className="menubar-icon-btn menubar-status menubar-status-optional" aria-hidden="true">
          <WifiGlyph size={15} />
        </span>
        <span className="menubar-icon-btn menubar-status menubar-status-optional" aria-hidden="true">
          <BatteryGlyph size={20} level={82} />
        </span>
        <button
          type="button"
          className="menubar-icon-btn"
          onClick={() => setControlCenterOpen(!controlCenterOpen)}
          aria-label="Control Center"
          aria-expanded={controlCenterOpen}
        >
          <ControlCenterGlyph size={14} />
        </button>
        <button type="button" className="menubar-clock" onClick={() => setControlCenterOpen(!controlCenterOpen)}>
          {dateString} {timeString}
        </button>
      </div>
    </div>
  );
}
