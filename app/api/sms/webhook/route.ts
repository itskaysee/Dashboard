import { NextRequest } from "next/server";
import { getUserData, upsertUserData } from "@/lib/db";
import { twimlResponse, twimlEmpty } from "@/lib/twilio";
import type { Task } from "@/app/types";

export const dynamic = "force-dynamic";

const USER_ID = "casey";

interface PendingTask {
  num: number;
  id: string;
  title: string;
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const body = (form.get("Body") as string ?? "").trim();
  const from = (form.get("From") as string ?? "").trim();

  const myPhone = process.env.MY_PHONE_NUMBER ?? "";

  // Only handle messages from Casey's number
  if (!myPhone || from !== myPhone) {
    return twimlEmpty();
  }

  const lower = body.toLowerCase();

  // Must start with done / yes / complete / finished
  if (!/^(done|yes|complete|finished?)/.test(lower)) {
    return twimlResponse(
      'Reply "done 1 2" to check off tasks by number, or "done all" for everything.'
    );
  }

  const data = await getUserData(USER_ID);
  const pending = (data.smsPendingTasks as PendingTask[]) ?? [];
  const tasks = (data.tasks as Task[]) ?? [];

  if (pending.length === 0) {
    return twimlResponse("No pending tasks found. Send your morning check-in first.");
  }

  // Parse which task numbers to complete
  const rest = lower.replace(/^(done|yes|complete|finished?)\s*/i, "").trim();
  let toComplete: PendingTask[];

  if (rest === "all" || rest === "") {
    toComplete = pending;
  } else {
    const nums = rest.split(/[\s,]+/).map(Number).filter((n) => n > 0 && !isNaN(n));
    toComplete = pending.filter((p) => nums.includes(p.num));
  }

  if (toComplete.length === 0) {
    return twimlResponse("Couldn't match those numbers. Check the task list from this morning.");
  }

  const idsToComplete = new Set(toComplete.map((p) => p.id));
  const updatedTasks = tasks.map((t) =>
    idsToComplete.has(t.id) ? { ...t, completed: true } : t
  );

  await upsertUserData(USER_ID, { ...data, tasks: updatedTasks });

  const names = toComplete.map((p) => `• ${p.title}`).join("\n");
  return twimlResponse(`✓ Marked done:\n${names}\n\nGreat work! ✦`);
}
