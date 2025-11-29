import { Hono } from "@hono/hono";
import { cors } from "@hono/hono/cors";
import { connect, StringCodec } from "nats";
import type { OrderEvent } from "./events.ts";

const NATS_URL = Deno.env.get("NATS_URL") ?? "nats://localhost:4222";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    allowMethods: ["GET"],
    allowHeaders: ["Content-Type"],
  })
);

app.get("/events", (c) => {
  const tableNumberStr = c.req.query("tableNumber");
  const tableNumber = tableNumberStr ? parseInt(tableNumberStr, 10) : undefined;

  const body = new ReadableStream({
    async start(controller) {
      console.log(`Client connected. Table: ${tableNumber ?? "ALL"}`);
      const encoder = new TextEncoder();

      // Connect to NATS
      const nc = await connect({ servers: NATS_URL });
      const sc = StringCodec();
      const sub = nc.subscribe("order.events");

      // Keep-alive timer
      const intervalId = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          // Controller might be closed
          clearInterval(intervalId);
        }
      }, 30000);

      // Process NATS messages
      (async () => {
        try {
          for await (const msg of sub) {
            try {
              const dataStr = sc.decode(msg.data);
              const event = JSON.parse(dataStr) as OrderEvent;

              // Filter
              if (tableNumber !== undefined && event.tableNumber !== tableNumber) {
                continue;
              }

              controller.enqueue(encoder.encode(`data: ${dataStr}\n\n`));
            } catch (e) {
              console.error("Error processing message", e);
            }
          }
        } catch (err) {
          console.error("NATS subscription error:", err);
        }
      })();

      // Cleanup when stream is cancelled (client disconnects)
      // Note: ReadableStream's cancel is called when the client disconnects
      // BUT, Deno's serve might not trigger cancel immediately in all cases,
      // but typically it works.
      return async () => {
        console.log("Client disconnected");
        clearInterval(intervalId);
        await sub.unsubscribe();
        await nc.close();
      };
    },
    cancel() {
      console.log("Stream cancelled");
    },
  });

  return c.newResponse(body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
});

Deno.serve({ port: 3001 }, app.fetch);
