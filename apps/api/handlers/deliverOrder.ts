import { createRoute, type RouteHandler } from "@hono/zod-openapi";
import { getDb } from "../db/client.ts";
import { deliverOrder as deliverOrderUseCase } from "../order/deliverOrder.ts";
import { OkResponseSchema, OrderIdParamSchema } from "../order/schema.ts";

export const deliverOrderRoute = createRoute({
  method: "put",
  path: "/orders/{id}/deliver",
  tags: ["orders"],
  request: {
    params: OrderIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: OkResponseSchema,
        },
      },
      description: "配膳しました",
    },
  },
});

export const deliverOrderHandler: RouteHandler<
  typeof deliverOrderRoute
> = async (c) => {
  const { id } = c.req.valid("param");
  await deliverOrderUseCase(getDb(), id);
  return c.json({ ok: true });
};
