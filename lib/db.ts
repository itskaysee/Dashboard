import { neon } from "@neondatabase/serverless";
import { unstable_noStore as noStore } from "next/cache";

function getDb() {
  noStore();
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(process.env.DATABASE_URL, {
    fetchOptions: { cache: "no-store" },
  });
}

export async function ensureTable() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS user_data (
      user_id TEXT PRIMARY KEY,
      data    JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function getUserData(userId: string): Promise<Record<string, unknown>> {
  const sql = getDb();
  await ensureTable();
  const rows = await sql`
    SELECT data FROM user_data WHERE user_id = ${userId}
  `;
  return (rows[0]?.data as Record<string, unknown>) ?? {};
}

export async function upsertUserData(userId: string, data: Record<string, unknown>) {
  const sql = getDb();
  await ensureTable();
  const json = JSON.stringify(data);
  await sql`
    INSERT INTO user_data (user_id, data, updated_at)
    VALUES (${userId}, ${json}::jsonb, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET data = ${json}::jsonb, updated_at = NOW()
  `;
}
