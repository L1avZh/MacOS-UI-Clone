import { useState } from "react";
import DesktopIcon from "./DesktopIcon";
import { useDesktopStore } from "@/state/desktopStore";
import { useWindowStore } from "@/state/windowStore";
import { useUiStore } from "@/state/uiStore";
import { useSettingsStore } from "@/state/settingsStore";
import { getWallpaper } from "@/config/wallpapers";
import { README_CONTENT } from "@/config/desktopIcons";
import Dialog from "@/components/common/Dialog";
import "./desktop.css";

export default function Desktop() {
  const icons = useDesktopStore((s) => s.allIcons());
  const clearSelection = useDesktopStore((s) => s.clearSelection);
  const selectedIds = useDesktopStore((s) => s.selectedIds);
  const addFolder = useDesktopStore((s) => s.addFolder);
  const removeCustomIcon = useDesktopStore((s) => s.removeCustomIcon);
  const arrangeByName = useDesktopStore((s) => s.arrangeByName);
  const arrangeByKind = useDesktopStore((s) => s.arrangeByKind);
  const customIcons = useDesktopStore((s) => s.customIcons);

  const openApp = useWindowStore((s) => s.open);
  const openContextMenu = useUiStore((s) => s.openContextMenu);
  const wallpaperId = useSettingsStore((s) => s.wallpaperId);
  const wallpaper = getWallpaper(wallpaperId);

  const [readmeOpen, setReadmeOpen] = useState(false);
  const [infoTarget, setInfoTarget] = useState<string | null>(null);

  function openIcon(id: string) {
    const icon = icons.find((i) => i.id === id);
    if (!icon) return;
    if (icon.appId) {
      openApp(icon.appId);
    } else if (id === "readme") {
      setReadmeOpen(true);
    } else {
      openApp("finder");
    }
  }

  function handleDesktopContextMenu(e: React.MouseEvent) {
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    clearSelection();
    openContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        { id: "new-folder", label: "New Folder", onSelect: addFolder },
        { id: "get-info", label: "Get Info", onSelect: () => setInfoTarget("__desktop__") },
        { id: "sep1", separator: true },
        { id: "wallpaper", label: "Change Wallpaper…", onSelect: () => openApp("settings") },
        { id: "sep2", separator: true },
        { id: "sort-name", label: "Sort By Name", onSelect: arrangeByName },
        { id: "sort-kind", label: "Sort By Kind", onSelect: arrangeByKind },
      ],
    });
  }

  function handleIconContextMenu(e: React.MouseEvent, id: string) {
    e.preventDefault();
    const icon = icons.find((i) => i.id === id);
    const isCustom = customIcons.some((c) => c.id === id);
    openContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        { id: "open", label: "Open", onSelect: () => openIcon(id) },
        { id: "get-info", label: "Get Info", onSelect: () => setInfoTarget(id) },
        { id: "sep", separator: true },
        {
          id: "trash",
          label: "Move to Trash",
          disabled: !isCustom,
          onSelect: () => removeCustomIcon(id),
        },
      ],
    });
    if (!icon) return;
  }

  const infoIcon = infoTarget && infoTarget !== "__desktop__" ? icons.find((i) => i.id === infoTarget) : null;

  return (
    <div
      className="desktop"
      style={{ backgroundImage: wallpaper.css }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) clearSelection();
      }}
      onContextMenu={handleDesktopContextMenu}
      aria-label="Desktop"
    >
      {icons.map((icon) => (
        <DesktopIcon key={icon.id} icon={icon} onOpen={() => openIcon(icon.id)} onContextMenu={(e) => handleIconContextMenu(e, icon.id)} />
      ))}

      {readmeOpen && (
        <Dialog title="About This Project" onClose={() => setReadmeOpen(false)}>
          <pre className="desktop-readme">{README_CONTENT}</pre>
        </Dialog>
      )}

      {infoTarget === "__desktop__" && (
        <Dialog title="Get Info" onClose={() => setInfoTarget(null)}>
          <p>
            <strong>{icons.length}</strong> items on the desktop.
            <br />
            Selected: {selectedIds.length}
          </p>
        </Dialog>
      )}

      {infoIcon && (
        <Dialog title={infoIcon.label} onClose={() => setInfoTarget(null)}>
          <p>
            Kind: {infoIcon.glyph === "drive" ? "Volume" : infoIcon.glyph === "trash" ? "Trash" : infoIcon.glyph === "folder" ? "Folder" : "Document"}
            <br />
            {infoIcon.appId ? `Opens: ${infoIcon.appId}` : "This is a simulated file — nothing here touches your real computer."}
          </p>
        </Dialog>
      )}
    </div>
  );
}
