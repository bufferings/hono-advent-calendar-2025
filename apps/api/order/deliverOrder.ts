import type { Kysely } from "kysely";
import type { Database } from "../db/types.ts";

export async function deliverOrder(db: Kysely<Database>, id: string) {
  return await db.transaction().execute(async (trx) => {
    // 1. orders を更新
    const order = await trx
      .updateTable("orders")
      .set({ status: "delivered", updatedAt: new Date() })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();

    // 2. event_outbox に記録
    await trx
      .insertInto("eventOutbox")
      .values({
        type: "order.delivered",
        aggregateId: order.id,
        payload: JSON.stringify({
          type: "order.delivered",
          orderId: order.id,
          tableNumber: order.tableNumber,
        }),
      })
      .execute();

    return order;
  });
}

