import { NextResponse } from "next/server";
import { getUserData, upsertUserData } from "@/lib/db";
import { refreshAccessToken } from "@/lib/google";
import type { GoogleTokens } from "@/lib/google";

const USER_ID = "casey";
const DASHBOARD_TIME_ZONE = "America/New_York";

export const dynamic = "force-dynamic";

function needsAuth(reason: string) {
  return NextResponse.json({ events: [], needsAuth: true, reason });
}

function getWeekBounds() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day; // week starts Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
}

export async function GET() {
  const data = await getUserData(USER_ID);
  let tokens = data.googleTokens as GoogleTokens | undefined;

  if (!tokens?.access_token) {
    return NextResponse.json({
      events: [],
      needsAuth: true,
      reason: "missing_access_token",
      lastGoogleAuthStatus: data.googleAuthStatus ?? null,
    });
  }

  // Refresh if within 5 minutes of expiry
  if (tokens.expiry_date < Date.now() + 5 * 60 * 1000) {
    if (!tokens.refresh_token) {
      return needsAuth("missing_refresh_token");
    }
    try {
      tokens = await refreshAccessToken(tokens.refresh_token);
      await upsertUserData(USER_ID, { ...data, googleTokens: tokens });
    } catch (error) {
      console.error("Failed to refresh Google Calendar token", error);
      return needsAuth("refresh_failed");
    }
  }

  const { monday, sunday } = getWeekBounds();
  const params = new URLSearchParams({
    timeMin: monday.toISOString(),
    timeMax: sunday.toISOString(),
    timeZone: DASHBOARD_TIME_ZONE,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "50",
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${tokens.access_token}` } }
  );

  if (!res.ok) {
    if (res.status === 401) return needsAuth("calendar_unauthorized");
    console.error("Failed to fetch Google Calendar events", await res.text());
    return NextResponse.json({ events: [], error: "fetch_failed" });
  }

  const cal = await res.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const events = (cal.items ?? []).map((item: any) => {
    const startRaw: string | undefined = item.start?.dateTime ?? item.start?.date;
    const date = startRaw ? startRaw.slice(0, 10) : "";
    const time = item.start?.dateTime
      ? new Date(item.start.dateTime).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZone: DASHBOARD_TIME_ZONE,
        })
      : undefined;
    return {
      id: item.id,
      title: item.summary ?? "(No title)",
      date,
      time,
      description: item.description ?? undefined,
      color: "#d68d84",
      fromGoogle: true,
      googleId: item.id,
    };
  });

  return NextResponse.json({ events });
}
