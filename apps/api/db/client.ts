import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import type { Database } from "./types.ts";

const DATABASE_URL = Deno.env.get("DATABASE_URL") 
  ?? "postgres://admin:password@localhost:5432/sushi";

export function createDb(): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({
        connectionString: DATABASE_URL,
      }),
    }),
    // DB: snake_case ↔ TS: camelCase 自動変換
    plugins: [new CamelCasePlugin()],
  });
}

