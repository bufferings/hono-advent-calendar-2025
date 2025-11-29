import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("event_outbox")
    .addColumn("id", "bigserial", (col) => col.primaryKey())
    .addColumn("type", "text", (col) => col.notNull())
    .addColumn("aggregate_id", "uuid", (col) => col.notNull())
    .addColumn("payload", "jsonb", (col) => col.notNull())
    .addColumn("processed", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  await db.schema
    .createIndex("idx_event_outbox_unprocessed")
    .on("event_outbox")
    .column("id")
    .where("processed", "=", false)
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("event_outbox").execute();
}

