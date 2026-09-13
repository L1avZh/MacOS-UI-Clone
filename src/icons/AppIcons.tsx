/**
 * Original, high-fidelity app-icon glyphs styled after the modern macOS
 * "squircle" icon language (rounded-square tile, soft gradient, glossy top
 * highlight, subtle depth shadow). These are deliberately NOT copies of
 * Apple's artwork or trademarks — each glyph is an original mark that evokes
 * the app's role (a compass for a browser, a prompt for a terminal, a pulse
 * for a system monitor) without reproducing any proprietary icon design.
 */
import { useId } from "react";

interface IconProps {
  size?: number;
}

interface TileProps extends IconProps {
  gradient: [string, string];
  children: (glossId: string) => React.ReactNode;
}

/** Shared squircle tile: gradient fill, inner glossy sheen, soft ambient shadow. */
function Tile({ size = 44, gradient, children }: TileProps) {
  const uid = useId();
  const gradId = `g-${uid}`;
  const glossId = `s-${uid}`;
  const shadowId = `d-${uid}`;
  const r = size * 0.223;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0, display: "block" }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={gradient[0]} />
          <stop offset="1" stopColor={gradient[1]} />
        </linearGradient>
        <linearGradient id={glossId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="0.46" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy={size * 0.02} stdDeviation={size * 0.02} floodColor="#000" floodOpacity="0.28" />
        </filter>
      </defs>
      <rect width={size} height={size} rx={r} fill={`url(#${gradId})`} filter={`url(#${shadowId})`} />
      <rect width={size} height={size} rx={r} fill="none" stroke="#000" strokeOpacity="0.06" />
      {children(glossId)}
      <rect width={size} height={size} rx={r} fill={`url(#${glossId})`} />
    </svg>
  );
}

export function FinderIcon({ size = 44 }: IconProps) {
  return (
    <Tile size={size} gradient={["#6dd2ff", "#1f6fd6"]}>
      {() => (
        <g>
          <path
            d={`M${size * 0.5} ${size * 0.16} L${size * 0.84} ${size * 0.5} L${size * 0.5} ${size * 0.84} L${size * 0.16} ${size * 0.5} Z`}
            fill="#ffffff"
            fillOpacity="0.95"
          />
          <circle cx={size * 0.5} cy={size * 0.5} r={size * 0.09} fill="#1f6fd6" />
        </g>
      )}
    </Tile>
  );
}

export function SafariIcon({ size = 44 }: IconProps) {
  const id = useId();
  return (
    <Tile size={size} gradient={["#fbfdff", "#dbe4ee"]}>
      {() => (
        <g>
          <defs>
            <linearGradient id={`needle-${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ff5f4d" />
              <stop offset="1" stopColor="#ff3b30" />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={size * 0.4} fill="#f4f7fb" stroke="#c3d0dd" strokeWidth={size * 0.014} />
          {Array.from({ length: 24 }).map((_, i) => (
            <line
              key={i}
              x1={size / 2}
              y1={size * 0.11}
              x2={size / 2}
              y2={size * (i % 6 === 0 ? 0.16 : 0.14)}
              stroke="#8a97a5"
              strokeWidth={i % 6 === 0 ? size * 0.012 : size * 0.007}
              transform={`rotate(${i * 15} ${size / 2} ${size / 2})`}
            />
          ))}
          <g transform={`rotate(35 ${size / 2} ${size / 2})`}>
            <polygon
              points={`${size / 2},${size * 0.25} ${size * 0.58},${size / 2} ${size / 2},${size * 0.75} ${size * 0.42},${size / 2}`}
              fill={`url(#needle-${id})`}
            />
            <polygon points={`${size / 2},${size / 2} ${size * 0.58},${size / 2} ${size / 2},${size * 0.75}`} fill="#d6dce3" />
          </g>
          <circle cx={size / 2} cy={size / 2} r={size * 0.035} fill="#4a5561" />
        </g>
      )}
    </Tile>
  );
}

export function TerminalIcon({ size = 44 }: IconProps) {
  return (
    <Tile size={size} gradient={["#4a4a4f", "#0d0d10"]}>
      {() => (
        <g>
          <path
            d={`M${size * 0.2} ${size * 0.32} L${size * 0.42} ${size * 0.5} L${size * 0.2} ${size * 0.68}`}
            stroke="#4ee08a"
            strokeWidth={size * 0.075}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <line x1={size * 0.48} y1={size * 0.68} x2={size * 0.8} y2={size * 0.68} stroke="#eef0f2" strokeWidth={size * 0.075} strokeLinecap="round" />
        </g>
      )}
    </Tile>
  );
}

export function NotesIcon({ size = 44 }: IconProps) {
  return (
    <Tile size={size} gradient={["#ffe27a", "#f2a93c"]}>
      {() => (
        <g>
          <path d={`M${size * 0.16} ${size * 0.14} H${size * 0.84} V${size * 0.86} H${size * 0.16} Z`} fill="#fffaf0" />
          <path d={`M${size * 0.62} ${size * 0.86} V${size * 0.68} L${size * 0.84} ${size * 0.86} Z`} fill="#f0dba8" />
          <line x1={size * 0.27} y1={size * 0.33} x2={size * 0.73} y2={size * 0.33} stroke="#e0a63a" strokeWidth={size * 0.032} strokeLinecap="round" />
          <line x1={size * 0.27} y1={size * 0.48} x2={size * 0.73} y2={size * 0.48} stroke="#ecc98a" strokeWidth={size * 0.032} strokeLinecap="round" />
          <line x1={size * 0.27} y1={size * 0.63} x2={size * 0.56} y2={size * 0.63} stroke="#ecc98a" strokeWidth={size * 0.032} strokeLinecap="round" />
        </g>
      )}
    </Tile>
  );
}

export function CalculatorIcon({ size = 44 }: IconProps) {
  return (
    <Tile size={size} gradient={["#5a5a60", "#232326"]}>
      {() => (
        <g>
          <rect x={size * 0.16} y={size * 0.14} width={size * 0.68} height={size * 0.24} rx={size * 0.04} fill="#9ff2cf" />
          {[0, 1, 2].map((row) =>
            [0, 1, 2, 3].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={size * (0.16 + col * 0.176)}
                y={size * (0.46 + row * 0.176)}
                width={size * 0.13}
                height={size * 0.12}
                rx={size * 0.026}
                fill={col === 3 ? "#ffab40" : "#6b6b70"}
              />
            ))
          )}
        </g>
      )}
    </Tile>
  );
}

