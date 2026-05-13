"use client";
import { useState } from "react";
import {
  format,
  parseISO,
  endOfWeek,
  subWeeks,
  eachWeekOfInterval,
  isWithinInterval,
  getQuarter,
} from "date-fns";
import { Trophy, TrendingUp, Dumbbell, Plus, X, CheckSquare, Square, Lightbulb, Target, BookOpen } from "lucide-react";
import type { CreditCard, SavingsAccount, GymSession, QuarterlyAchievement, QuarterlyGoal, GoalCategory, ParkingLotIdea, BookRead } from "../types";

interface Props {
  creditCards: CreditCard[];
  savingsAccounts: SavingsAccount[];
  gymSessions: GymSession[];
  achievements: QuarterlyAchievement[];
  setAchievements: (a: QuarterlyAchievement[] | ((prev: QuarterlyAchievement[]) => QuarterlyAchievement[])) => void;
  quarterlyGoals: QuarterlyGoal[];
  setQuarterlyGoals: (g: QuarterlyGoal[] | ((prev: QuarterlyGoal[]) => QuarterlyGoal[])) => void;
  parkingLot: ParkingLotIdea[];
  setParkingLot: (p: ParkingLotIdea[] | ((prev: ParkingLotIdea[]) => ParkingLotIdea[])) => void;
  booksRead: BookRead[];
  setBooksRead: (b: BookRead[] | ((prev: BookRead[]) => BookRead[])) => void;
}

function currentQKey() {
  const today = new Date();
  return `${format(today, "yyyy")}-Q${getQuarter(today)}`;
}

// ─── Gym Chart ────────────────────────────────────────────────────────────────

