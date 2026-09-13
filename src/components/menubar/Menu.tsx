import { useUiStore } from "@/state/uiStore";
import "./menu.css";

export interface MenuItemSpec {
  id: string;
  label?: string;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  bold?: boolean;
  onSelect?: () => void;
}

interface MenuProps {
  id: string;
  label: React.ReactNode;
  items: MenuItemSpec[];
  bold?: boolean;
}

export default function Menu({ id, label, items, bold }: MenuProps) {
  const activeMenu = useUiStore((s) => s.activeMenuBarMenu);
  const setActiveMenu = useUiStore((s) => s.setActiveMenuBarMenu);
  const isOpen = activeMenu === id;
  const anyOpen = activeMenu !== null;

  function handleClick() {
    setActiveMenu(isOpen ? null : id);
  }

  function handleMouseEnter() {
    if (anyOpen && !isOpen) setActiveMenu(id);
  }

  return (
    <div className="menubar-menu">
      <button
        type="button"
        className={`menubar-menu-trigger ${bold ? "bold" : ""} ${isOpen ? "open" : ""}`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {label}
      </button>
      {isOpen && (
        <div className="menubar-dropdown" role="menu">
          {items.map((item, i) =>
            item.separator ? (
              <div key={`sep-${i}`} className="menubar-separator" role="separator" />
            ) : (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={item.bold ? "bold" : ""}
                onClick={() => {
                  setActiveMenu(null);
                  item.onSelect?.();
                }}
              >
                <span>{item.label}</span>
                {item.shortcut && <span className="menubar-shortcut">{item.shortcut}</span>}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
