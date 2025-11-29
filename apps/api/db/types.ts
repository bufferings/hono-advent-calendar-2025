import type { Generated } from "kysely";

// orders テーブル
export interface OrderTable {
  id: Generated<string>;
  orderNumber: Generated<number>;
  tableNumber: number;
  itemName: string;
  quantity: number;
  status: string;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

// event_outbox テーブル
export interface EventOutboxTable {
  id: Generated<number>;
  type: string;
  aggregateId: string;
  payload: unknown;
  processed: boolean;
  createdAt: Generated<Date>;
}

// Database 型
export interface Database {
  orders: OrderTable;
  eventOutbox: EventOutboxTable;  // DB: event_outbox
}
