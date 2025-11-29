import { Hono } from "@hono/hono";
import { createDb } from "../db/client.ts";
import { getOrders as getOrdersDao } from "../dao/orderDao.ts";

export const getOrders = new Hono().get("/orders", async (c) => {
  const status = c.req.query("status");
  const tableNumberStr = c.req.query("tableNumber");
  const tableNumber = tableNumberStr ? parseInt(tableNumberStr, 10) : undefined;

  const db = createDb();

  try {
    const orders = await getOrdersDao(db, { status, tableNumber });
    return c.json({ orders });
  } finally {
    await db.destroy();
  }
});

