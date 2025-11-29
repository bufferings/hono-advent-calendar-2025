import { connect, StringCodec } from "nats";
import { createDb } from "./db/client.ts";

const NATS_URL = Deno.env.get("NATS_URL") ?? "nats://localhost:4222";
const POLLING_INTERVAL = 1000; // 1 second

async function main() {
  console.log(`Connecting to NATS at ${NATS_URL}...`);
  const nc = await connect({ servers: NATS_URL });
  const sc = StringCodec();
  const db = createDb();

  console.log("Poller started.");

  while (true) {
    try {
      await db.transaction().execute(async (trx) => {
        // 1. Fetch unprocessed events
        // Using FOR UPDATE SKIP LOCKED for concurrency safety if multiple pollers were running
        // Kysely doesn't have direct support for SKIP LOCKED in all dialects easily without raw sql or plugins,
        // but for this sample with Postgres, we can use a simple query or raw sql.
        // Since this is a sample and we likely have one poller, simple select is fine.
        // But let's try to be correct.
        
        const events = await trx
          .selectFrom("eventOutbox")
          .selectAll()
          .where("processed", "=", false)
          .orderBy("id", "asc")
          .limit(100)
          .forUpdate()
          .skipLocked()
          .execute();

        if (events.length === 0) return;

        console.log(`Processing ${events.length} events...`);

        for (const event of events) {
          const payloadStr = JSON.stringify(event.payload);
          
          // 2. Publish to NATS
          // We publish to "order.events" subject
          await nc.publish("order.events", sc.encode(payloadStr));
          
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

