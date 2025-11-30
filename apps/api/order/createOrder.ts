import type { Kysely } from "kysely";
import type { Database } from "../db/types.ts";
import type { CreateOrderRequest } from "./schema.ts";

export async function createOrder(
  db: Kysely<Database>,
  input: CreateOrderRequest
) {
  return await db.transaction().execute(async (trx) => {
    // 1. orders に挿入
    const order = await trx
      .insertInto("orders")
      .values({
        tableNumber: input.tableNumber,
        itemName: input.itemName,
        quantity: input.quantity,
        status: "ordered",
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    // 2. event_outbox に記録
    await trx
      .insertInto("eventOutbox")
      .values({
        type: "order.created",
        aggregateId: order.id,
        payload: JSON.stringify({
          type: "order.created",
          orderId: order.id,
          tableNumber: order.tableNumber,
        }),
      })
      .execute();

    return order;
  });
}
