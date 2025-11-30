import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";
import { connect, type NatsConnection, StringCodec } from "nats";
import type { OrderEvent } from "./events.ts";

const NATS_URL = Deno.env.get("NATS_URL") ?? "nats://localhost:4222";

// NATS 接続をアプリ全体で共有
let nc: NatsConnection | null = null;
const sc = StringCodec();

async function getNatsConnection(): Promise<NatsConnection> {
  if (!nc || nc.isClosed()) {
    console.log(`Connecting to NATS at ${NATS_URL}...`);
    nc = await connect({ servers: NATS_URL });
    console.log("NATS connected.");
  }
  return nc;
}

async function shutdown() {
  console.log("Shutting down...");
  if (nc && !nc.isClosed()) {
    await nc.drain();
    console.log("NATS connection closed.");
  }
  Deno.exit(0);
}

Deno.addSignalListener("SIGINT", shutdown);
Deno.addSignalListener("SIGTERM", shutdown);

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

  return streamSSE(c, async (stream) => {
    const natsConn = await getNatsConnection();
    const sub = natsConn.subscribe("order.events");

    console.log(`Client connected. Table: ${tableNumber ?? "ALL"}`);

    let aborted = false;

    // Keep-alive timer (SSE コメントで接続維持)
    const intervalId = setInterval(async () => {
      if (aborted) return;
      try {
        await stream.write(": keepalive\n\n");
      } catch {
        // Stream might be closed
      }
    }, 30000);

    // Cleanup on abort
    stream.onAbort(() => {
      console.log(`Client disconnected. Table: ${tableNumber ?? "ALL"}`);
      aborted = true;
      clearInterval(intervalId);
      sub.unsubscribe();
    });

    // Process NATS messages
    for await (const msg of sub) {
      if (aborted) break;

      try {
        const dataStr = sc.decode(msg.data);
        const event = JSON.parse(dataStr) as OrderEvent;

        // Filter by tableNumber
        if (tableNumber !== undefined && event.tableNumber !== tableNumber) {
          continue;
        }

        await stream.writeSSE({ data: dataStr });
      } catch (e) {
        console.error("Error processing message:", e);
      }
    }
  });
});

Deno.serve({ port: 3001 }, app.fetch);
