import { useEffect, useRef, useState } from "react";
import { useUiStore } from "@/state/uiStore";
import "./context-menu.css";

export default function ContextMenu() {
  const menu = useUiStore((s) => s.contextMenu);
  const close = useUiStore((s) => s.closeContextMenu);
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!menu) {
      setPosition(null);
      return;
    }
    // Clamp after mount so we know the menu's real size.
    const el = ref.current;
    const width = el?.offsetWidth ?? 200;
    const height = el?.offsetHeight ?? 200;
    const x = Math.min(menu.x, window.innerWidth - width - 8);
    const y = Math.min(menu.y, window.innerHeight - height - 8);
    setPosition({ x: Math.max(4, x), y: Math.max(32, y) });
  }, [menu]);

  useEffect(() => {
    if (!menu) return;
    function handlePointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menu, close]);

  if (!menu) return null;

  return (
    <div
      ref={ref}
      className="context-menu"
      role="menu"
      style={{
        left: position?.x ?? menu.x,
        top: position?.y ?? menu.y,
        visibility: position ? "visible" : "hidden",
      }}
    >
      {menu.items.map((item, i) =>
        item.separator ? (
          <div key={`sep-${i}`} className="context-menu-separator" role="separator" />
        ) : (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            disabled={item.disabled}
            onClick={() => {
              close();
              item.onSelect?.();
            }}
          >
            <span>{item.label}</span>
            {item.shortcut && <span className="context-menu-shortcut">{item.shortcut}</span>}
          </button>
        )
      )}
    </div>
  );
}
