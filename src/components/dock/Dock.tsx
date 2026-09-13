import { useCallback, useEffect, useRef, useState } from "react";
import { listDockApps } from "@/apps/registry";
import { useWindowStore } from "@/state/windowStore";
import { useSettingsStore } from "@/state/settingsStore";
import { useUiStore } from "@/state/uiStore";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { AppId } from "@/types/app";
import "./dock.css";

const MAGNIFY_RADIUS = 110;
const MAGNIFY_SCALE = 1.6;

const NARROW_VIEWPORT_BREAKPOINT = 700;
const NARROW_VIEWPORT_ICON_SIZE = 40;

export default function Dock() {
  const apps = listDockApps();
  const windows = useWindowStore((s) => s.windows);
  const open = useWindowStore((s) => s.open);
  const focus = useWindowStore((s) => s.focus);
  const closeApp = useWindowStore((s) => s.closeApp);
  const viewportWidth = useWindowStore((s) => s.viewport.width);
  const settingsDockSize = useSettingsStore((s) => s.dockSize);
  const dockSize = viewportWidth <= NARROW_VIEWPORT_BREAKPOINT ? Math.min(settingsDockSize, NARROW_VIEWPORT_ICON_SIZE) : settingsDockSize;
  const dockPosition = useSettingsStore((s) => s.dockPosition);
  const dockAutoHide = useSettingsStore((s) => s.dockAutoHide);
  const dockMagnification = useSettingsStore((s) => s.dockMagnification);
  const openContextMenu = useUiStore((s) => s.openContextMenu);
  const toggleLaunchpad = useUiStore((s) => s.toggleLaunchpad);
  const reduceMotion = usePrefersReducedMotion();

  const [hoverPos, setHoverPos] = useState<number | null>(null);
  const [bouncing, setBouncing] = useState<Record<string, boolean>>({});
  const [revealed, setRevealed] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);
  const mouseMoveFrame = useRef<number | null>(null);

  const magnify = dockMagnification && !reduceMotion;
  const vertical = dockPosition === "left" || dockPosition === "right";

  // A high-poll-rate mouse can fire mousemove far more often than the screen
  // repaints; coalesce to one state update per animation frame so hovering
  // across the dock doesn't ask React to re-render faster than 60fps can show.
  useEffect(() => {
    return () => {
      if (mouseMoveFrame.current !== null) cancelAnimationFrame(mouseMoveFrame.current);
    };
  }, []);

  function windowsFor(appId: AppId) {
    // Exclude windows mid-close-animation: the store still holds them briefly
    // so the CSS transition can finish, but the Dock should treat that as
    // "not open" — otherwise clicking the icon mid-animation resurrects a
    // window that's about to disappear anyway.
    return Object.values(windows).filter((w) => w.appId === appId && !w.closing);
  }

  function launch(appId: AppId) {
    const appWindows = windowsFor(appId);
    if (appWindows.length === 0) {
      setBouncing((b) => ({ ...b, [appId]: true }));
      window.setTimeout(() => setBouncing((b) => ({ ...b, [appId]: false })), 500);
      open(appId);
      return;
    }
    const nonMinimized = appWindows.filter((w) => !w.minimized);
    if (nonMinimized.length > 0) {
      const topMost = nonMinimized.reduce((a, b) => (b.zIndex > a.zIndex ? b : a));
      if (topMost.focused) return; // already frontmost — real Finder just no-ops
      focus(topMost.id);
    } else {
      focus(appWindows[0]!.id);
    }
  }

  const latestHoverPos = useRef<number | null>(null);
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!magnify || !dockRef.current) return;
      const rect = dockRef.current.getBoundingClientRect();
      latestHoverPos.current = vertical ? e.clientY - rect.top : e.clientX - rect.left;
      if (mouseMoveFrame.current !== null) return;
      mouseMoveFrame.current = requestAnimationFrame(() => {
        mouseMoveFrame.current = null;
        setHoverPos(latestHoverPos.current);
      });
    },
    [magnify, vertical]
  );

  function scaleFor(index: number, count: number) {
    if (!magnify || hoverPos === null) return 1;
    const gap = 8;
    const iconCenter = index * (dockSize + gap) + dockSize / 2 + gap / 2;
    const distance = Math.abs(hoverPos - iconCenter);
    if (distance > MAGNIFY_RADIUS) return 1;
    const factor = 1 - distance / MAGNIFY_RADIUS;
    return 1 + factor * (MAGNIFY_SCALE - 1) * (1 - index / (count * 8));
  }

  return (
    <>
      {dockAutoHide && (
        <div
          className={`dock-hover-zone dock-hover-zone-${dockPosition}`}
          onMouseEnter={() => setRevealed(true)}
        />
      )}
      <div
        className={`dock-wrapper dock-${dockPosition} ${dockAutoHide && !revealed ? "hidden" : ""}`}
        onMouseLeave={() => {
          setHoverPos(null);
          if (dockAutoHide) setRevealed(false);
        }}
      >
        <div className="dock" ref={dockRef} onMouseMove={handleMouseMove} role="toolbar" aria-label="Dock">
          {apps.map((app, i) => {
            const appWindows = windowsFor(app.id);
            const isOpen = appWindows.length > 0;
            const isFocused = appWindows.some((w) => w.focused);
            const Icon = app.icon;
            const scale = scaleFor(i, apps.length);
            return (
              <div key={app.id} className="dock-item-wrapper" style={{ transform: `scale(${scale})` }}>
                <button
                  type="button"
                  className={`dock-item ${bouncing[app.id] ? "bouncing" : ""}`}
                  onClick={() => launch(app.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    openContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      items: [
                        { id: "open", label: "Open", onSelect: () => launch(app.id) },
                        { id: "sep", separator: true },
                        { id: "quit", label: "Quit", disabled: !isOpen, onSelect: () => closeApp(app.id) },
                      ],
                    });
                  }}
                  aria-label={app.name}
                  title={app.name}
                >
                  <Icon size={dockSize} />
                </button>
                {isOpen && <span className={`dock-indicator ${isFocused ? "focused" : ""}`} />}
                <span className="dock-tooltip">{app.name}</span>
              </div>
            );
          })}
          <span className="dock-divider" />
          <div className="dock-item-wrapper">
            <button type="button" className="dock-item" onClick={toggleLaunchpad} aria-label="Launchpad" title="Launchpad">
              <div className="dock-launchpad-icon" style={{ width: dockSize, height: dockSize }}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <span key={i} />
                ))}
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
