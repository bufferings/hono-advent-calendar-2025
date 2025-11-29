import type { Generated } from "kysely";

export interface EventOutboxTable {
  id: Generated<number>;
  type: string;
  aggregateId: string;
  payload: unknown;
  processed: boolean;
  createdAt: Generated<Date>;
}

export interface Database {
  eventOutbox: EventOutboxTable;
}

