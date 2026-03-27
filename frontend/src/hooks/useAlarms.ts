import { useEffect, useState } from "react";
import type { Alarm } from "../types";

/**
 * Polls `url` every `intervalMs` ms for the alarm history.
 * Returns the last 100 alarms in reverse-chronological order.
 */
export function useAlarms(url: string, intervalMs = 10_000) {
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok || cancelled) return;
        const json = (await res.json()) as Alarm[];
        setAlarms(json.slice(-100).reverse());
      } catch {
        // network error — retry on next tick
      }
    };

    void tick();
    const id = setInterval(() => void tick(), intervalMs);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [url, intervalMs]);

  return { alarms };
}
