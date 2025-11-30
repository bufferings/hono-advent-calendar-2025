import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import type { Database } from "./types.ts";

const DATABASE_URL =
  Deno.env.get("DATABASE_URL") ??
  "postgres://admin:password@localhost:5432/sushi";

// シングルトン DB クライアント
let db: Kysely<Database> | null = null;

export function getDb(): Kysely<Database> {
  if (!db) {
    db = new Kysely<Database>({
      dialect: new PostgresDialect({
        pool: new pg.Pool({
          connectionString: DATABASE_URL,
          max: 10, // 最大接続数
        }),
      }),
      // DB: snake_case ↔ TS: camelCase 自動変換
      plugins: [new CamelCasePlugin()],
    });
  }
  return db;
}

export async function closeDb(): Promise<void> {
  if (db) {
    await db.destroy();
    db = null;
  }
}
