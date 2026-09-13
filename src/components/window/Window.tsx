import { Suspense, useState } from "react";
import type { WindowInstance } from "@/types/window";
import type { ResizeHandle } from "@/hooks/useWindowDrag";
import { useWindowDrag } from "@/hooks/useWindowDrag";
import { useWindowStore } from "@/state/windowStore";
import { getAppDefinition } from "@/apps/registry";
import WindowControls from "./WindowControls";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import "./window.css";

const RESIZE_HANDLES: ResizeHandle[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

interface WindowProps {
  win: WindowInstance;
}

export default function Window({ win }: WindowProps) {
  const def = getAppDefinition(win.appId);
  const focus = useWindowStore((s) => s.focus);
  const close = useWindowStore((s) => s.close);
  const minimize = useWindowStore((s) => s.minimize);
  const toggleMaximize = useWindowStore((s) => s.toggleMaximize);
  const move = useWindowStore((s) => s.move);
  const resize = useWindowStore((s) => s.resize);
  const reduceMotion = usePrefersReducedMotion();
  const [closing, setClosing] = useState(false);

  const { startMove, startResize } = useWindowDrag({
    rect: win.rect,
    minWidth: def.defaults.minWidth ?? 280,
    minHeight: def.defaults.minHeight ?? 200,
    disabled: win.maximized,
    onMove: (x, y) => move(win.id, x, y),
    onResize: (rect) => resize(win.id, rect),
    onDragStart: () => focus(win.id),
  });

  function handleClose() {
    if (reduceMotion) {
      close(win.id);
      return;
    }
    setClosing(true);
    window.setTimeout(() => close(win.id), 160);
  }

  if (win.minimized) return null;

  const Component = def.component;

  return (
    <div
      className={`window ${win.focused ? "focused" : ""} ${closing ? "closing" : ""} ${win.maximized ? "maximized" : ""}`}
      style={{
        transform: `translate(${win.rect.x}px, ${win.rect.y}px)`,
        width: win.rect.width,
        height: win.rect.height,
        zIndex: win.zIndex,
      }}
      role="dialog"
      aria-label={win.title}
      onPointerDown={() => {
        if (!win.focused) focus(win.id);
      }}
    >
      <div className="window-titlebar" onPointerDown={startMove} onDoubleClick={() => toggleMaximize(win.id)}>
        <WindowControls focused={win.focused} onClose={handleClose} onMinimize={() => minimize(win.id)} onMaximize={() => toggleMaximize(win.id)} />
        <span className="window-title">{win.title}</span>
      </div>
      <div className="window-body">
        <ErrorBoundary appName={def.name}>
          <Suspense fallback={<div className="window-loading">Loading…</div>}>
            <Component />
          </Suspense>
        </ErrorBoundary>
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
