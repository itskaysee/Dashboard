"use client";
import { Dumbbell, Flame } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns";
import type { GymSession } from "../types";

interface Props {
  sessions: GymSession[];
  setSessions: (s: GymSession[] | ((prev: GymSession[]) => GymSession[])) => void;
}

export default function GymTracker({ sessions, setSessions }: Props) {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const thisWeekSessions = sessions.filter((s) => {
    const d = parseISO(s.date);
    return weekDays.some((wd) => isSameDay(wd, d));
  });

  const toggleDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const existing = sessions.find((s) => s.date === dateStr);
    if (existing) {
      setSessions((prev) => prev.filter((s) => s.date !== dateStr));
    } else {
      setSessions((prev) => [
        ...prev,
        { id: crypto.randomUUID(), date: dateStr },
      ]);
    }
  };

  const isLogged = (date: Date) =>
    sessions.some((s) => s.date === format(date, "yyyy-MM-dd"));

  const streak = (() => {
    let count = 0;
    let d = new Date(today);
    while (true) {
      const dateStr = format(d, "yyyy-MM-dd");
      if (sessions.some((s) => s.date === dateStr)) {
        count++;
        d = addDays(d, -1);
      } else {
        break;
      }
    }
    return count;
  })();

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Dumbbell size={15} className="text-cyan-400" />
          </div>
          <div>
            <p className="section-label">Gym This Week</p>
            <p className="text-slate-200 font-semibold text-sm">
              {thisWeekSessions.length}{" "}
              <span className="text-slate-500 font-normal">/ 5 sessions</span>
            </p>
          </div>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/25">
            <Flame size={13} className="text-orange-400" />
            <span className="text-xs font-semibold text-orange-300">
              {streak}d streak
            </span>
          </div>
        )}
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {weekDays.map((day, i) => {
          const active = isLogged(day);
          const isToday = isSameDay(day, today);
          const isPast = day < today;

          return (
            <button
              key={i}
              onClick={() => toggleDay(day)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <span
                className="text-xs font-medium"
                style={{
                  color: isToday
                    ? "#06b6d4"
                    : isPast
                    ? "rgba(148,163,184,0.5)"
                    : "rgba(148,163,184,0.3)",
                }}
              >
                {dayLabels[i]}
              </span>
              <div
                className="w-full aspect-square rounded-lg flex items-center justify-center transition-all duration-200"
                style={{
                  background: active
                    ? "linear-gradient(135deg, #06b6d4, #8b5cf6)"
                    : isToday
                    ? "rgba(6,182,212,0.1)"
                    : "rgba(255,255,255,0.04)",
                  border: active
                    ? "1px solid rgba(6,182,212,0.5)"
                    : isToday
                    ? "1px solid rgba(6,182,212,0.3)"
                    : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: active ? "0 0 12px rgba(6,182,212,0.3)" : "none",
                }}
              >
                {active && <Dumbbell size={12} className="text-white" />}
                <span
                  className="text-xs font-medium"
                  style={{
                    color: active ? "white" : "rgba(148,163,184,0.4)",
                    display: active ? "none" : "block",
                  }}
                >
                  {format(day, "d")}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${(thisWeekSessions.length / 5) * 100}%`,
              background: "linear-gradient(90deg, #06b6d4, #8b5cf6)",
              boxShadow: "0 0 8px rgba(6,182,212,0.4)",
            }}
          />
        </div>
        <p className="text-xs text-slate-600 mt-1.5 text-right">
          Goal: 5 sessions/week
        </p>
      </div>
    </div>
  );
}
