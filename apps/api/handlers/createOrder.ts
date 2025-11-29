import { Hono } from "@hono/hono";
import { createDb } from "../db/client.ts";
import { createOrder as createOrderUseCase } from "../order/createOrder.ts";
import { CreateOrderRequestSchema } from "../order/schema.ts";

export const createOrder = new Hono().post("/orders", async (c) => {
  const body = await c.req.json();
  const validated = CreateOrderRequestSchema.parse(body);
  const db = createDb();

  try {
    const order = await createOrderUseCase(db, validated);
    return c.json(order, 201);
  } finally {
    await db.destroy();
  }
});

