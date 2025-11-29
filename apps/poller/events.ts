export type OrderEvent = {
  type: "order.created" | "order.cookingStarted" | "order.delivered";
  orderId: string;
  tableNumber: number;
};

