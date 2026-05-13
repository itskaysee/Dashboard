import { getUserData, upsertUserData } from "@/lib/db";

const USER_ID = "casey";
const SERVER_ONLY_KEYS = ["googleTokens", "googleAuthStatus"] as const;

export const dynamic = "force-dynamic";

function stripServerOnlyData(data: Record<string, unknown>) {
  const safeData = { ...data };
  for (const key of SERVER_ONLY_KEYS) {
    delete safeData[key];
  }
  return safeData;
}

function preserveServerOnlyData(
  existing: Record<string, unknown>,
  incoming: Record<string, unknown>
) {
  const next = { ...incoming };
  for (const key of SERVER_ONLY_KEYS) {
    if (existing[key] !== undefined) {
      next[key] = existing[key];
    }
  }
  return next;
}

export async function GET() {
  const data = await getUserData(USER_ID);
  return Response.json(stripServerOnlyData(data));
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const existing = await getUserData(USER_ID);
  await upsertUserData(USER_ID, preserveServerOnlyData(existing, body));
  return Response.json({ ok: true });
}
