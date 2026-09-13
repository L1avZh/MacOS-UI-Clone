import { useEffect, useMemo, useRef, useState } from "react";
import { useUiStore } from "@/state/uiStore";
import { useWindowStore } from "@/state/windowStore";
import { APP_REGISTRY } from "@/apps/registry";
import { searchFs, type FsNode } from "@/apps/finder/filesystem";
import type { AppId } from "@/types/app";
import { FolderGlyph, DocumentGlyph, ImageGlyph } from "@/icons/Glyphs";
import "./spotlight.css";

interface ResultItem {
  id: string;
  category: "Applications" | "Files";
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

function fileIcon(node: FsNode) {
  if (node.kind === "folder") return <FolderGlyph size={20} />;
  if (node.kind === "image") return <ImageGlyph size={20} />;
  return <DocumentGlyph size={20} />;
}

export default function Spotlight() {
  const open = useUiStore((s) => s.spotlightOpen);
  const setOpen = useUiStore((s) => s.setSpotlightOpen);
  const openApp = useWindowStore((s) => s.open);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results: ResultItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const appResults: ResultItem[] = Object.values(APP_REGISTRY)
      .filter((app) => app.name.toLowerCase().includes(q))
      .map((app) => ({
        id: `app-${app.id}`,
        category: "Applications" as const,
        label: app.name,
        icon: <app.icon size={20} />,
        onSelect: () => {
          openApp(app.id as AppId);
          setOpen(false);
        },
      }));

    const fileResults: ResultItem[] = searchFs(q)
      .slice(0, 8)
      .map((node) => ({
        id: `file-${node.id}`,
        category: "Files" as const,
        label: node.name,
        sublabel: node.id,
        icon: fileIcon(node),
        onSelect: () => {
          if (node.kind === "app" && node.appId) openApp(node.appId);
          else openApp("finder");
          setOpen(false);
        },
      }));

    return [...appResults, ...fileResults];
  }, [query, openApp, setOpen]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      results[activeIndex]?.onSelect();
    }
  }

  if (!open) return null;

  return (
    // Clicking the backdrop is a mouse-only convenience for dismissing Spotlight;
    // Escape (global shortcut) is the keyboard-equivalent close action.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className="spotlight-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className="spotlight-panel" role="dialog" aria-label="Spotlight Search">
        <div className="spotlight-input-row">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" />
            <line x1="15.3" y1="15.3" x2="21" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Spotlight Search"
            aria-label="Spotlight Search"
          />
        </div>

        {query.trim() && (
          <div className="spotlight-results" role="listbox">
            {results.length === 0 ? (
              <div className="spotlight-empty">No results for &ldquo;{query}&rdquo;</div>
            ) : (
              (["Applications", "Files"] as const).map((category) => {
                const items = results.filter((r) => r.category === category);
                if (items.length === 0) return null;
                return (
                  <div key={category} className="spotlight-group">
                    <div className="spotlight-group-label">{category}</div>
                    {items.map((item) => {
                      const globalIndex = results.indexOf(item);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="option"
                          aria-selected={globalIndex === activeIndex}
                          className={`spotlight-result ${globalIndex === activeIndex ? "active" : ""}`}
                          onMouseEnter={() => setActiveIndex(globalIndex)}
                          onClick={item.onSelect}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
