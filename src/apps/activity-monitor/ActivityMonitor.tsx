import { useEffect, useRef, useState } from "react";
import "./activity-monitor.css";

const HISTORY_LENGTH = 40;

function useSimulatedSeries(base: number, volatility: number) {
  const [series, setSeries] = useState<number[]>(() => Array(HISTORY_LENGTH).fill(base));
  const valueRef = useRef(base);

  useEffect(() => {
    const interval = setInterval(() => {
      const drift = (Math.random() - 0.5) * volatility;
      valueRef.current = Math.min(100, Math.max(2, valueRef.current + drift));
      setSeries((prev) => [...prev.slice(1), valueRef.current]);
    }, 900);
    return () => clearInterval(interval);
  }, [volatility]);

  return series;
}

function Sparkline({ series, color }: { series: number[]; color: string }) {
  const width = 100;
  const height = 100;
  const points = series
    .map((v, i) => `${(i / (series.length - 1)) * width},${height - (v / 100) * height}`)
    .join(" ");
  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="am-sparkline" aria-hidden="true">
      <polygon points={areaPoints} fill={color} opacity="0.18" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Gauge({ label, series, color }: { label: string; series: number[]; color: string }) {
  const value = series.at(-1) ?? 0;
  return (
    <div className="am-gauge">
      <div className="am-gauge-header">
        <span>{label}</span>
        <span className="am-gauge-value">{value.toFixed(0)}%</span>
      </div>
      <div className="am-gauge-chart">
        <Sparkline series={series} color={color} />
        <div className="am-gauge-bar-track">
          <div className="am-gauge-bar-fill" style={{ width: `${value}%`, background: color }} />
        </div>
      </div>
    </div>
  );
}

const PROCESSES = [
  { name: "WindowServer", user: "root" },
  { name: "Finder", user: "guest" },
  { name: "Safari", user: "guest" },
  { name: "Notes", user: "guest" },
  { name: "Terminal", user: "guest" },
  { name: "Spotlight", user: "root" },
  { name: "Dock", user: "guest" },
];

export default function ActivityMonitor() {
  const cpu = useSimulatedSeries(28, 14);
  const memory = useSimulatedSeries(52, 6);
  const disk = useSimulatedSeries(12, 8);
  const network = useSimulatedSeries(18, 20);

  const [processRows] = useState(() =>
    PROCESSES.map((p) => ({ ...p, cpu: Math.random() * 12, mem: Math.random() * 300 + 20 })).sort((a, b) => b.cpu - a.cpu)
  );

  return (
    <div className="activity-monitor">
      <p className="am-disclaimer">Simulated data for demonstration — this does not reflect your device.</p>
      <div className="am-gauges">
        <Gauge label="CPU" series={cpu} color="#30d158" />
        <Gauge label="Memory" series={memory} color="#0a84ff" />
        <Gauge label="Disk" series={disk} color="#ff9f0a" />
        <Gauge label="Network" series={network} color="#bf5af2" />
      </div>

      <table className="am-table">
        <thead>
          <tr>
            <th>Process Name</th>
            <th>User</th>
            <th>% CPU</th>
            <th>Memory</th>
          </tr>
        </thead>
        <tbody>
          {processRows.map((p) => (
            <tr key={p.name}>
              <td>{p.name}</td>
              <td>{p.user}</td>
              <td>{p.cpu.toFixed(1)}</td>
              <td>{p.mem.toFixed(0)} MB</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
