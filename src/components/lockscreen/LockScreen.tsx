import { useState } from "react";
import { useUiStore } from "@/state/uiStore";
import { useSettingsStore } from "@/state/settingsStore";
import { useClock } from "@/hooks/useClock";
import { getWallpaper } from "@/config/wallpapers";
import "./lock-screen.css";

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

export default function LockScreen() {
  const unlock = useUiStore((s) => s.unlock);
  const userName = useSettingsStore((s) => s.userName);
  const wallpaperId = useSettingsStore((s) => s.wallpaperId);
  const clock24Hour = useSettingsStore((s) => s.clock24Hour);
  const now = useClock();
  const [password, setPassword] = useState("");
  const wallpaper = getWallpaper(wallpaperId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    unlock();
  }

  const timeString = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: !clock24Hour });
  const dateString = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="lock-screen" style={{ backgroundImage: wallpaper.css }}>
      <div className="lock-time">
        <p className="lock-date">{dateString}</p>
        <h1 className="lock-hour">{timeString}</h1>
      </div>

      <form className="lock-login" onSubmit={handleSubmit}>
        <div className="lock-avatar" aria-hidden="true">
          {initialsFor(userName)}
        </div>
        <span className="lock-username">{userName}</span>
        <div className="lock-input-container">
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Password"
            autoFocus
          />
          <button type="submit" className="lock-submit" aria-label="Unlock">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="lock-hint">Any password unlocks this demo — nothing here is a real account.</p>
      </form>
    </div>
  );
}
