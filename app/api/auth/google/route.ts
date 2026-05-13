import { NextResponse } from "next/server";
import { getAuthUrl, getRedirectUri } from "@/lib/google";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const state = crypto.randomUUID();
  const url = getAuthUrl(state, getRedirectUri(req.nextUrl.origin));
  const response = NextResponse.redirect(url);
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });
  return response;
}
