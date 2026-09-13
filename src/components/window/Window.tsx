import { Suspense, memo, useRef } from "react";
import type { WindowInstance } from "@/types/window";
import type { ResizeHandle } from "@/hooks/useWindowDrag";
import { useWindowDrag } from "@/hooks/useWindowDrag";
import { useWindowStore } from "@/state/windowStore";
import { useSettingsStore } from "@/state/settingsStore";
import { getAppDefinition } from "@/apps/registry";
import type { AppId } from "@/types/app";
import WindowControls from "./WindowControls";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import "./window.css";

const RESIZE_HANDLES: ResizeHandle[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

/**
 * The app's own content, isolated behind React.memo keyed only on `appId`.
 * A window's rect/focus/minimized state changes constantly (drag, resize,
 * clicking between windows) but none of that should ever re-render the app
 * inside it — Finder re-filtering its grid or Terminal re-running its scroll
 * logic on every drag pixel would be exactly the "large component re-render"
 * this is built to avoid.
 */
const WindowContent = memo(function WindowContent({ appId }: { appId: AppId }) {
  const def = getAppDefinition(appId);
  const Component = def.component;
  return (
    <ErrorBoundary appName={def.name}>
      <Suspense fallback={<div className="window-loading">Loading…</div>}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
});

interface WindowProps {
  win: WindowInstance;
}

function Window({ win }: WindowProps) {
  const def = getAppDefinition(win.appId);
  const focus = useWindowStore((s) => s.focus);
  const requestClose = useWindowStore((s) => s.requestClose);
  const minimize = useWindowStore((s) => s.minimize);
  const toggleMaximize = useWindowStore((s) => s.toggleMaximize);
  const move = useWindowStore((s) => s.move);
  const resize = useWindowStore((s) => s.resize);
  const dockPosition = useSettingsStore((s) => s.dockPosition);
  const reduceMotion = usePrefersReducedMotion();
  const elementRef = useRef<HTMLDivElement>(null);

  const { startMove, startResize } = useWindowDrag({
    elementRef,
    rect: win.rect,
    minWidth: def.defaults.minWidth ?? 280,
    minHeight: def.defaults.minHeight ?? 200,
    disabled: win.maximized,
    onMoveCommit: (x, y) => move(win.id, x, y),
    onResizeCommit: (rect) => resize(win.id, rect),
    onDragStart: () => focus(win.id),
  });

  const classes = [
    "window",
    win.focused && "focused",
    win.maximized && "maximized",
    win.minimized && "minimized",
    `minimize-to-${dockPosition}`,
  ]
    .filter(Boolean)
    .join(" ");
  const surfaceClasses = ["window-surface", win.closing && "closing"].filter(Boolean).join(" ");

  return (
    <div
      ref={elementRef}
      className={classes}
      style={{
        transform: `translate(${win.rect.x}px, ${win.rect.y}px)`,
        width: win.rect.width,
        height: win.rect.height,
        zIndex: win.zIndex,
      }}
      role="dialog"
      aria-label={win.title}
      aria-hidden={win.minimized}
      onPointerDown={() => {
        if (!win.focused && !win.minimized) focus(win.id);
      }}
    >
      <div className={surfaceClasses}>
        <div className="window-titlebar" onPointerDown={startMove} onDoubleClick={() => toggleMaximize(win.id)}>
          <WindowControls
            focused={win.focused}
            onClose={() => requestClose(win.id, reduceMotion)}
            onMinimize={() => minimize(win.id)}
            onMaximize={() => toggleMaximize(win.id)}
          />
          <span className="window-title">{win.title}</span>
        </div>
        <div className="window-body">
          <WindowContent appId={win.appId} />
        </div>
      </div>
      {def.defaults.resizable !== false && !win.maximized && (
        <div className="window-resize-handles" data-no-drag>
          {RESIZE_HANDLES.map((handle) => (
            <div key={handle} className={`resize-handle resize-${handle}`} onPointerDown={startResize(handle)} />
          ))}
        </div>
      )}
    </div>
  );
}

function areEqual(prev: WindowProps, next: WindowProps): boolean {
  const a = prev.win;
  const b = next.win;
  return (
    a.id === b.id &&
    a.appId === b.appId &&
    a.title === b.title &&
    a.zIndex === b.zIndex &&
    a.minimized === b.minimized &&
    a.maximized === b.maximized &&
    a.focused === b.focused &&
    a.closing === b.closing &&
    a.rect.x === b.rect.x &&
    a.rect.y === b.rect.y &&
    a.rect.width === b.rect.width &&
    a.rect.height === b.rect.height
  );
}

export default memo(Window, areEqual);
