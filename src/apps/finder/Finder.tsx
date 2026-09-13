import { useMemo, useState } from "react";
import { FS_ROOT, resolvePath, searchFs, type FsNode } from "./filesystem";
import { useWindowStore } from "@/state/windowStore";
import { getAppDefinition } from "@/apps/registry";
import { FolderGlyph, DocumentGlyph, ImageGlyph, DriveGlyph, ChevronGlyph, SearchGlyph } from "@/icons/Glyphs";
import "./finder.css";

type ViewMode = "grid" | "list";

const FAVORITES: { label: string; path: string[] }[] = [
  { label: "Macintosh HD", path: [] },
  { label: "Applications", path: ["Applications"] },
  { label: "Desktop", path: ["Users", "Guest", "Desktop"] },
  { label: "Documents", path: ["Users", "Guest", "Documents"] },
  { label: "Downloads", path: ["Users", "Guest", "Downloads"] },
  { label: "Pictures", path: ["Users", "Guest", "Pictures"] },
];

function nodeIcon(node: FsNode, size = 16) {
  switch (node.kind) {
    case "folder":
      return node.id === "/" ? <DriveGlyph size={size} /> : <FolderGlyph size={size} />;
    case "image":
      return <ImageGlyph size={size} />;
    case "app": {
      if (!node.appId) return <FolderGlyph size={size} />;
      const AppIcon = getAppDefinition(node.appId).icon;
      return <AppIcon size={size} />;
    }
    default:
      return <DocumentGlyph size={size} />;
  }
}

export default function Finder() {
  const [path, setPath] = useState<string[]>([]);
  const [history, setHistory] = useState<string[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("grid");
  const [query, setQuery] = useState("");
  const openApp = useWindowStore((s) => s.open);

  const current = resolvePath(path) ?? FS_ROOT;
  const children = current.children ?? [];
  const results = query.trim() ? searchFs(query) : null;
  const listing = results ?? children;
  const selectedNode = listing.find((n) => n.id === selectedId) ?? null;

  function navigateTo(next: string[]) {
    setPath(next);
    setSelectedId(null);
    setQuery("");
    const truncated = history.slice(0, historyIndex + 1);
    setHistory([...truncated, next]);
    setHistoryIndex(truncated.length);
  }

  function goBack() {
    if (historyIndex === 0) return;
    setHistoryIndex(historyIndex - 1);
    setPath(history[historyIndex - 1] ?? []);
    setSelectedId(null);
  }

  function goForward() {
    if (historyIndex >= history.length - 1) return;
    setHistoryIndex(historyIndex + 1);
    setPath(history[historyIndex + 1] ?? []);
    setSelectedId(null);
  }

  function openNode(node: FsNode) {
    if (node.kind === "folder") {
      navigateTo([...path, node.name]);
    } else if (node.kind === "app" && node.appId) {
      openApp(node.appId);
    }
  }

  const crumbs = useMemo(() => ["Macintosh HD", ...path], [path]);

  return (
    <div className="finder">
      <div className="finder-toolbar">
        <button type="button" onClick={goBack} disabled={historyIndex === 0} aria-label="Back" className="finder-nav-btn">
          <ChevronGlyph direction="left" size={12} />
        </button>
        <button type="button" onClick={goForward} disabled={historyIndex >= history.length - 1} aria-label="Forward" className="finder-nav-btn">
          <ChevronGlyph direction="right" size={12} />
        </button>
        <div className="finder-breadcrumbs" aria-label="Breadcrumb">
          {crumbs.map((crumb, i) => (
            <span key={i} className="finder-crumb">
              {i > 0 && <ChevronGlyph direction="right" size={9} className="finder-crumb-sep" />}
              <button type="button" onClick={() => navigateTo(crumbs.slice(1, i + 1))}>
                {crumb}
              </button>
            </span>
          ))}
        </div>
        <div className="finder-toolbar-spacer" />
        <div className="finder-view-toggle" role="group" aria-label="View mode">
          <button type="button" aria-pressed={view === "grid"} onClick={() => setView("grid")}>
            Grid
          </button>
          <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>
            List
          </button>
        </div>
        <div className="finder-search">
          <SearchGlyph size={12} />
          <input
            type="search"
            placeholder="Search this Mac"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search files"
          />
        </div>
      </div>

      <div className="finder-body">
        <nav className="finder-sidebar" aria-label="Favorites">
          <p className="finder-sidebar-heading">Favorites</p>
          <ul>
            {FAVORITES.map((fav) => (
              <li key={fav.label}>
                <button
                  type="button"
                  className={path.join("/") === fav.path.join("/") ? "active" : ""}
                  onClick={() => navigateTo(fav.path)}
                >
                  {fav.path.length === 0 ? <DriveGlyph size={15} /> : <FolderGlyph size={15} />}
                  {fav.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="finder-main">
          {listing.length === 0 ? (
            <div className="finder-empty">{query ? "No results" : "This folder is empty"}</div>
          ) : view === "grid" ? (
            <div className="finder-grid" role="listbox" aria-label="Files">
              {listing.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  role="option"
                  aria-selected={selectedId === node.id}
                  className={`finder-grid-item ${selectedId === node.id ? "selected" : ""}`}
                  onClick={() => setSelectedId(node.id)}
                  onDoubleClick={() => openNode(node)}
                >
                  {nodeIcon(node, 40)}
                  <span>{node.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <table className="finder-list">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date Modified</th>
                  <th>Size</th>
                </tr>
              </thead>
              <tbody>
                {listing.map((node) => (
                  <tr
                    key={node.id}
                    className={selectedId === node.id ? "selected" : ""}
                    onClick={() => setSelectedId(node.id)}
                    onDoubleClick={() => openNode(node)}
                  >
                    <td>
                      {nodeIcon(node, 16)} {node.name}
                    </td>
                    <td>{node.modified}</td>
                    <td>{node.size ?? "--"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedNode?.kind === "text" && (
        <div className="finder-preview" aria-label="File preview">
          <pre>{selectedNode.content}</pre>
        </div>
      )}

      <div className="finder-statusbar">
        {listing.length} item{listing.length === 1 ? "" : "s"}
      </div>
    </div>
  );
}
