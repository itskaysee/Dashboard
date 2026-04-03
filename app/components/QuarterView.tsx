"use client";
import { useState } from "react";
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  subWeeks,
  eachWeekOfInterval,
  isWithinInterval,
  getQuarter,
  startOfQuarter,
  endOfQuarter,
} from "date-fns";
import { Trophy, TrendingUp, Dumbbell, Plus, X } from "lucide-react";
import type {
  CreditCard,
  SavingsAccount,
  GymSession,
  QuarterlyAchievement,
} from "../types";

interface Props {
  creditCards: CreditCard[];
  savingsAccounts: SavingsAccount[];
  gymSessions: GymSession[];
  achievements: QuarterlyAchievement[];
  setAchievements: (
    a: QuarterlyAchievement[] | ((prev: QuarterlyAchievement[]) => QuarterlyAchievement[])
  ) => void;
}

function GymConsistency({ sessions }: { sessions: GymSession[] }) {
  const today = new Date();
  // Last 13 weeks
  const weeks = eachWeekOfInterval(
    { start: subWeeks(today, 12), end: today },
    { weekStartsOn: 1 }
  );

  const weekData = weeks.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const count = sessions.filter((s) => {
      const d = parseISO(s.date);
      return isWithinInterval(d, { start: weekStart, end: weekEnd });
    }).length;
    return { weekStart, count };
  });

  const max = Math.max(...weekData.map((w) => w.count), 1);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
          <Dumbbell size={15} className="text-cyan-400" />
        </div>
        <div>
          <p className="section-label">Gym Consistency</p>
          <p className="text-xs text-slate-500">Last 13 weeks</p>
        </div>
      </div>

      <div className="flex items-end gap-1.5 h-20">
        {weekData.map(({ weekStart, count }, i) => {
          const heightPct = max > 0 ? (count / max) * 100 : 0;
          const isCurrentWeek = i === weekData.length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              {count > 0 && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-xs text-slate-200 px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                  {count} {count === 1 ? "session" : "sessions"}
                </div>
              )}
              <div
                className="w-full rounded-sm transition-all duration-500"
                style={{
                  height: `${Math.max(heightPct, 8)}%`,
                  background: isCurrentWeek
                    ? "linear-gradient(to top, #06b6d4, #8b5cf6)"
                    : count > 0
                    ? "rgba(6,182,212,0.35)"
                    : "rgba(255,255,255,0.05)",
                  boxShadow: isCurrentWeek ? "0 0 10px rgba(6,182,212,0.3)" : "none",
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-slate-700">12 weeks ago</span>
        <span className="text-xs text-cyan-500 font-medium">This week</span>
      </div>
    </div>
  );
}

function QuarterFinances({
  creditCards,
  savingsAccounts,
}: {
  creditCards: CreditCard[];
  savingsAccounts: SavingsAccount[];
}) {
  const totalDebt = creditCards.reduce((s, c) => s + c.balance, 0);
  const totalOriginal = creditCards.reduce((s, c) => s + c.originalBalance, 0);
  const totalPaid = totalOriginal - totalDebt;
  const totalSavings = savingsAccounts.reduce((s, a) => s + a.balance, 0);
  const totalSavingsGoal = savingsAccounts.reduce((s, a) => s + a.goal, 0);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const quarter = getQuarter(new Date());

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <TrendingUp size={15} className="text-emerald-400" />
        </div>
        <div>
          <p className="section-label">Finances — Q{quarter} {format(new Date(), "yyyy")}</p>
          <p className="text-xs text-slate-500">Debt paydown & savings progress</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Debt */}
        <div>
          <div className="flex justify-between mb-1.5">
            <p className="text-sm font-medium text-slate-300">Debt Paid Off</p>
            <p className="text-sm font-bold text-amber-400">{fmt(totalPaid)}</p>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: totalOriginal > 0 ? `${(totalPaid / totalOriginal) * 100}%` : "0%",
                background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
                boxShadow: "0 0 8px rgba(245,158,11,0.4)",
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-slate-600">
              {totalOriginal > 0 ? ((totalPaid / totalOriginal) * 100).toFixed(0) : 0}% paid
            </span>
            <span className="text-xs text-slate-600">{fmt(totalDebt)} remaining</span>
          </div>
        </div>

        {/* Savings */}
        <div>
          <div className="flex justify-between mb-1.5">
            <p className="text-sm font-medium text-slate-300">Savings Progress</p>
            <p className="text-sm font-bold text-emerald-400">{fmt(totalSavings)}</p>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: totalSavingsGoal > 0
                  ? `${Math.min((totalSavings / totalSavingsGoal) * 100, 100)}%`
                  : "0%",
                background: "linear-gradient(90deg, #10b981, #34d399)",
                boxShadow: "0 0 8px rgba(16,185,129,0.4)",
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-slate-600">
              {totalSavingsGoal > 0
                ? ((totalSavings / totalSavingsGoal) * 100).toFixed(0)
                : 0}% of goal
            </span>
            <span className="text-xs text-slate-600">{fmt(totalSavingsGoal)} goal</span>
          </div>
        </div>

        {/* Net worth */}
        <div className="pt-3 border-t border-white/5">
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Net Worth (savings − debt)</span>
            <span
              className="text-sm font-bold"
              style={{
                color: totalSavings - totalDebt >= 0 ? "#8b5cf6" : "#ef4444",
              }}
            >
              {fmt(totalSavings - totalDebt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Achievements({
  achievements,
  setAchievements,
}: {
  achievements: QuarterlyAchievement[];
  setAchievements: (
    a: QuarterlyAchievement[] | ((prev: QuarterlyAchievement[]) => QuarterlyAchievement[])
  ) => void;
}) {
  const [newWin, setNewWin] = useState("");
  const today = new Date();
  const qKey = `${format(today, "yyyy")}-Q${getQuarter(today)}`;
  const qAchievements = achievements.filter((a) => a.quarterKey === qKey);

  const add = () => {
    if (!newWin.trim()) return;
    setAchievements((prev) => [
      ...prev,
      { id: crypto.randomUUID(), quarterKey: qKey, text: newWin.trim() },
    ]);
    setNewWin("");
  };

  const remove = (id: string) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
          <Trophy size={15} className="text-amber-400" />
        </div>
        <div>
          <p className="section-label">Quarterly Wins</p>
          <p className="text-xs text-slate-500">
            Q{getQuarter(today)} {format(today, "yyyy")} achievements
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {qAchievements.length === 0 && (
          <p className="text-slate-600 text-sm italic py-2">
            No wins logged yet — start celebrating your progress!
          </p>
        )}
        {qAchievements.map((a) => (
          <div key={a.id} className="flex items-start gap-2.5 group py-1">
            <span className="text-amber-400 mt-0.5">✦</span>
            <span className="text-sm text-slate-300 flex-1">{a.text}</span>
            <button
              onClick={() => remove(a.id)}
              className="text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="dash-input flex-1 text-sm"
          placeholder="Log a win..."
          value={newWin}
          onChange={(e) => setNewWin(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button
          onClick={add}
          className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center hover:bg-amber-500/30"
        >
          <Plus size={14} className="text-amber-400" />
        </button>
      </div>
    </div>
  );
}

export default function QuarterView({
  creditCards,
  savingsAccounts,
  gymSessions,
  achievements,
  setAchievements,
}: Props) {
  return (
    <div className="space-y-4">
      <GymConsistency sessions={gymSessions} />

      <QuarterFinances creditCards={creditCards} savingsAccounts={savingsAccounts} />

      <Achievements achievements={achievements} setAchievements={setAchievements} />
    </div>
  );
}
