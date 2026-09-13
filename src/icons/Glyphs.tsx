interface GlyphProps {
  size?: number;
  className?: string;
}

export function AppleGlyph({ size = 14, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.5 1.5c.1 1.2-.4 2.4-1.1 3.3-.7.9-1.9 1.6-3 1.5-.1-1.2.4-2.5 1.1-3.3.8-.9 2-1.5 3-1.5ZM19.8 17.3c-.5 1.1-.7 1.6-1.3 2.6-.9 1.4-2.1 3.1-3.6 3.1-1.4 0-1.7-.9-3.5-.9-1.8 0-2.2.9-3.5.9-1.5 0-2.6-1.5-3.5-2.9-2.4-3.7-2.7-8.1-1.2-10.4 1.1-1.6 2.8-2.6 4.5-2.6 1.7 0 2.8 1 4.2 1 1.4 0 2.2-1 4.2-1 1.5 0 3.1.8 4.2 2.2-3.7 2-3.1 7.3-.5 8.9Z" />
    </svg>
  );
}

export function WifiGlyph({ size = 16, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M2 8.5c5.5-5 14.5-5 20 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
      <path d="M5.3 12.2c3.7-3.3 9.7-3.3 13.4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
      <path d="M8.6 15.8c1.9-1.6 4.9-1.6 6.8 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="19" r="1.3" fill="currentColor" />
    </svg>
  );
}

export function BluetoothGlyph({ size = 16, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M7 8.5 17 15l-5 4V5l5 4L7 15.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BatteryGlyph({ size = 20, level = 82, charging = false, className }: GlyphProps & { level?: number; charging?: boolean }) {
  const width = size;
  const height = size * 0.5;
  const innerWidth = (width - 4) * (level / 100);
  return (
    <svg width={width + 3} height={height} viewBox={`0 0 ${width + 3} ${height}`} className={className} aria-hidden="true">
      <rect x="0.5" y="0.5" width={width - 1} height={height - 1} rx="2.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7" />
      <rect x="2" y="2" width={Math.max(0, innerWidth - 2)} height={height - 4} rx="1" fill="currentColor" opacity={level < 20 ? 1 : 0.85} />
      <rect x={width} y={height / 2 - 2.5} width="2" height="5" rx="1" fill="currentColor" opacity="0.7" />
      {charging && (
        <path d={`M${width / 2 + 1} 2 L${width / 2 - 3} ${height / 2 + 1} L${width / 2} ${height / 2 + 1} L${width / 2 - 2} ${height - 2}`} stroke="#000" strokeWidth="1" fill="none" />
      )}
    </svg>
  );
}

export function SearchGlyph({ size = 14, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <line x1="15.3" y1="15.3" x2="21" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ControlCenterGlyph({ size = 14, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="2" width="8.5" height="8.5" rx="2" fill="currentColor" opacity="0.9" />
      <rect x="13.5" y="2" width="8.5" height="8.5" rx="2" fill="currentColor" opacity="0.55" />
      <rect x="2" y="13.5" width="8.5" height="8.5" rx="2" fill="currentColor" opacity="0.55" />
      <rect x="13.5" y="13.5" width="8.5" height="8.5" rx="2" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

export function ChevronGlyph({ size = 10, direction = "down", className }: GlyphProps & { direction?: "up" | "down" | "left" | "right" }) {
  const rotation = { down: 0, up: 180, left: 90, right: -90 }[direction];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ transform: `rotate(${rotation}deg)` }} className={className} aria-hidden="true">
      <path d="M5 8l7 8 7-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function VolumeGlyph({ size = 16, level = 60, className }: GlyphProps & { level?: number }) {
  const muted = level <= 0;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 10v4h3.5L12 18V6L7.5 10H4Z" fill="currentColor" />
      {!muted && <path d="M15.5 9a4 4 0 0 1 0 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity={level > 20 ? 1 : 0.3} />}
      {!muted && level > 55 && <path d="M18 6.5a8 8 0 0 1 0 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />}
      {muted && <line x1="15.5" y1="8" x2="20" y2="16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
    </svg>
  );
}

export function FolderGlyph({ size = 16, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6Z" fill="#6fb1ff" />
      <path d="M3 9h18v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9Z" fill="#4a90e2" />
    </svg>
  );
}

export function DocumentGlyph({ size = 16, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M6 2h8l4 4v16H6Z" fill="#f4f6f8" stroke="#c7ccd3" strokeWidth="0.6" />
      <path d="M14 2v4h4Z" fill="#dfe4e9" />
      <line x1="8.5" y1="11" x2="16" y2="11" stroke="#9aa2ac" strokeWidth="1" />
      <line x1="8.5" y1="14" x2="16" y2="14" stroke="#9aa2ac" strokeWidth="1" />
      <line x1="8.5" y1="17" x2="13" y2="17" stroke="#9aa2ac" strokeWidth="1" />
    </svg>
  );
}

export function ImageGlyph({ size = 16, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" fill="#fef3e2" stroke="#f0d9b5" strokeWidth="0.6" />
      <circle cx="8" cy="10" r="2" fill="#f7b733" />
      <path d="M3 18l6-6 4 4 3-3 5 5v0.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" fill="#e8935a" />
    </svg>
  );
}

export function DriveGlyph({ size = 16, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="2" y="6" width="20" height="12" rx="2.5" fill="#cfd6de" stroke="#aab2bd" strokeWidth="0.6" />
      <rect x="4" y="8" width="12" height="8" rx="1" fill="#eef2f6" />
      <circle cx="19" cy="12" r="1.4" fill="#5fbf6a" />
    </svg>
  );
}
