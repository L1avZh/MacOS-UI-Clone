import { useEffect, useState } from "react";
import { useUiStore } from "@/state/uiStore";
import { useWindowStore } from "@/state/windowStore";
import { listLaunchpadApps } from "@/apps/registry";
import "./launchpad.css";

export default function Launchpad() {
  const open = useUiStore((s) => s.launchpadOpen);
  const setOpen = useUiStore((s) => s.setLaunchpadOpen);
  const openApp = useWindowStore((s) => s.open);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  if (!open) return null;

  const apps = listLaunchpadApps().filter((a) => a.name.toLowerCase().includes(query.toLowerCase()));

  return (
    // Clicking the backdrop is a mouse-only convenience for dismissing Launchpad;
    // Escape (global shortcut) is the keyboard-equivalent close action.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className="launchpad-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className="launchpad">
        <input
          className="launchpad-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          aria-label="Search apps"
          autoFocus
        />
        <div className="launchpad-grid" role="grid">
          {apps.map((app) => (
            <button
              key={app.id}
              type="button"
              className="launchpad-item"
              onClick={() => {
                openApp(app.id);
                setOpen(false);
              }}
            >
              <app.icon size={64} />
              <span>{app.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
