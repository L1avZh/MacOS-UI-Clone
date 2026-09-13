import { useCallback, useRef } from "react";
import type { Rect } from "@/types/window";

export type ResizeHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

interface UseWindowDragOptions {
  rect: Rect;
  minWidth: number;
  minHeight: number;
  disabled?: boolean;
  onMove: (x: number, y: number) => void;
  onResize: (rect: Rect) => void;
  onDragStart?: () => void;
}

/**
 * Drag-to-move and drag-to-resize for a window, driven by the Pointer Events
 * API so a single finger, mouse, or pen all behave the same way. Listeners
 * are attached to `document` only for the lifetime of an active drag so idle
 * windows cost nothing.
 */
export function useWindowDrag({ rect, minWidth, minHeight, disabled, onMove, onResize, onDragStart }: UseWindowDragOptions) {
  const rectRef = useRef(rect);
  rectRef.current = rect;

  const startMove = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest("[data-no-drag]")) return;
      e.preventDefault();
      onDragStart?.();

      const startX = e.clientX;
      const startY = e.clientY;
      const origin = rectRef.current;

      const handleMove = (ev: PointerEvent) => {
        onMove(origin.x + (ev.clientX - startX), origin.y + (ev.clientY - startY));
      };
      const handleUp = () => {
        document.removeEventListener("pointermove", handleMove);
        document.removeEventListener("pointerup", handleUp);
      };
      document.addEventListener("pointermove", handleMove);
      document.addEventListener("pointerup", handleUp);
    },
    [disabled, onMove, onDragStart]
  );

  const startResize = useCallback(
    (handle: ResizeHandle) => (e: React.PointerEvent) => {
      if (disabled || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      onDragStart?.();

      const startX = e.clientX;
      const startY = e.clientY;
      const origin = rectRef.current;

      const handleMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        let { x, y, width, height } = origin;

        if (handle.includes("e")) width = Math.max(minWidth, origin.width + dx);
        if (handle.includes("s")) height = Math.max(minHeight, origin.height + dy);
        if (handle.includes("w")) {
          width = Math.max(minWidth, origin.width - dx);
          x = origin.x + (origin.width - width);
        }
        if (handle.includes("n")) {
          height = Math.max(minHeight, origin.height - dy);
          y = origin.y + (origin.height - height);
        }

        onResize({ x, y, width, height });
      };
      const handleUp = () => {
        document.removeEventListener("pointermove", handleMove);
        document.removeEventListener("pointerup", handleUp);
      };
      document.addEventListener("pointermove", handleMove);
      document.addEventListener("pointerup", handleUp);
    },
    [disabled, minWidth, minHeight, onResize, onDragStart]
  );

  return { startMove, startResize };
}
