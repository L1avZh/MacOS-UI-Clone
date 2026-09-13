import { useEffect, useState } from "react";

/** Ticks once a second so consumers always render the current time; re-renders are cheap and localized. */
export function useClock(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return now;
}
