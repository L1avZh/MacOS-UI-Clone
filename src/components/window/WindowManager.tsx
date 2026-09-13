import { useEffect } from "react";
import { useWindowStore } from "@/state/windowStore";
import Window from "./Window";

export default function WindowManager() {
  const windows = useWindowStore((s) => s.windows);
  const setViewport = useWindowStore((s) => s.setViewport);

  useEffect(() => {
    function handleResize() {
      setViewport(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setViewport]);

  return (
    <div className="window-manager" aria-live="off">
      {Object.values(windows).map((win) => (
        <Window key={win.id} win={win} />
      ))}
    </div>
  );
}
