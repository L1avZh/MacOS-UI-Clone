import { useState } from "react";
import { useSettingsStore } from "@/state/settingsStore";
import { WALLPAPERS } from "@/config/wallpapers";
import "./settings.css";

type Panel = "appearance" | "wallpaper" | "dock" | "accessibility" | "general" | "about";

const PANELS: { id: Panel; label: string; icon: string }[] = [
  { id: "general", label: "General", icon: "⚙️" },
  { id: "appearance", label: "Appearance", icon: "🎨" },
  { id: "wallpaper", label: "Wallpaper", icon: "🖼️" },
  { id: "dock", label: "Dock", icon: "▭" },
  { id: "accessibility", label: "Accessibility", icon: "♿" },
  { id: "about", label: "About", icon: "ℹ️" },
];

const ACCENTS = ["#0a84ff", "#ff375f", "#ff9f0a", "#30d158", "#bf5af2", "#64d2ff"];

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="settings-row">
      <div className="settings-row-text">
        <span className="settings-row-label">{label}</span>
        {description && <span className="settings-row-desc">{description}</span>}
      </div>
      <div className="settings-row-control">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`settings-toggle ${checked ? "on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="settings-toggle-knob" />
    </button>
  );
}

export default function Settings() {
  const [panel, setPanel] = useState<Panel>("general");
  const settings = useSettingsStore();

  return (
    <div className="settings-app">
      <nav className="settings-sidebar" aria-label="Settings sections">
        {PANELS.map((p) => (
          <button key={p.id} type="button" className={panel === p.id ? "active" : ""} onClick={() => setPanel(p.id)}>
            <span aria-hidden="true">{p.icon}</span> {p.label}
          </button>
        ))}
      </nav>

      <div className="settings-content">
        {panel === "general" && (
          <section>
            <h2>General</h2>
            <Row label="Name" description="Shown on the lock screen and in the Terminal prompt">
              <input
                type="text"
                value={settings.userName}
                onChange={(e) => settings.update("userName", e.target.value || "Guest")}
                className="settings-text-input"
              />
            </Row>
            <Row label="Language" description="Switches menu direction between LTR and RTL">
              <select value={settings.language} onChange={(e) => settings.update("language", e.target.value as "en" | "he")}>
                <option value="en">English</option>
                <option value="he">עברית (Hebrew, RTL)</option>
              </select>
            </Row>
            <Row label="24-hour time">
              <Toggle checked={settings.clock24Hour} onChange={(v) => settings.update("clock24Hour", v)} label="24-hour time" />
            </Row>
            <Row label="Reset all settings" description="Restores every preference on this page to its default">
              <button type="button" className="settings-danger-btn" onClick={() => settings.reset()}>
                Reset
              </button>
            </Row>
          </section>
        )}

        {panel === "appearance" && (
          <section>
            <h2>Appearance</h2>
            <Row label="Theme">
              <div className="settings-segmented">
                {(["light", "dark", "auto"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={settings.theme === mode}
                    onClick={() => settings.update("theme", mode)}
                  >
                    {mode[0]!.toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </Row>
            <Row label="Accent color">
              <div className="settings-swatches">
                {ACCENTS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Accent ${color}`}
                    aria-pressed={settings.accent === color}
                    className="settings-swatch"
                    style={{ background: color }}
                    onClick={() => settings.update("accent", color)}
                  />
                ))}
              </div>
            </Row>
          </section>
        )}

        {panel === "wallpaper" && (
          <section>
            <h2>Wallpaper</h2>
            <div className="wallpaper-grid">
              {WALLPAPERS.map((wp) => (
                <button
                  key={wp.id}
                  type="button"
                  className={`wallpaper-thumb ${settings.wallpaperId === wp.id ? "selected" : ""}`}
                  style={{ backgroundImage: wp.css, borderColor: wp.swatch }}
                  onClick={() => settings.update("wallpaperId", wp.id)}
                  aria-pressed={settings.wallpaperId === wp.id}
                >
                  <span>{wp.name}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {panel === "dock" && (
          <section>
            <h2>Dock</h2>
            <Row label="Size">
              <input
                type="range"
                min={40}
                max={80}
                value={settings.dockSize}
                onChange={(e) => settings.update("dockSize", Number(e.target.value))}
                aria-label="Dock size"
              />
            </Row>
            <Row label="Position on screen">
              <div className="settings-segmented">
                {(["left", "bottom", "right"] as const).map((pos) => (
                  <button key={pos} type="button" aria-pressed={settings.dockPosition === pos} onClick={() => settings.update("dockPosition", pos)}>
                    {pos[0]!.toUpperCase() + pos.slice(1)}
                  </button>
                ))}
              </div>
            </Row>
            <Row label="Magnification" description="Icons grow as the pointer passes over them">
              <Toggle checked={settings.dockMagnification} onChange={(v) => settings.update("dockMagnification", v)} label="Magnification" />
            </Row>
            <Row label="Automatically hide and show the Dock">
              <Toggle checked={settings.dockAutoHide} onChange={(v) => settings.update("dockAutoHide", v)} label="Auto-hide dock" />
            </Row>
          </section>
        )}

        {panel === "accessibility" && (
          <section>
            <h2>Accessibility</h2>
            <Row label="Reduce motion" description="Turns off window and interface animations">
              <Toggle checked={settings.reduceMotion} onChange={(v) => settings.update("reduceMotion", v)} label="Reduce motion" />
            </Row>
            <Row label="Increase contrast" description="Strengthens borders and separators throughout the interface">
              <Toggle checked={settings.highContrast} onChange={(v) => settings.update("highContrast", v)} label="Increase contrast" />
            </Row>
          </section>
        )}

        {panel === "about" && (
          <section>
            <h2>About This Mac(-inspired page)</h2>
            <p className="settings-about-text">
              macOS UI Clone is an independent, open-source project inspired by Apple&rsquo;s macOS interface design.
              It is not affiliated with, endorsed by, or sponsored by Apple Inc. &ldquo;macOS&rdquo; is a trademark of
              Apple Inc.
            </p>
            <p className="settings-about-text">Version 2.0.0 — built with React, TypeScript, and Vite.</p>
          </section>
        )}
      </div>
    </div>
  );
}
