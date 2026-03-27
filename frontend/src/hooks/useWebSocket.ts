import { useEffect, useRef, useState } from "react";
import type { DataPoint } from "../types";

const BASE_DELAY_MS = 1_000;
const MAX_DELAY_MS = 30_000;

/**
 * Opens a WebSocket to `url` and returns the latest parsed DataPoint.
 * Reconnects automatically with exponential backoff on every close or error.
 */
export function useWebSocket(url: string) {
  const [data, setData] = useState<DataPoint | null>(null);
  const [connected, setConnected] = useState(false);

  const retryDelay = useRef(BASE_DELAY_MS);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const destroyed = useRef(false);

  useEffect(() => {
    destroyed.current = false;

    function connect() {
      if (destroyed.current) return;

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        retryDelay.current = BASE_DELAY_MS;
      };

      ws.onmessage = (e: MessageEvent<string>) => {
        try {
          const msg = JSON.parse(e.data) as DataPoint;
          setData(msg);
        } catch {
          // malformed frame — ignore
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      ws.onclose = () => {
        setConnected(false);
        if (!destroyed.current) {
          timeoutRef.current = setTimeout(() => {
            retryDelay.current = Math.min(retryDelay.current * 2, MAX_DELAY_MS);
            connect();
          }, retryDelay.current);
        }
      };
    }

    connect();

    return () => {
      destroyed.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      wsRef.current?.close();
    };
  }, [url]);

  return { data, connected };
}
