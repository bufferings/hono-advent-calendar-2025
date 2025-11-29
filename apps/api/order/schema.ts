import { z } from "zod";

// Request Schemas
export const CreateOrderRequestSchema = z.object({
  tableNumber: z.number().int().positive(),
  itemName: z.string().min(1),
  quantity: z.number().int().positive(),
});
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;

// Event Schemas
export const OrderEventSchema = z.object({
  type: z.enum(["order.created", "order.cookingStarted", "order.delivered"]),
  orderId: z.string().uuid(),
  tableNumber: z.number().int(),
});
export type OrderEvent = z.infer<typeof OrderEventSchema>;

