import { getDb, closeDb } from "./db/client.ts";

async function seed() {
  const db = getDb();

  console.log("Seeding...");

  // Clear existing data
  await db.deleteFrom("orders").execute();
  await db.deleteFrom("eventOutbox").execute();

  // Insert initial orders
  await db
    .insertInto("orders")
    .values([
      {
        tableNumber: 1,
        itemName: "サーモン",
        quantity: 2,
        status: "delivered",
      },
      {
        tableNumber: 2,
        itemName: "えび",
        quantity: 3,
        status: "cooking",
      },
      {
        tableNumber: 3,
        itemName: "まぐろ",
        quantity: 1,
        status: "ordered",
      },
    ])
    .execute();

  console.log("Seeding completed.");
  await closeDb();
}

seed();
