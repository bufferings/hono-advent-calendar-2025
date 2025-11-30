import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

const SSE_URL = import.meta.env.VITE_SSE_URL ?? "http://localhost:3001";
const RECONNECT_DELAY = 3000;

export function useOrderEvents(tableNumber?: number) {
  const queryClient = useQueryClient();
  const reconnectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let source: EventSource | null = null;

    const connect = () => {
      const url = tableNumber
        ? `${SSE_URL}/events?tableNumber=${tableNumber}`
        : `${SSE_URL}/events`;

      console.log("Connecting SSE:", url);
      source = new EventSource(url);

      source.onmessage = (e) => {
        console.log("SSE Message:", e.data);
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      };

      source.onerror = () => {
        console.error("SSE Error, reconnecting in", RECONNECT_DELAY, "ms");
        source?.close();
        reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY);
      };
    };

    connect();

    return () => {
      console.log("Closing SSE");
      source?.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [queryClient, tableNumber]);
}
