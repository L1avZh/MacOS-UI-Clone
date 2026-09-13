import { useEffect, useRef } from "react";
import { useSettingsStore } from "@/state/settingsStore";
import { useUiStore } from "@/state/uiStore";
import { WifiGlyph, BluetoothGlyph, BatteryGlyph, VolumeGlyph } from "@/icons/Glyphs";
import "./control-center.css";

function Tile({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" className={`cc-tile ${active ? "active" : ""}`} onClick={onClick} aria-pressed={active}>
      <span className="cc-tile-icon">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default function ControlCenter() {
  const settings = useSettingsStore();
  const setOpen = useUiStore((s) => s.setControlCenterOpen);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [setOpen]);

  return (
    <div className="control-center" ref={ref} role="dialog" aria-label="Control Center">
      <div className="cc-row cc-tiles">
        <Tile
          active={settings.wifiEnabled}
          icon={<WifiGlyph size={16} />}
          label="Wi-Fi"
          onClick={() => settings.update("wifiEnabled", !settings.wifiEnabled)}
        />
        <Tile
          active={settings.bluetoothEnabled}
          icon={<BluetoothGlyph size={16} />}
          label="Bluetooth"
          onClick={() => settings.update("bluetoothEnabled", !settings.bluetoothEnabled)}
        />
        <Tile
          active={settings.focusEnabled}
          icon={<span aria-hidden="true">🌙</span>}
          label="Focus"
          onClick={() => settings.update("focusEnabled", !settings.focusEnabled)}
        />
      </div>

      <div className="cc-row cc-slider-row">
        <span className="cc-slider-icon" aria-hidden="true">
          ☀️
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={settings.brightness}
          onChange={(e) => settings.update("brightness", Number(e.target.value))}
          aria-label="Display brightness"
        />
      </div>

      <div className="cc-row cc-slider-row">
        <span className="cc-slider-icon">
          <VolumeGlyph size={16} level={settings.volume} />
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={settings.volume}
          onChange={(e) => settings.update("volume", Number(e.target.value))}
          aria-label="Volume"
        />
      </div>

      <div className="cc-row cc-battery-row">
        <BatteryGlyph size={22} level={82} />
        <span>82% Battery</span>
      </div>
    </div>
  );
}
