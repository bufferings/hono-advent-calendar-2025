export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type Order = {
  id: string;
  orderNumber: number;
  tableNumber: number;
  itemName: string;
  quantity: number;
  status: "ordered" | "cooking" | "delivered";
  createdAt: string;
  updatedAt: string;
};

export async function fetchOrders(status?: string, tableNumber?: number): Promise<Order[]> {
  const url = new URL(`${API_URL}/api/orders`);
  if (status) url.searchParams.set("status", status);
  if (tableNumber) url.searchParams.set("tableNumber", tableNumber.toString());

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch orders");
  const data = await res.json();
  return data.orders;
}

export async function createOrder(tableNumber: number, itemName: string, quantity: number) {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tableNumber, itemName, quantity }),
  });
  if (!res.ok) throw new Error("Failed to create order");
  return await res.json();
}

export async function startCooking(id: string) {
  const res = await fetch(`${API_URL}/api/orders/${id}/start`, {
    method: "PUT",
  });
  if (!res.ok) throw new Error("Failed to start cooking");
  return await res.json();
}

export async function deliverOrder(id: string) {
  const res = await fetch(`${API_URL}/api/orders/${id}/deliver`, {
    method: "PUT",
  });
  if (!res.ok) throw new Error("Failed to deliver order");
  return await res.json();
}
