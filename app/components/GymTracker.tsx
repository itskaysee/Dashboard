"use client";
import { useState } from "react";
import { Dumbbell, Flame } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns";
import type { GymSession } from "../types";

interface Props {
  sessions: GymSession[];
  setSessions: (s: GymSession[] | ((prev: GymSession[]) => GymSession[])) => void;
  weekStart?: Date;
}

export default function GymTracker({ sessions, setSessions, weekStart: weekStartProp }: Props) {
  const today = new Date();
  const weekStart = weekStartProp ?? startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const [pumping, setPumping] = useState<string | null>(null);

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
      setSessions((prev) => [...prev, { id: crypto.randomUUID(), date: dateStr }]);
      // Trigger pump animation
      setPumping(dateStr);
      setTimeout(() => setPumping(null), 900);
    }
  };

  const isLogged = (date: Date) => sessions.some((s) => s.date === format(date, "yyyy-MM-dd"));

  const streak = (() => {
    let count = 0;
    let d = new Date(today);
    while (true) {
      const dateStr = format(d, "yyyy-MM-dd");
      if (sessions.some((s) => s.date === dateStr)) { count++; d = addDays(d, -1); }
      else break;
    }
    return count;
  })();

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="glass rounded-2xl p-5 overflow-hidden">
      <style>{`
        @keyframes weightPump {
          0%   { transform: scale(1) rotate(0deg); }
          20%  { transform: scale(1.5) rotate(-12deg) translateY(-4px); }
          40%  { transform: scale(1.3) rotate(8deg) translateY(-8px); }
          60%  { transform: scale(1.6) rotate(-6deg) translateY(-6px); }
          80%  { transform: scale(1.2) rotate(4deg) translateY(-3px); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes rippleOut {
          0%   { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes starPop {
          0%   { transform: scale(0) rotate(0deg); opacity: 1; }
          60%  { transform: scale(1.4) rotate(20deg); opacity: 1; }
          100% { transform: scale(0) rotate(40deg); opacity: 0; }
        }
        .weight-pump { animation: weightPump 0.9s cubic-bezier(0.36,0.07,0.19,0.97); }
        .ripple { animation: rippleOut 0.6s ease-out forwards; }
        .star-pop { animation: starPop 0.7s ease-out forwards; }
      `}</style>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#f6efdf", border: "1px solid #e8dfcf" }}>
            <Dumbbell size={15} style={{ color: "#866a5b" }} />
          </div>
          <div>
            <p className="section-label">Gym This Week</p>
            <p className="text-sm font-semibold" style={{ color: "#785b4e" }}>
              {thisWeekSessions.length}{" "}
              <span className="font-normal" style={{ color: "#a2998f" }}>/ 5 sessions</span>
            </p>
          </div>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
            style={{ background: "#f6efdf", border: "1px solid #e1ad9d" }}>
            <Flame size={13} style={{ color: "#d68d84" }} />
            <span className="text-xs font-semibold" style={{ color: "#866a5b" }}>{streak}d streak</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {weekDays.map((day, i) => {
          const active = isLogged(day);
          const isToday = isSameDay(day, today);
          const isPast = day < today;
          const dateStr = format(day, "yyyy-MM-dd");
          const isPumping = pumping === dateStr;

          return (
            <button key={i} onClick={() => toggleDay(day)} className="flex flex-col items-center gap-1.5">
              <span className="text-xs font-medium"
                style={{ color: isToday ? "#866a5b" : isPast ? "#c5b9ab" : "#e8dfcf" }}>
                {dayLabels[i]}
              </span>
              <div className="relative w-full aspect-square">
                {/* Ripple ring */}
                {isPumping && (
                  <div className="ripple absolute inset-0 rounded-lg pointer-events-none"
                    style={{ border: "2px solid #d68d84", zIndex: 10 }} />
                )}
                {/* Mini star sparks */}
                {isPumping && ["✦", "✦", "✦"].map((s, si) => (
                  <span key={si} className="star-pop absolute text-xs pointer-events-none select-none"
                    style={{
                      color: ["#d68d84", "#cfbb9f", "#8e967d"][si],
                      top: ["−10%", "50%", "−5%"][si],
                      left: ["-15%", "105%", "60%"][si],
                      zIndex: 20,
                      animationDelay: `${si * 0.06}s`,
                      fontSize: "10px",
                    }}>
                    {s}
                  </span>
                ))}
                <div
                  className={`w-full h-full rounded-lg flex items-center justify-center transition-all duration-200${isPumping ? " weight-pump" : ""}`}
                  style={{
                    background: active ? "#d68d84" : isToday ? "rgba(214,141,132,0.08)" : "#f9f7ef",
                    border: active ? "1px solid #c47a72" : isToday ? "1px solid rgba(214,141,132,0.3)" : "1px solid #ebe6dd",
                    boxShadow: active ? "0 2px 8px rgba(214,141,132,0.25)" : "none",
                  }}
                >
                  {active ? (
                    <Dumbbell size={12} style={{ color: "white" }} />
                  ) : (
                    <span className="text-xs font-medium" style={{ color: isToday ? "#d68d84" : "#c5b9ab" }}>
                      {format(day, "d")}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#ebe6dd" }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${(thisWeekSessions.length / 5) * 100}%`, background: "#d68d84" }} />
        </div>
        <p className="text-xs mt-1.5 text-right" style={{ color: "#c5b9ab" }}>Goal: 5 sessions/week</p>
      </div>
    </div>
  );
}
