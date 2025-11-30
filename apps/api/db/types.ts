import type { Generated } from "kysely";

// orders テーブル
export type OrderStatus = "ordered" | "cooking" | "delivered";

export interface OrderTable {
  id: Generated<string>;
  orderNumber: Generated<number>;
  tableNumber: number;
  itemName: string;
  quantity: number;
  status: OrderStatus;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

// event_outbox テーブル
export interface EventOutboxTable {
  id: Generated<number>;
  type: string;
  aggregateId: string;
  payload: unknown;
  processed: Generated<boolean>;
  createdAt: Generated<Date>;
}

// Database 型
export interface Database {
  orders: OrderTable;
  eventOutbox: EventOutboxTable; // DB: event_outbox
}
