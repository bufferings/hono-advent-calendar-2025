import { createRoute, type RouteHandler } from "@hono/zod-openapi";
import { getDb } from "../db/client.ts";
import { createOrder as createOrderUseCase } from "../order/createOrder.ts";
import { CreateOrderRequestSchema, OrderSchema } from "../order/schema.ts";

export const createOrderRoute = createRoute({
  method: "post",
  path: "/orders",
  tags: ["orders"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateOrderRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: OrderSchema,
        },
      },
      description: "注文を作成しました",
    },
  },
});

export const createOrderHandler: RouteHandler<typeof createOrderRoute> = async (
  c
) => {
  const body = c.req.valid("json");
  const order = await createOrderUseCase(getDb(), body);
  return c.json(
    {
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    },
    201
  );
};
