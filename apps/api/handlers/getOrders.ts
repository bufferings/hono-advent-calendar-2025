import { createRoute, type RouteHandler } from "@hono/zod-openapi";
import { getDb } from "../db/client.ts";
import { getOrders as getOrdersDao } from "../dao/orderDao.ts";
import { OrderListResponseSchema, OrderQuerySchema } from "../order/schema.ts";

export const getOrdersRoute = createRoute({
  method: "get",
  path: "/orders",
  tags: ["orders"],
  request: {
    query: OrderQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: OrderListResponseSchema,
        },
      },
      description: "注文一覧",
    },
  },
});

export const getOrdersHandler: RouteHandler<typeof getOrdersRoute> = async (
  c,
) => {
  const { status, tableNumber } = c.req.valid("query");
  const orders = await getOrdersDao(getDb(), { status, tableNumber });
  return c.json({
    orders: orders.map((order) => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    })),
  });
};
