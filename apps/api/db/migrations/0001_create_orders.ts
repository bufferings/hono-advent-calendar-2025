import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("orders")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn("table_number", "integer", (col) => col.notNull())
    .addColumn("item_name", "text", (col) => col.notNull())
    .addColumn("quantity", "integer", (col) => col.notNull().defaultTo(1))
    .addColumn("status", "text", (col) => col.notNull().defaultTo("ordered"))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  await db.schema
    .createIndex("idx_orders_status")
    .on("orders")
    .column("status")
    .execute();

  await db.schema
    .createIndex("idx_orders_table_number")
    .on("orders")
    .column("table_number")
    .execute();

  await db.schema
    .createIndex("idx_orders_created_at")
    .on("orders")
    .column("created_at")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("orders").execute();
}
