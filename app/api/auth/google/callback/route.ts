import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, getRedirectUri } from "@/lib/google";
import { getUserData, upsertUserData } from "@/lib/db";

const USER_ID = "casey";

export const dynamic = "force-dynamic";

function toSafeError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message
    .replace(/"access_token"\s*:\s*"[^"]+"/g, '"access_token":"[redacted]"')
    .replace(/"refresh_token"\s*:\s*"[^"]+"/g, '"refresh_token":"[redacted]"')
    .slice(0, 1000);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const origin = req.nextUrl.origin;
  const redirectUri = getRedirectUri(origin);

  if (error || !code) {
    const existing = await getUserData(USER_ID);
    await upsertUserData(USER_ID, {
      ...existing,
      googleAuthStatus: {
        status: "callback_error",
        at: new Date().toISOString(),
        origin,
        redirectUri,
        error,
        errorDescription,
        hasCode: Boolean(code),
      },
    });
    return NextResponse.redirect(`${origin}/?googleAuth=error`);
  }

  try {
    const tokens = await exchangeCode(code, redirectUri);
    const existing = await getUserData(USER_ID);
    await upsertUserData(USER_ID, {
      ...existing,
      googleTokens: tokens,
      googleAuthStatus: {
        status: "connected",
        at: new Date().toISOString(),
        origin,
        redirectUri,
        hasAccessToken: Boolean(tokens.access_token),
        hasRefreshToken: Boolean(tokens.refresh_token),
        expiryDate: tokens.expiry_date,
      },
    });
  } catch (error) {
    console.error("Failed to connect Google Calendar", error);
    const existing = await getUserData(USER_ID);
    await upsertUserData(USER_ID, {
      ...existing,
      googleAuthStatus: {
        status: "exchange_or_save_failed",
        at: new Date().toISOString(),
        origin,
        redirectUri,
        error: toSafeError(error),
      },
    });
    return NextResponse.redirect(`${origin}/?googleAuth=error`);
  }

  return NextResponse.redirect(`${origin}/?googleAuth=connected`);
}