function GymConsistency({ sessions }: { sessions: GymSession[] }) {
  const today = new Date();
  const weeks = eachWeekOfInterval({ start: subWeeks(today, 12), end: today }, { weekStartsOn: 1 });

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
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "#f6efdf", border: "1px solid #e8dfcf" }}>
          <Dumbbell size={15} style={{ color: "#866a5b" }} />
        </div>
        <div>
          <p className="section-label">Gym Consistency</p>
          <p className="text-xs" style={{ color: "#a2998f" }}>Last 13 weeks</p>
        </div>
      </div>

      <div className="flex items-end gap-1.5" style={{ height: 80 }}>
        {weekData.map(({ count }, i) => {
          const BAR_MAX = 72;
          const barH = max > 0 ? Math.max((count / max) * BAR_MAX, 5) : 5;
          const isCurrentWeek = i === weekData.length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center group relative" style={{ height: "100%", justifyContent: "flex-end" }}>
              {count > 0 && (
                <div className="absolute left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1.5 py-0.5 rounded whitespace-nowrap z-10"
                  style={{ bottom: barH + 6, background: "#fff", border: "1px solid #ebe6dd", color: "#785b4e", boxShadow: "0 2px 8px rgba(120,91,78,0.08)" }}>
                  {count}
                </div>
              )}
              <div
                className="w-full rounded-sm transition-all duration-500"
                style={{
                  height: barH,
                  background: isCurrentWeek ? "#d68d84" : count > 0 ? "#e1ad9d" : "#ebe6dd",
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs" style={{ color: "#c5b9ab" }}>12 weeks ago</span>
        <span className="text-xs font-medium" style={{ color: "#d68d84" }}>This week</span>
      </div>
    </div>
  );
}

// ─── Finances ─────────────────────────────────────────────────────────────────

function QuarterFinances({ creditCards, savingsAccounts }: { creditCards: CreditCard[]; savingsAccounts: SavingsAccount[] }) {
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
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "#f6efdf", border: "1px solid #e8dfcf" }}>
          <TrendingUp size={15} style={{ color: "#8e967d" }} />
        </div>
        <div>
          <p className="section-label">Finances — Q{quarter} {format(new Date(), "yyyy")}</p>
          <p className="text-xs" style={{ color: "#a2998f" }}>Debt paydown & savings progress</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <div className="flex justify-between mb-1.5">
            <p className="text-sm font-medium" style={{ color: "#785b4e" }}>Debt Paid Off</p>
            <p className="text-sm font-bold" style={{ color: "#d68d84" }}>{fmt(totalPaid)}</p>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "#ebe6dd" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: totalOriginal > 0 ? `${(totalPaid / totalOriginal) * 100}%` : "0%", background: "#d68d84" }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs" style={{ color: "#c5b9ab" }}>
              {totalOriginal > 0 ? ((totalPaid / totalOriginal) * 100).toFixed(0) : 0}% paid
            </span>
            <span className="text-xs" style={{ color: "#c5b9ab" }}>{fmt(totalDebt)} remaining</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1.5">
            <p className="text-sm font-medium" style={{ color: "#785b4e" }}>Savings Progress</p>
            <p className="text-sm font-bold" style={{ color: "#8e967d" }}>{fmt(totalSavings)}</p>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "#ebe6dd" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: totalSavingsGoal > 0 ? `${Math.min((totalSavings / totalSavingsGoal) * 100, 100)}%` : "0%", background: "#8e967d" }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs" style={{ color: "#c5b9ab" }}>
              {totalSavingsGoal > 0 ? ((totalSavings / totalSavingsGoal) * 100).toFixed(0) : 0}% of goal
            </span>
            <span className="text-xs" style={{ color: "#c5b9ab" }}>{fmt(totalSavingsGoal)} goal</span>
          </div>
        </div>

        <div className="pt-3" style={{ borderTop: "1px solid #ebe6dd" }}>
          <div className="flex justify-between">
            <span className="text-xs" style={{ color: "#a2998f" }}>Net Worth (savings − debt)</span>
            <span className="text-sm font-bold"
              style={{ color: totalSavings - totalDebt >= 0 ? "#7a816c" : "#d68d84" }}>
              {fmt(totalSavings - totalDebt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quarterly Goals ──────────────────────────────────────────────────────────

const CATEGORIES: { id: GoalCategory; color: string; bg: string; border: string }[] = [
  { id: "Finance",  color: "#d68d84", bg: "rgba(214,141,132,0.08)", border: "rgba(214,141,132,0.2)" },
  { id: "Health",   color: "#8e967d", bg: "rgba(142,150,125,0.08)", border: "rgba(142,150,125,0.2)" },
  { id: "Business", color: "#7a816c", bg: "rgba(122,129,108,0.08)", border: "rgba(122,129,108,0.2)" },
  { id: "Personal", color: "#866a5b", bg: "rgba(134,106,91,0.08)",  border: "rgba(134,106,91,0.2)"  },
];

function QuarterlyGoals({ goals, setGoals }: { goals: QuarterlyGoal[]; setGoals: (g: QuarterlyGoal[] | ((prev: QuarterlyGoal[]) => QuarterlyGoal[])) => void }) {
  const qKey = currentQKey();
  const qGoals = goals.filter((g) => g.quarterKey === qKey);
  const [newText, setNewText] = useState("");
  const [activeCategory, setActiveCategory] = useState<GoalCategory>("Finance");

  const add = () => {
    if (!newText.trim()) return;
    setGoals((prev) => [...prev, { id: crypto.randomUUID(), quarterKey: qKey, category: activeCategory, text: newText.trim(), completed: false }]);
    setNewText("");
  };
  const toggle = (id: string) => setGoals((prev) => prev.map((g) => g.id === id ? { ...g, completed: !g.completed } : g));
  const remove = (id: string) => setGoals((prev) => prev.filter((g) => g.id !== id));
  const quarter = getQuarter(new Date());

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "#f6efdf", border: "1px solid #e8dfcf" }}>
          <Target size={15} style={{ color: "#866a5b" }} />
        </div>
        <div>
          <p className="section-label">Quarterly Goals</p>
          <p className="text-xs" style={{ color: "#a2998f" }}>
            Q{quarter} {format(new Date(), "yyyy")} · {qGoals.filter((g) => g.completed).length}/{qGoals.length} complete
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {CATEGORIES.map((cat) => {
          const catGoals = qGoals.filter((g) => g.category === cat.id);
          return (
            <div key={cat.id} className="rounded-xl p-3"
              style={{ background: cat.bg, border: `1px solid ${cat.border}` }}>
              <p className="text-xs font-semibold mb-2.5 tracking-wide" style={{ color: cat.color }}>{cat.id}</p>
              <div className="space-y-1.5 min-h-[32px]">
                {catGoals.length === 0 && (
                  <p className="text-xs italic" style={{ color: `${cat.color}88` }}>No goals yet</p>
                )}
                {catGoals.map((g) => (
                  <div key={g.id} className="flex items-start gap-1.5 group">
                    <button onClick={() => toggle(g.id)} className="flex-shrink-0 mt-0.5">
                      {g.completed
                        ? <CheckSquare size={13} style={{ color: cat.color }} />
                        : <Square size={13} style={{ color: `${cat.color}66` }} />}
                    </button>
                    <span className="text-xs flex-1 leading-snug"
                      style={{ color: g.completed ? "#c5b9ab" : "#785b4e", textDecoration: g.completed ? "line-through" : "none" }}>
                      {g.text}
                    </span>
                    <button onClick={() => remove(g.id)}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: `${cat.color}66` }}>
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <div className="flex gap-1.5">
          {CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className="flex-1 py-1 rounded-lg text-xs font-medium transition-all"
              style={{
                background: activeCategory === cat.id ? cat.bg : "#f9f7ef",
                border: activeCategory === cat.id ? `1px solid ${cat.border}` : "1px solid #ebe6dd",
                color: activeCategory === cat.id ? cat.color : "#a2998f",
              }}>
              {cat.id}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="dash-input flex-1 text-sm" placeholder={`Add ${activeCategory} goal...`}
            value={newText} onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()} />
          <button onClick={add}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: CATEGORIES.find((c) => c.id === activeCategory)?.bg,
              border: `1px solid ${CATEGORIES.find((c) => c.id === activeCategory)?.border}`,
            }}>
            <Plus size={14} style={{ color: CATEGORIES.find((c) => c.id === activeCategory)?.color }} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Achievements ─────────────────────────────────────────────────────────────

function Achievements({ achievements, setAchievements }: { achievements: QuarterlyAchievement[]; setAchievements: (a: QuarterlyAchievement[] | ((prev: QuarterlyAchievement[]) => QuarterlyAchievement[])) => void }) {
  const [newWin, setNewWin] = useState("");
  const today = new Date();
  const qKey = currentQKey();
  const qAchievements = achievements.filter((a) => a.quarterKey === qKey);

  const add = () => {
    if (!newWin.trim()) return;
    setAchievements((prev) => [...prev, { id: crypto.randomUUID(), quarterKey: qKey, text: newWin.trim() }]);
    setNewWin("");
  };
  const remove = (id: string) => setAchievements((prev) => prev.filter((a) => a.id !== id));

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "#f6efdf", border: "1px solid #e8dfcf" }}>
          <Trophy size={15} style={{ color: "#cfbb9f" }} />
        </div>
        <div>
          <p className="section-label">Quarterly Wins</p>
          <p className="text-xs" style={{ color: "#a2998f" }}>
            Q{getQuarter(today)} {format(today, "yyyy")} achievements
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {qAchievements.length === 0 && (
          <p className="text-sm italic py-2" style={{ color: "#c5b9ab" }}>
            No wins logged yet — start celebrating your progress!
          </p>
        )}
        {qAchievements.map((a) => (
          <div key={a.id} className="flex items-start gap-2.5 group py-1">
            <span className="mt-0.5" style={{ color: "#cfbb9f" }}>✦</span>
            <span className="text-sm flex-1" style={{ color: "#785b4e" }}>{a.text}</span>
            <button onClick={() => remove(a.id)}
              className="opacity-0 group-hover:opacity-100 transition-all"
              style={{ color: "#c5b9ab" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#d68d84")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#c5b9ab")}>
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input className="dash-input flex-1 text-sm" placeholder="Log a win..."
          value={newWin} onChange={(e) => setNewWin(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()} />
        <button onClick={add}
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "#f6efdf", border: "1px solid #e8dfcf" }}>
          <Plus size={14} style={{ color: "#cfbb9f" }} />
        </button>
      </div>
    </div>
  );
}

// ─── Books Read ───────────────────────────────────────────────────────────────

function BooksReadThisQuarter({ books, setBooks }: { books: BookRead[]; setBooks: (b: BookRead[] | ((prev: BookRead[]) => BookRead[])) => void }) {
  const qKey = currentQKey();
  const quarter = getQuarter(new Date());
  const qBooks = books.filter((b) => b.quarterKey === qKey);
  const remove = (id: string) => setBooks((prev) => prev.filter((b) => b.id !== id));

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "#f6efdf", border: "1px solid #e8dfcf" }}>
          <BookOpen size={15} style={{ color: "#866a5b" }} />
        </div>
        <div>
          <p className="section-label">Books Read</p>
          <p className="text-xs" style={{ color: "#a2998f" }}>
            Q{quarter} {format(new Date(), "yyyy")} · {qBooks.length} {qBooks.length === 1 ? "book" : "books"}
          </p>
        </div>
      </div>

      {qBooks.length === 0 ? (
        <p className="text-sm italic py-2" style={{ color: "#c5b9ab" }}>
          No books finished yet — mark one complete to see it here.
        </p>
      ) : (
        <div className="space-y-3">
          {qBooks.map((b) => {
            const coverUrl = b.coverId ? `https://covers.openlibrary.org/b/id/${b.coverId}-S.jpg` : null;
            return (
              <div key={b.id} className="flex items-center gap-3 group">
                {coverUrl ? (
                  <img src={coverUrl} alt={b.title} className="rounded shadow-sm"
                    style={{ width: 32, height: 46, objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div className="rounded flex items-center justify-center"
                    style={{ width: 32, height: 46, background: "#f6efdf", flexShrink: 0 }}>
                    <BookOpen size={13} style={{ color: "#c5b9ab" }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#785b4e" }}>{b.title}</p>
                  <p className="text-xs truncate" style={{ color: "#a2998f" }}>{b.author}</p>
                  <p className="text-xs" style={{ color: "#c5b9ab" }}>Finished {format(new Date(b.completedAt), "MMM d")}</p>
                </div>
                <button onClick={() => remove(b.id)}
                  className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                  style={{ color: "#c5b9ab" }}>
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Parking Lot ──────────────────────────────────────────────────────────────

function ParkingLot({ ideas, setIdeas }: { ideas: ParkingLotIdea[]; setIdeas: (p: ParkingLotIdea[] | ((prev: ParkingLotIdea[]) => ParkingLotIdea[])) => void }) {
  const [newIdea, setNewIdea] = useState("");

  const add = () => {
    if (!newIdea.trim()) return;
    setIdeas((prev) => [{ id: crypto.randomUUID(), text: newIdea.trim(), createdAt: new Date().toISOString() }, ...prev]);
    setNewIdea("");
  };
  const remove = (id: string) => setIdeas((prev) => prev.filter((i) => i.id !== id));

  return (
    <div className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: "#fff", border: "1px solid #ebe6dd", boxShadow: "0 1px 8px rgba(120,91,78,0.06)" }}>
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: "#cfbb9f" }} />
      <div className="pl-2">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#f6efdf", border: "1px solid #e8dfcf" }}>
            <Lightbulb size={15} style={{ color: "#cfbb9f" }} />
          </div>
          <div>
            <p className="section-label">Idea Parking Lot</p>
            <p className="text-xs" style={{ color: "#a2998f" }}>Capture it now, act on it later</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <input className="dash-input flex-1 text-sm" placeholder="Drop an idea..."
            value={newIdea} onChange={(e) => setNewIdea(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()} />
          <button onClick={add}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#f6efdf", border: "1px solid #e8dfcf" }}>
            <Plus size={14} style={{ color: "#cfbb9f" }} />
          </button>
        </div>

        {ideas.length === 0 && (
          <p className="text-sm italic text-center py-3" style={{ color: "#c5b9ab" }}>
            Your idea parking lot is empty.
          </p>
        )}

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {ideas.map((idea) => (
            <div key={idea.id}
              className="flex items-start gap-2.5 py-2 px-3 rounded-xl group transition-all"
              style={{ background: "#f9f7ef", border: "1px solid #ebe6dd" }}>
              <span className="mt-0.5 flex-shrink-0 text-sm" style={{ color: "#cfbb9f" }}>→</span>
              <span className="text-sm flex-1 leading-snug" style={{ color: "#785b4e" }}>{idea.text}</span>
              <div className="flex-shrink-0 flex items-center gap-1.5">
                <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#c5b9ab" }}>
                  {format(new Date(idea.createdAt), "MMM d")}
                </span>
                <button onClick={() => remove(idea.id)}
                  className="opacity-0 group-hover:opacity-100 transition-all"
                  style={{ color: "#c5b9ab" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#d68d84")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#c5b9ab")}>
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {ideas.length > 0 && (
          <p className="text-xs mt-3 text-right" style={{ color: "#c5b9ab" }}>
            {ideas.length} idea{ideas.length !== 1 ? "s" : ""} parked
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function QuarterView({ creditCards, savingsAccounts, gymSessions, achievements, setAchievements, quarterlyGoals, setQuarterlyGoals, parkingLot, setParkingLot, booksRead, setBooksRead }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <GymConsistency sessions={gymSessions} />
        <QuarterFinances creditCards={creditCards} savingsAccounts={savingsAccounts} />
      </div>
      <QuarterlyGoals goals={quarterlyGoals} setGoals={setQuarterlyGoals} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Achievements achievements={achievements} setAchievements={setAchievements} />
        <BooksReadThisQuarter books={booksRead} setBooks={setBooksRead} />
        <ParkingLot ideas={parkingLot} setIdeas={setParkingLot} />
      </div>
    </div>
  );
}
