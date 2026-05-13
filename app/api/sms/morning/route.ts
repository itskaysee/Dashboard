import { NextRequest, NextResponse } from "next/server";
import { format, startOfWeek } from "date-fns";
import { getUserData, upsertUserData } from "@/lib/db";
import { sendSms } from "@/lib/twilio";
import type { CalendarEvent, Task, WeeklyFocus } from "@/app/types";

export const dynamic = "force-dynamic";

const USER_ID = "casey";
const TZ = "America/New_York";

function todayEastern(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

function weekKeyFromDate(date: Date): string {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return format(monday, "yyyy-'W'II");
}

function sundayEastern(): string {
  const now = new Date();
  const eastern = new Date(now.toLocaleString("en-US", { timeZone: TZ }));
  const day = eastern.getDay(); // 0=Sun
  const toSunday = day === 0 ? 0 : 7 - day;
  eastern.setDate(eastern.getDate() + toSunday);
  return eastern.toLocaleDateString("en-CA");
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const myPhone = process.env.MY_PHONE_NUMBER;
  if (!myPhone) {
    return NextResponse.json({ error: "MY_PHONE_NUMBER not set" }, { status: 500 });
  }

  const data = await getUserData(USER_ID);
  const today = todayEastern();
  const sunday = sundayEastern();
  const weekKey = weekKeyFromDate(new Date());

  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: TZ });

  // Today's events sorted by time
  const events = ((data.events as CalendarEvent[]) ?? [])
    .filter((e) => e.date === today)
    .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));

  // This week's incomplete tasks (today through Sunday)
  const allTasks = (data.tasks as Task[]) ?? [];
  const weekTasks = allTasks
    .filter((t) => !t.completed && t.date >= today && t.date <= sunday)
    .slice(0, 8);

  // Weekly focus
  const focusEntry = ((data.focusData as WeeklyFocus[]) ?? []).find(
    (f) => f.weekKey === weekKey
  );

  // Build message
  let msg = `Good morning Casey! ✦\n`;
  msg += `${dayName}\n\n`;

  if (events.length > 0) {
    msg += `📅 Today:\n`;
    for (const e of events) {
      msg += `• ${e.time ? e.time + " — " : ""}${e.title}\n`;
    }
    msg += "\n";
  } else {
    msg += `📅 No events today.\n\n`;
  }

  if (focusEntry?.focus) {
    msg += `🎯 Focus: ${focusEntry.focus}\n`;
  }
  if (focusEntry?.goals?.length) {
    for (const g of focusEntry.goals) {
      msg += `  → ${g}\n`;
    }
    msg += "\n";
  }

  if (weekTasks.length > 0) {
    msg += `✅ Tasks this week:\n`;
    const taskMap: { num: number; id: string; title: string }[] = [];
    weekTasks.forEach((t, i) => {
      msg += `${i + 1}. ${t.title}\n`;
      taskMap.push({ num: i + 1, id: t.id, title: t.title });
    });
    msg += `\nReply "done 1 2" to check off tasks`;

    await upsertUserData(USER_ID, { ...data, smsPendingTasks: taskMap });
  } else {
    msg += `✅ No tasks remaining this week!`;
  }

  await sendSms(myPhone, msg);

  return NextResponse.json({
    ok: true,
    today,
    events: events.length,
    tasks: weekTasks.length,
  });
}
