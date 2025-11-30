import type { Kysely } from "kysely";
import type { Database, OrderStatus } from "../db/types.ts";

export async function getOrders(
  db: Kysely<Database>,
  filters: { status?: OrderStatus; tableNumber?: number }
) {
  let query = db.selectFrom("orders").selectAll().orderBy("createdAt", "desc");

  if (filters.status) {
    query = query.where("status", "=", filters.status);
  }

  if (filters.tableNumber) {
    query = query.where("tableNumber", "=", filters.tableNumber);
  }

  return await query.execute();
}
