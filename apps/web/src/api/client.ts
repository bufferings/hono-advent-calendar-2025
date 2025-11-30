import { z } from "zod";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// Schemas
const OrderSchema = z.object({
  id: z.string(),
  orderNumber: z.number(),
  tableNumber: z.number(),
  itemName: z.string(),
  quantity: z.number(),
  status: z.enum(["ordered", "cooking", "delivered"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const OrderListResponseSchema = z.object({
  orders: z.array(OrderSchema),
});

const OkResponseSchema = z.object({
  ok: z.boolean(),
});

export type Order = z.infer<typeof OrderSchema>;

export async function fetchOrders(
  status?: string,
  tableNumber?: number
): Promise<Order[]> {
  const url = new URL(`${API_URL}/api/orders`);
  if (status) url.searchParams.set("status", status);
  if (tableNumber) url.searchParams.set("tableNumber", tableNumber.toString());

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch orders");

  const data = OrderListResponseSchema.parse(await res.json());
  return data.orders;
}

export async function createOrder(
  tableNumber: number,
  itemName: string,
  quantity: number
): Promise<Order> {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tableNumber, itemName, quantity }),
  });
  if (!res.ok) throw new Error("Failed to create order");

  return OrderSchema.parse(await res.json());
}

export async function startCooking(id: string): Promise<{ ok: boolean }> {
  const res = await fetch(`${API_URL}/api/orders/${id}/start`, {
    method: "PUT",
  });
  if (!res.ok) throw new Error("Failed to start cooking");

  return OkResponseSchema.parse(await res.json());
}

export async function deliverOrder(id: string): Promise<{ ok: boolean }> {
  const res = await fetch(`${API_URL}/api/orders/${id}/deliver`, {
    method: "PUT",
  });
  if (!res.ok) throw new Error("Failed to deliver order");

  return OkResponseSchema.parse(await res.json());
}
