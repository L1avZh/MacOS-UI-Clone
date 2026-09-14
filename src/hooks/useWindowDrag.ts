import { useCallback, useRef } from "react";
import type { Rect } from "@/types/window";

export type ResizeHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

interface UseWindowDragOptions {
  /** The window's own DOM node — mutated directly during the gesture for a zero-re-render drag. */
  elementRef: React.RefObject<HTMLElement>;
  rect: Rect;
  minWidth: number;
  minHeight: number;
  disabled?: boolean;
  onDragStart?: () => void;
  /** Called once, at gesture end, to commit the final position/size to application state. */
  onMoveCommit: (x: number, y: number) => void;
  onResizeCommit: (rect: Rect) => void;
}

/**
 * Drag-to-move and drag-to-resize for a window.
 *
 * The gesture itself never touches React or Zustand state: every pointermove
 * writes straight to the DOM (batched to one write per animation frame), so
 * moving a window costs nothing for the rest of the app — no sibling window
 * re-renders, no re-running the app's own component tree on every pixel.
 * The store is only updated once, when the pointer is released, to persist
 * the final rect.
 */
export function useWindowDrag({ elementRef, rect, minWidth, minHeight, disabled, onDragStart, onMoveCommit, onResizeCommit }: UseWindowDragOptions) {
  const rectRef = useRef(rect);
  rectRef.current = rect;

  const startMove = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest("[data-no-drag]")) return;
      const el = elementRef.current;
      if (!el) return;
      e.preventDefault();
      onDragStart?.();

      const startX = e.clientX;
      const startY = e.clientY;
      const origin = rectRef.current;
      let x = origin.x;
      let y = origin.y;
      let frame: number | null = null;

      // Only promote to its own compositor layer for the lifetime of the
      // gesture — an idle window has no need for the extra GPU memory.
      el.style.willChange = "transform";

      const applyFrame = () => {
        frame = null;
        el.style.transform = `translate(${x}px, ${y}px)`;
      };

      const handleMove = (ev: PointerEvent) => {
        x = origin.x + (ev.clientX - startX);
        y = origin.y + (ev.clientY - startY);
        if (frame === null) frame = requestAnimationFrame(applyFrame);
      };
      const handleUp = () => {
        document.removeEventListener("pointermove", handleMove);
        document.removeEventListener("pointerup", handleUp);
        if (frame !== null) cancelAnimationFrame(frame);
        // Apply the last frame synchronously: if the whole gesture happened
        // within a single animation frame (a very fast flick, or a
        // programmatic drag in a test), the scheduled rAF above may never
        // have gotten a chance to run, leaving the DOM showing the pre-drag
        // position until React's own re-render catches up.
        applyFrame();
        el.style.willChange = "auto";
        onMoveCommit(x, y);
      };
      document.addEventListener("pointermove", handleMove);
      document.addEventListener("pointerup", handleUp);
    },
    [disabled, elementRef, onMoveCommit, onDragStart]
  );

  const startResize = useCallback(
    (handle: ResizeHandle) => (e: React.PointerEvent) => {
      if (disabled || e.button !== 0) return;
      const el = elementRef.current;
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      onDragStart?.();

      const startX = e.clientX;
      const startY = e.clientY;
      const origin = rectRef.current;
      let next: Rect = origin;
      let frame: number | null = null;

      el.style.willChange = "transform, width, height";

      const applyFrame = () => {
        frame = null;
        el.style.transform = `translate(${next.x}px, ${next.y}px)`;
        el.style.width = `${next.width}px`;
        el.style.height = `${next.height}px`;
      };

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

        next = { x, y, width, height };
        if (frame === null) frame = requestAnimationFrame(applyFrame);
      };
      const handleUp = () => {
        document.removeEventListener("pointermove", handleMove);
        document.removeEventListener("pointerup", handleUp);
        if (frame !== null) cancelAnimationFrame(frame);
        applyFrame();
        el.style.willChange = "auto";
        onResizeCommit(next);
      };
      document.addEventListener("pointermove", handleMove);
      document.addEventListener("pointerup", handleUp);
    },
    [disabled, elementRef, minWidth, minHeight, onResizeCommit, onDragStart]
  );

  return { startMove, startResize };
}