export function SettingsIcon({ size = 44 }: IconProps) {
  const id = useId();
  const teeth = 8;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.4;
  const innerR = size * 0.31;
  const toothLen = size * 0.075;

  let path = "";
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * 2 * Math.PI;
    const a1 = a0 + (Math.PI / teeth) * 0.62;
    const a2 = a0 + (Math.PI / teeth);
    const a3 = a0 + (Math.PI / teeth) * 1.38;
    const pt = (r: number, a: number) => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    path += `${i === 0 ? "M" : "L"} ${pt(innerR, a0)} L ${pt(outerR + toothLen, a1)} L ${pt(outerR + toothLen, a3)} L ${pt(innerR, a2)} `;
  }
  path += "Z";

  return (
    <Tile size={size} gradient={["#d4d7dc", "#9195a0"]}>
      {() => (
        <g>
          <defs>
            <linearGradient id={`metal-${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fbfbfc" />
              <stop offset="1" stopColor="#e2e4e8" />
            </linearGradient>
          </defs>
          <path d={path} fill={`url(#metal-${id})`} stroke="#b7bac1" strokeWidth={size * 0.012} />
          <circle cx={cx} cy={cy} r={innerR * 0.62} fill="#c3c6cc" stroke="#a9adb5" strokeWidth={size * 0.012} />
        </g>
      )}
    </Tile>
  );
}

export function ActivityMonitorIcon({ size = 44 }: IconProps) {
  return (
    <Tile size={size} gradient={["#26262a", "#0a0a0c"]}>
      {() => (
        <path
          d={`M${size * 0.1} ${size * 0.55} h${size * 0.14} l${size * 0.08} -${size * 0.28} l${size * 0.16} ${size * 0.56} l${size * 0.12} -${size * 0.4} l${size * 0.08} ${size * 0.12} h${size * 0.22}`}
          stroke="#ff6259"
          strokeWidth={size * 0.055}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      )}
    </Tile>
  );
}

export function TrashIcon({ size = 44 }: IconProps) {
  return (
    <Tile size={size} gradient={["#e6e9ed", "#b7bcc4"]}>
      {() => (
        <g stroke="#565a61" strokeWidth={size * 0.045} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <line x1={size * 0.22} y1={size * 0.32} x2={size * 0.78} y2={size * 0.32} />
          <path d={`M${size * 0.38} ${size * 0.32} V${size * 0.22} a${size * 0.03} ${size * 0.03} 0 0 1 ${size * 0.03} -${size * 0.03} h${size * 0.18} a${size * 0.03} ${size * 0.03} 0 0 1 ${size * 0.03} ${size * 0.03} V${size * 0.32}`} />
          <path d={`M${size * 0.28} ${size * 0.32} L${size * 0.32} ${size * 0.82} a${size * 0.04} ${size * 0.04} 0 0 0 ${size * 0.04} ${size * 0.04} h${size * 0.28} a${size * 0.04} ${size * 0.04} 0 0 0 ${size * 0.04} -${size * 0.04} L${size * 0.72} ${size * 0.32}`} />
          <line x1={size * 0.42} y1={size * 0.42} x2={size * 0.44} y2={size * 0.72} />
          <line x1={size * 0.58} y1={size * 0.42} x2={size * 0.56} y2={size * 0.72} />
        </g>
      )}
    </Tile>
  );
}
