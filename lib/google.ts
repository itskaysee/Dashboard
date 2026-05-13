const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const CONFIGURED_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  "https://casey-dashboard-sigma.vercel.app/api/auth/google/callback";

export function getRedirectUri(origin?: string): string {
  if (process.env.GOOGLE_REDIRECT_URI) {
    return process.env.GOOGLE_REDIRECT_URI;
  }

  if (origin?.includes("localhost") || origin?.includes("127.0.0.1")) {
    return `${origin}/api/auth/google/callback`;
  }

  return CONFIGURED_REDIRECT_URI;
}

export function getAuthUrl(state: string, redirectUri = getRedirectUri()): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar.readonly",
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date: number;
}

export async function exchangeCode(code: string, redirectUri = getRedirectUri()): Promise<GoogleTokens> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const d = await res.json();
  return {
    access_token: d.access_token,
    refresh_token: d.refresh_token,
    expiry_date: Date.now() + d.expires_in * 1000,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const d = await res.json();
  return {
    access_token: d.access_token,
    refresh_token: refreshToken,
    expiry_date: Date.now() + d.expires_in * 1000,
  };
}
