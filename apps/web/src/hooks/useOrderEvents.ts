import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const SSE_URL = import.meta.env.VITE_SSE_URL ?? "http://localhost:3001";

export function useOrderEvents(tableNumber?: number) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const url = tableNumber
      ? `${SSE_URL}/events?tableNumber=${tableNumber}`
      : `${SSE_URL}/events`;

    console.log("Connecting SSE:", url);
    const source = new EventSource(url);

    source.onmessage = (e) => {
      console.log("SSE Message:", e.data);
      // Invalidate queries to re-fetch data
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    };

    source.onerror = (e) => {
      console.error("SSE Error:", e);
      source.close();
    };

    return () => {
      console.log("Closing SSE");
      source.close();
    };
  }, [queryClient, tableNumber]);
}

