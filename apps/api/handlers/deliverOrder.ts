import { Hono } from "@hono/hono";
import { createDb } from "../db/client.ts";
import { deliverOrder as deliverOrderUseCase } from "../order/deliverOrder.ts";

export const deliverOrder = new Hono().put("/orders/:id/deliver", async (c) => {
  const id = c.req.param("id");
  const db = createDb();

  try {
    await deliverOrderUseCase(db, id);
    return c.json({ ok: true });
  } finally {
    await db.destroy();
  }
});

