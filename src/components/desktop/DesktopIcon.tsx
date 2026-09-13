import type { DesktopIconDefinition } from "@/config/desktopIcons";
import { useDesktopStore } from "@/state/desktopStore";
import { useIconDrag } from "@/hooks/useIconDrag";
import { TrashIcon } from "@/icons/AppIcons";
import { DriveGlyph, FolderGlyph, DocumentGlyph } from "@/icons/Glyphs";
import "./desktop-icon.css";

function iconFor(glyph: DesktopIconDefinition["glyph"]) {
  switch (glyph) {
    case "drive":
      return <DriveGlyph size={48} />;
    case "trash":
      return <TrashIcon size={48} />;
    case "folder":
      return <FolderGlyph size={48} />;
    default:
      return <DocumentGlyph size={48} />;
  }
}

interface DesktopIconProps {
  icon: DesktopIconDefinition;
  onOpen: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function DesktopIcon({ icon, onOpen, onContextMenu }: DesktopIconProps) {
  const position = useDesktopStore((s) => s.positions[icon.id]) ?? { x: 0, y: 0 };
  const moveIcon = useDesktopStore((s) => s.moveIcon);
  const selectedIds = useDesktopStore((s) => s.selectedIds);
  const select = useDesktopStore((s) => s.select);
  const selected = selectedIds.includes(icon.id);

  const { startDrag } = useIconDrag({
    position,
    onMove: (p) => moveIcon(icon.id, p),
    onDragStart: () => select([icon.id]),
  });

  return (
    <button
      type="button"
      className={`desktop-icon ${selected ? "selected" : ""}`}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      onPointerDown={(e) => {
        select([icon.id]);
        startDrag(e);
      }}
      onDoubleClick={onOpen}
      onContextMenu={(e) => {
        select([icon.id]);
        onContextMenu(e);
      }}
    >
      {iconFor(icon.glyph)}
      <span className="desktop-icon-label">{icon.label}</span>
    </button>
  );
}
