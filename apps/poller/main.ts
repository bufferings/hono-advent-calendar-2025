import { connect, type NatsConnection, StringCodec } from "nats";
import { createDb } from "./db/client.ts";
import type { Kysely } from "kysely";
import type { Database } from "./db/types.ts";

const NATS_URL = Deno.env.get("NATS_URL") ?? "nats://localhost:4222";
const POLLING_INTERVAL = 1000; // 1 second

let running = true;
let nc: NatsConnection | null = null;
let db: Kysely<Database> | null = null;

async function shutdown() {
  console.log("Shutting down...");
  running = false;

  if (nc) {
    await nc.drain();
    console.log("NATS connection closed.");
  }

  if (db) {
    await db.destroy();
    console.log("DB connection closed.");
  }

  Deno.exit(0);
}

Deno.addSignalListener("SIGINT", shutdown);
Deno.addSignalListener("SIGTERM", shutdown);

async function main() {
  console.log(`Connecting to NATS at ${NATS_URL}...`);
  nc = await connect({ servers: NATS_URL });
  const sc = StringCodec();
  db = createDb();

  console.log("Poller started.");

  while (running) {
    try {
      await db.transaction().execute(async (trx) => {
        // 1. Fetch unprocessed events
        const events = await trx
          .selectFrom("eventOutbox")
          .selectAll()
          .where("processed", "=", false)
          .orderBy("id", "asc")
          .limit(100)
          .forUpdate()
          .execute();

        if (events.length === 0) return;

        console.log(`Processing ${events.length} events...`);

        for (const event of events) {
          const payloadStr = JSON.stringify(event.payload);

          // 2. Publish to NATS
          // We publish to "order.events" subject
          nc!.publish("order.events", sc.encode(payloadStr));
          console.log(`Published event: ${event.type} (ID: ${event.id})`);

          // 3. Mark as processed
          await trx
            .updateTable("eventOutbox")
            .set({ processed: true })
            .where("id", "=", event.id)
            .execute();
        }
      });
    } catch (err) {
      console.error("Error in polling loop:", err);
    }

    // Sleep
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
  }
}

main();
