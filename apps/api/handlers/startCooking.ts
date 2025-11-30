import { createRoute, type RouteHandler } from "@hono/zod-openapi";
import { getDb } from "../db/client.ts";
import { startCooking as startCookingUseCase } from "../order/startCooking.ts";
import { OkResponseSchema, OrderIdParamSchema } from "../order/schema.ts";

export const startCookingRoute = createRoute({
  method: "put",
  path: "/orders/{id}/start",
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
      description: "調理を開始しました",
    },
  },
});

export const startCookingHandler: RouteHandler<
  typeof startCookingRoute
> = async (c) => {
  const { id } = c.req.valid("param");
  await startCookingUseCase(getDb(), id);
  return c.json({ ok: true });
};
