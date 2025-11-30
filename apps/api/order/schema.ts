import { z } from "@hono/zod-openapi";

// Order Schema
export const OrderSchema = z
  .object({
    id: z.string().uuid(),
    orderNumber: z.number().int(),
    tableNumber: z.number().int(),
    itemName: z.string(),
    quantity: z.number().int(),
    status: z.enum(["ordered", "cooking", "delivered"]),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi("Order");
export type Order = z.infer<typeof OrderSchema>;

// Request Schemas
export const CreateOrderRequestSchema = z
  .object({
    tableNumber: z.number().int().positive().openapi({ example: 1 }),
    itemName: z.string().min(1).openapi({ example: "サーモン" }),
    quantity: z.number().int().positive().openapi({ example: 2 }),
  })
  .openapi("CreateOrderRequest");
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;

// Response Schemas
export const OrderListResponseSchema = z
  .object({
    orders: z.array(OrderSchema),
  })
  .openapi("OrderListResponse");

export const OkResponseSchema = z
  .object({
    ok: z.boolean(),
  })
  .openapi("OkResponse");

// Path Parameters
export const OrderIdParamSchema = z
  .object({
    id: z
      .string()
      .uuid()
      .openapi({ param: { name: "id", in: "path" } }),
  })
  .openapi("OrderIdParam");

// Query Parameters
export const OrderQuerySchema = z.object({
  status: z.enum(["ordered", "cooking", "delivered"]).optional(),
  tableNumber: z.coerce.number().int().positive().optional(),
});

// Event Schemas (内部用)
export const OrderEventSchema = z.object({
  type: z.enum(["order.created", "order.cookingStarted", "order.delivered"]),
  orderId: z.string().uuid(),
  tableNumber: z.number().int(),
});
export type OrderEvent = z.infer<typeof OrderEventSchema>;
