import { Hono } from "@hono/hono";
import { createDb } from "../db/client.ts";
import { startCooking as startCookingUseCase } from "../order/startCooking.ts";

export const startCooking = new Hono().put("/orders/:id/start", async (c) => {
  const id = c.req.param("id");
  const db = createDb();

  try {
    await startCookingUseCase(db, id);
    return c.json({ ok: true });
  } finally {
    await db.destroy();
  }
});

