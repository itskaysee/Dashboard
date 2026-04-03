"use client";
import { useState } from "react";
import { format } from "date-fns";
import { useLocalStorage } from "./hooks/useLocalStorage";
import WeekView from "./components/WeekView";
import MonthView from "./components/MonthView";
import QuarterView from "./components/QuarterView";
import type {
  CreditCard,
  SavingsAccount,
  GymSession,
  CalendarEvent,
  Task,
  Reflection,
  WeeklyFocus,
  QuarterlyAchievement,
} from "./types";

type Tab = "week" | "month" | "quarter";

const TABS: { id: Tab; label: string }[] = [
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "quarter", label: "Quarter" },
];

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("week");

  const [creditCards, setCreditCards] = useLocalStorage<CreditCard[]>("creditCards", []);
  const [savingsAccounts, setSavingsAccounts] = useLocalStorage<SavingsAccount[]>("savingsAccounts", []);
  const [gymSessions, setGymSessions] = useLocalStorage<GymSession[]>("gymSessions", []);
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>("events", []);
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", []);
  const [reflections, setReflections] = useLocalStorage<Reflection[]>("reflections", []);
  const [focusData, setFocusData] = useLocalStorage<WeeklyFocus[]>("focusData", []);
  const [achievements, setAchievements] = useLocalStorage<QuarterlyAchievement[]>("achievements", []);

  const today = new Date();
  const dayOfWeek = format(today, "EEEE");
  const dateLabel = format(today, "MMMM d, yyyy");

  return (
    <div className="min-h-screen relative" style={{ background: "#06060f" }}>
      {/* Background orbs */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: "-20%",
          left: "-10%",
          width: "60vw",
          height: "60vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          bottom: "-20%",
          right: "-10%",
          width: "50vw",
          height: "50vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          top: "40%",
          right: "20%",
          width: "30vw",
          height: "30vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-2xl font-bold text-slate-100"
                style={{ fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}
              >
                Hey Casey{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  ✦
                </span>
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {dayOfWeek}, {dateLabel}
              </p>
            </div>

            {/* Tab nav */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    background:
                      tab === t.id
                        ? "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.2))"
                        : "transparent",
                    color: tab === t.id ? "#e2e8f0" : "rgba(148,163,184,0.6)",
                    border:
                      tab === t.id
                        ? "1px solid rgba(139,92,246,0.3)"
                        : "1px solid transparent",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="animate-fade-in">
          {tab === "week" && (
            <WeekView
              gymSessions={gymSessions}
              setGymSessions={setGymSessions}
              events={events}
              setEvents={setEvents}
              tasks={tasks}
              setTasks={setTasks}
              reflections={reflections}
              setReflections={setReflections}
              focusData={focusData}
              setFocusData={setFocusData}
            />
          )}
          {tab === "month" && (
            <MonthView
              creditCards={creditCards}
              setCreditCards={setCreditCards}
              savingsAccounts={savingsAccounts}
              setSavingsAccounts={setSavingsAccounts}
              gymSessions={gymSessions}
              events={events}
              setEvents={setEvents}
              reflections={reflections}
              setReflections={setReflections}
            />
          )}
          {tab === "quarter" && (
            <QuarterView
              creditCards={creditCards}
              savingsAccounts={savingsAccounts}
              gymSessions={gymSessions}
              achievements={achievements}
              setAchievements={setAchievements}
            />
          )}
        </div>

        <p className="text-center text-slate-800 text-xs mt-8">
          Built for you · {format(today, "yyyy")}
        </p>
      </div>
    </div>
  );
}
