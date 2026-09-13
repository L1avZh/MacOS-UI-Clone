import { useCallback, useRef } from "react";

interface Position {
  x: number;
  y: number;
}

interface UseIconDragOptions {
  position: Position;
  onMove: (position: Position) => void;
  onDragStart?: () => void;
}

const DRAG_THRESHOLD = 4;

/**
 * Drag-to-reposition for a desktop icon. Movement below DRAG_THRESHOLD is
 * treated as a click/double-click rather than a drag, so selecting and
 * launching icons keeps working normally.
 */
export function useIconDrag({ position, onMove, onDragStart }: UseIconDragOptions) {
  const positionRef = useRef(position);
  positionRef.current = position;

  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const startX = e.clientX;
      const startY = e.clientY;
      const origin = positionRef.current;
      let dragging = false;

      const handleMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (!dragging && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
          dragging = true;
          onDragStart?.();
        }
        if (dragging) {
          onMove({ x: Math.max(0, origin.x + dx), y: Math.max(0, origin.y + dy) });
        }
      };
      const handleUp = () => {
        document.removeEventListener("pointermove", handleMove);
        document.removeEventListener("pointerup", handleUp);
      };
      document.addEventListener("pointermove", handleMove);
      document.addEventListener("pointerup", handleUp);
    },
    [onMove, onDragStart]
  );

  return { startDrag };
}
