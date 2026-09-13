import { useEffect, useState } from "react";
import { useSettingsStore } from "@/state/settingsStore";

function systemPrefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Combines the OS-level preference with the in-app Accessibility override. */
export function usePrefersReducedMotion(): boolean {
  const override = useSettingsStore((s) => s.reduceMotion);
  const [systemPref, setSystemPref] = useState(systemPrefersReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = (e: MediaQueryListEvent) => setSystemPref(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  return override || systemPref;
}
