"use client";
import {
  format,
  parseISO,
  isThisMonth,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  getDay,
} from "date-fns";
import { Dumbbell, Calendar } from "lucide-react";
import DebtTracker from "./DebtTracker";
import SavingsCounter from "./SavingsCounter";
import EventsWidget from "./EventsWidget";
import Reflections from "./Reflections";
import type {
  CreditCard,
  SavingsAccount,
  GymSession,
  CalendarEvent,
  Reflection,
} from "../types";

interface Props {
  creditCards: CreditCard[];
  setCreditCards: (c: CreditCard[] | ((prev: CreditCard[]) => CreditCard[])) => void;
  savingsAccounts: SavingsAccount[];
  setSavingsAccounts: (a: SavingsAccount[] | ((prev: SavingsAccount[]) => SavingsAccount[])) => void;
  gymSessions: GymSession[];
  events: CalendarEvent[];
  setEvents: (e: CalendarEvent[] | ((prev: CalendarEvent[]) => CalendarEvent[])) => void;
  reflections: Reflection[];
  setReflections: (r: Reflection[] | ((prev: Reflection[]) => Reflection[])) => void;
}

function MiniCalendar({ sessions }: { sessions: GymSession[] }) {
  const today = new Date();
  const start = startOfMonth(today);
  const end = endOfMonth(today);
  const days = eachDayOfInterval({ start, end });

  // pad start
  const startDow = getDay(start); // 0=Sun
  const leadingDays = startDow === 0 ? 6 : startDow - 1; // Monday-first
  const padded = Array(leadingDays).fill(null).concat(days);

  const sessionDates = sessions.map((s) => s.date);
  const monthSessions = sessions.filter((s) => isThisMonth(parseISO(s.date)));

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Dumbbell size={15} className="text-cyan-400" />
          </div>
          <div>
            <p className="section-label">Gym — {format(today, "MMMM")}</p>
            <p className="text-slate-200 font-semibold text-sm">
              {monthSessions.length}{" "}
              <span className="text-slate-500 font-normal">sessions this month</span>
            </p>
          </div>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="text-center text-xs font-medium text-slate-600">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {padded.map((day, i) => {
          if (!day) return <div key={`pad-${i}`} />;
          const dateStr = format(day, "yyyy-MM-dd");
          const isGym = sessionDates.includes(dateStr);
          const isToday = isSameDay(day, today);

          return (
            <div
              key={dateStr}
              className="aspect-square flex items-center justify-center rounded-lg text-xs font-medium"
              style={{
                background: isGym
                  ? "linear-gradient(135deg, #06b6d466, #8b5cf666)"
                  : isToday
                  ? "rgba(6,182,212,0.1)"
                  : "transparent",
                border: isToday ? "1px solid rgba(6,182,212,0.3)" : "1px solid transparent",
                color: isGym ? "#e0f2fe" : isToday ? "#06b6d4" : "rgba(148,163,184,0.5)",
              }}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthSummary({
  creditCards,
  savingsAccounts,
}: {
  creditCards: CreditCard[];
  savingsAccounts: SavingsAccount[];
}) {
  const totalDebt = creditCards.reduce((s, c) => s + c.balance, 0);
  const totalSavings = savingsAccounts.reduce((s, a) => s + a.balance, 0);
  const netWorth = totalSavings - totalDebt;
  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const stats = [
    { label: "Total Debt", value: fmt(totalDebt), color: "#f59e0b", bad: true },
    { label: "Total Savings", value: fmt(totalSavings), color: "#10b981" },
    { label: "Net Worth", value: (netWorth >= 0 ? "+" : "") + fmt(netWorth), color: netWorth >= 0 ? "#8b5cf6" : "#ef4444" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="glass rounded-xl p-4 text-center">
          <p className="section-label mb-1">{s.label}</p>
          <p className="text-lg font-bold" style={{ color: s.color }}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function MonthView({
  creditCards, setCreditCards,
  savingsAccounts, setSavingsAccounts,
  gymSessions,
  events, setEvents,
  reflections, setReflections,
}: Props) {
  return (
    <div className="space-y-4">
      <MonthSummary creditCards={creditCards} savingsAccounts={savingsAccounts} />

      <MiniCalendar sessions={gymSessions} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DebtTracker cards={creditCards} setCards={setCreditCards} />
        <SavingsCounter accounts={savingsAccounts} setAccounts={setSavingsAccounts} />
      </div>

      <EventsWidget events={events} setEvents={setEvents} filter="month" />

      <Reflections reflections={reflections} setReflections={setReflections} />
    </div>
  );
}
