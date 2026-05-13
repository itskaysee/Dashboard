"use client";
import { useState } from "react";
import { format, startOfWeek, addDays, isToday, isFuture } from "date-fns";
import { Settings, Plus, Trash2, X, Pencil } from "lucide-react";
import type { HabitLog, CustomHabit } from "../types";

// ─── Defaults (seeded on first use) ──────────────────────────────────────────

export const DEFAULT_HABITS: CustomHabit[] = [
  { id: "workout",            label: "Workout",                    icon: "🏋️", color: "#d68d84", bg: "rgba(214,141,132,0.08)", border: "rgba(214,141,132,0.2)", goal: 5, section: "daily" },
  { id: "systems-design",     label: "Systems Design Course",      sublabel: "30 min", icon: "🖥️", color: "#7a816c", bg: "rgba(122,129,108,0.08)", border: "rgba(122,129,108,0.2)", goal: 7, section: "daily" },
  { id: "reading",            label: "Reading",                    sublabel: "30 min", icon: "📖", color: "#866a5b", bg: "rgba(134,106,91,0.08)", border: "rgba(134,106,91,0.2)", goal: 7, section: "daily" },
  { id: "leetcode",           label: "LeetCode",                   sublabel: "1 problem", icon: "💻", color: "#8e967d", bg: "rgba(142,150,125,0.08)", border: "rgba(142,150,125,0.2)", goal: 5, section: "daily" },
  { id: "verbal-explanation", label: "Verbal Concept Explanation", sublabel: "2 min", icon: "🗣️", color: "#cfbb9f", bg: "rgba(207,187,159,0.12)", border: "rgba(207,187,159,0.3)", goal: 5, section: "daily" },
  { id: "bible-reading",      label: "Bible Reading",              icon: "✝️", color: "#866a5b", bg: "rgba(134,106,91,0.08)", border: "rgba(134,106,91,0.2)", goal: 7, section: "devotional" },
  { id: "prayer",             label: "Prayer",                     icon: "🙏", color: "#9c948a", bg: "rgba(156,148,138,0.08)", border: "rgba(156,148,138,0.2)", goal: 7, section: "devotional" },
  { id: "church",             label: "Church",                     icon: "⛪", color: "#7a816c", bg: "rgba(122,129,108,0.08)", border: "rgba(122,129,108,0.2)", goal: 1, section: "devotional" },
];

const COLOR_OPTIONS = [
  { color: "#d68d84", bg: "rgba(214,141,132,0.08)", border: "rgba(214,141,132,0.2)" },
  { color: "#8e967d", bg: "rgba(142,150,125,0.08)", border: "rgba(142,150,125,0.2)" },
  { color: "#7a816c", bg: "rgba(122,129,108,0.08)", border: "rgba(122,129,108,0.2)" },
  { color: "#866a5b", bg: "rgba(134,106,91,0.08)",  border: "rgba(134,106,91,0.2)"  },
  { color: "#cfbb9f", bg: "rgba(207,187,159,0.12)", border: "rgba(207,187,159,0.3)" },
  { color: "#9c948a", bg: "rgba(156,148,138,0.08)", border: "rgba(156,148,138,0.2)" },
];

interface Props {
  habits: CustomHabit[];
  setHabits: (h: CustomHabit[] | ((prev: CustomHabit[]) => CustomHabit[])) => void;
  logs: HabitLog[];
  setLogs: (l: HabitLog[] | ((prev: HabitLog[]) => HabitLog[])) => void;
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

// ─── Manage Habits Modal ──────────────────────────────────────────────────────

const BLANK_FORM = { label: "", sublabel: "", icon: "⭐", goal: 7, section: "daily" as "daily" | "devotional", colorIdx: 0 };

function ManageModal({
  habits,
  onSave,
  onClose,
}: {
  habits: CustomHabit[];
  onSave: (h: CustomHabit[]) => void;
  onClose: () => void;
}) {
  const [list, setList] = useState<CustomHabit[]>(habits);
  const [form, setForm] = useState(BLANK_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  const startEdit = (h: CustomHabit) => {
    const colorIdx = COLOR_OPTIONS.findIndex((c) => c.color === h.color);
    setForm({ label: h.label, sublabel: h.sublabel ?? "", icon: h.icon, goal: h.goal, section: h.section, colorIdx: colorIdx >= 0 ? colorIdx : 0 });
    setEditingId(h.id);
  };

  const cancelEdit = () => { setForm(BLANK_FORM); setEditingId(null); };

  const commitForm = () => {
    if (!form.label.trim()) return;
    const col = COLOR_OPTIONS[form.colorIdx];
    if (editingId) {
      setList((prev) => prev.map((h) => h.id === editingId
        ? { ...h, label: form.label.trim(), sublabel: form.sublabel.trim() || undefined, icon: form.icon, goal: form.goal, section: form.section, ...col }
        : h
      ));
      cancelEdit();
    } else {
      setList((prev) => [...prev, {
        id: crypto.randomUUID(),
        label: form.label.trim(),
        sublabel: form.sublabel.trim() || undefined,
        icon: form.icon,
        goal: form.goal,
        section: form.section,
        ...col,
      }]);
      setForm(BLANK_FORM);
    }
  };

  const remove = (id: string) => setList((prev) => prev.filter((h) => h.id !== id));

  const daily = list.filter((h) => h.section === "daily");
  const devotional = list.filter((h) => h.section === "devotional");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: "rgba(249,247,239,0.85)" }} onClick={onClose} />
      <div className="rounded-2xl w-full max-w-md relative z-10 flex flex-col animate-slide-up"
        style={{ background: "#fff", border: "1px solid #ebe6dd", boxShadow: "0 8px 40px rgba(120,91,78,0.14)", maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #ebe6dd" }}>
          <h3 className="font-semibold" style={{ color: "#785b4e", fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>
            Manage Habits
          </h3>
          <button onClick={onClose} style={{ color: "#c5b9ab" }}><X size={18} /></button>
        </div>

        {/* Habit list */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {[{ label: "Daily Habits", items: daily }, { label: "Devotional Habits", items: devotional }].map(({ label, items }) => (
            <div key={label}>
              <p className="section-label mb-2">{label}</p>
              {items.length === 0 && <p className="text-xs italic" style={{ color: "#c5b9ab" }}>None yet</p>}
              <div className="space-y-1.5">
                {items.map((h) => (
                  <div key={h.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                    style={{ background: h.bg, border: `1px solid ${h.border}` }}>
                    <span className="text-base">{h.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#785b4e" }}>{h.label}</p>
                      <p className="text-xs" style={{ color: "#a2998f" }}>
                        {h.sublabel ? `${h.sublabel} · ` : ""}{h.goal}×/week
                      </p>
                    </div>
                    <button onClick={() => startEdit(h)} style={{ color: "#a2998f" }}
                      onMouseOver={(e) => (e.currentTarget.style.color = "#785b4e")}
                      onMouseOut={(e) => (e.currentTarget.style.color = "#a2998f")}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => remove(h.id)} style={{ color: "#c5b9ab" }}
                      onMouseOver={(e) => (e.currentTarget.style.color = "#d68d84")}
                      onMouseOut={(e) => (e.currentTarget.style.color = "#c5b9ab")}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add / Edit form */}
        <div className="px-5 py-4 space-y-3" style={{ borderTop: "1px solid #ebe6dd", background: "#faf9f5" }}>
          <p className="section-label">{editingId ? "Edit Habit" : "Add Habit"}</p>

          <div className="flex gap-2">
            <input
              className="dash-input w-14 text-center text-lg"
              placeholder="🌟"
              value={form.icon}
              maxLength={2}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
            />
            <input
              className="dash-input flex-1"
              placeholder="Habit name"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && commitForm()}
            />
          </div>

          <div className="flex gap-2">
            <input
              className="dash-input flex-1"
              placeholder="Sublabel (optional, e.g. 30 min)"
              value={form.sublabel}
              onChange={(e) => setForm({ ...form, sublabel: e.target.value })}
            />
            <div className="flex items-center gap-1.5 px-3 rounded-xl"
              style={{ background: "#f9f7ef", border: "1px solid #ebe6dd", minWidth: 80 }}>
              <span className="text-xs" style={{ color: "#a2998f" }}>Goal</span>
              <input
                type="number"
                min={1}
                max={7}
                className="w-8 text-center text-sm font-semibold bg-transparent outline-none"
                style={{ color: "#785b4e" }}
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: Math.min(7, Math.max(1, Number(e.target.value))) })}
              />
              <span className="text-xs" style={{ color: "#a2998f" }}>/wk</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Section toggle */}
            <div className="flex gap-1 p-1 rounded-lg" style={{ background: "#ebe6dd" }}>
              {(["daily", "devotional"] as const).map((s) => (
                <button key={s} onClick={() => setForm({ ...form, section: s })}
                  className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                  style={{
                    background: form.section === s ? "#fff" : "transparent",
                    color: form.section === s ? "#785b4e" : "#a2998f",
                    border: form.section === s ? "1px solid #cbb8ad" : "1px solid transparent",
                  }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* Color picker */}
            <div className="flex gap-1.5">
              {COLOR_OPTIONS.map((c, i) => (
                <button key={i} onClick={() => setForm({ ...form, colorIdx: i })}
                  className="w-5 h-5 rounded-full transition-transform"
                  style={{
                    background: c.color,
                    transform: form.colorIdx === i ? "scale(1.35)" : "scale(1)",
                    outline: form.colorIdx === i ? `2px solid ${c.color}` : "none",
                    outlineOffset: "2px",
                  }} />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {editingId && (
              <button onClick={cancelEdit} className="flex-1 py-2 rounded-xl text-sm"
                style={{ background: "#f9f7ef", color: "#a2998f", border: "1px solid #ebe6dd" }}>
                Cancel
              </button>
            )}
            <button onClick={commitForm} disabled={!form.label.trim()}
              className="flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all"
              style={{
                background: form.label.trim() ? "#785b4e" : "#f9f7ef",
                color: form.label.trim() ? "#fff" : "#c5b9ab",
              }}>
              {editingId ? <><Pencil size={13} /> Save Changes</> : <><Plus size={13} /> Add Habit</>}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 flex justify-end gap-2" style={{ borderTop: "1px solid #ebe6dd" }}>
          <button onClick={onClose} className="px-4 py-1.5 rounded-lg text-sm"
            style={{ background: "#f9f7ef", color: "#a2998f", border: "1px solid #ebe6dd" }}>
            Cancel
          </button>
          <button onClick={() => { onSave(list); onClose(); }}
            className="px-4 py-1.5 rounded-lg text-sm font-medium"
            style={{ background: "#785b4e", color: "#fff" }}>
            Save Habits
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HabitTracker({ habits, setHabits, logs, setLogs }: Props) {
  const [managing, setManaging] = useState(false);
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const dailyHabits = habits.filter((h) => h.section === "daily");
  const devotionalHabits = habits.filter((h) => h.section === "devotional");
  const allHabits = habits;

  const isLogged = (habitId: string, date: Date) =>
    logs.some((l) => l.habitId === habitId && l.date === format(date, "yyyy-MM-dd"));

  const toggle = (habitId: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const exists = logs.some((l) => l.habitId === habitId && l.date === dateStr);
    if (exists) {
      setLogs((prev) => prev.filter((l) => !(l.habitId === habitId && l.date === dateStr)));
    } else {
      setLogs((prev) => [...prev, { habitId, date: dateStr }]);
    }
  };

  const weekCount = (habitId: string) => weekDays.filter((d) => isLogged(habitId, d)).length;

  const totalPossible = allHabits.reduce((s, h) => s + h.goal, 0);
  const totalDone = allHabits.reduce((s, h) => s + Math.min(weekCount(h.id), h.goal), 0);
  const overallPct = totalPossible > 0 ? (totalDone / totalPossible) * 100 : 0;
  const weekLabel = `Week of ${format(weekStart, "MMM d")}`;

  const renderHabitSection = (sectionHabits: CustomHabit[], sectionLabel?: string) => (
    <div className="glass rounded-xl overflow-hidden">
      {sectionLabel && (
        <div className="px-4 py-2" style={{ background: "#f9f7ef", borderBottom: "1px solid #ebe6dd" }}>
          <p className="section-label">{sectionLabel}</p>
        </div>
      )}

      {/* Day header */}
      <div className="grid gap-0 px-4 py-2"
        style={{ gridTemplateColumns: "1fr repeat(7, 32px)", borderBottom: "1px solid #ebe6dd", background: "#f9f7ef" }}>
        <div />
        {weekDays.map((day, i) => {
          const tod = isToday(day);
          return (
            <div key={i} className="flex flex-col items-center gap-0">
              <span className="text-xs font-medium" style={{ color: tod ? "#866a5b" : "#c5b9ab" }}>
                {DAY_LABELS[i]}
              </span>
              <span className="text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full"
                style={{ background: tod ? "#d68d84" : "transparent", color: tod ? "#fff" : "#a2998f" }}>
                {format(day, "d")}
              </span>
            </div>
          );
        })}
      </div>

      {sectionHabits.length === 0 && (
        <div className="px-4 py-4 text-center">
          <p className="text-xs italic" style={{ color: "#c5b9ab" }}>No habits yet — add some above.</p>
        </div>
      )}

      {/* Habit rows */}
      {sectionHabits.map((habit, idx) => {
        const count = weekCount(habit.id);
        const pct = Math.min((count / habit.goal) * 100, 100);
        const isLast = idx === sectionHabits.length - 1;

        return (
          <div key={habit.id} className="px-4 py-2.5"
            style={{ borderBottom: isLast ? "none" : "1px solid #f5f0ea" }}>
            <div className="grid items-center gap-0" style={{ gridTemplateColumns: "1fr repeat(7, 32px)" }}>
              <div className="pr-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs flex-shrink-0"
                    style={{ background: habit.bg, border: `1px solid ${habit.border}` }}>
                    {habit.icon}
                  </span>
                  <div>
                    <p className="text-xs font-medium leading-tight" style={{ color: "#785b4e" }}>{habit.label}</p>
                    {habit.sublabel && <p className="text-xs" style={{ color: "#c5b9ab", fontSize: "0.7rem" }}>{habit.sublabel}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: "#ebe6dd" }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: pct === 100 ? "#8e967d" : habit.color }} />
                  </div>
                  <span className="text-xs font-medium flex-shrink-0" style={{ color: habit.color, minWidth: "28px", fontSize: "0.7rem" }}>
                    {count}/{habit.goal}
                  </span>
                </div>
              </div>

              {weekDays.map((day, i) => {
                const logged = isLogged(habit.id, day);
                const future = isFuture(day) && !isToday(day);
                const tod = isToday(day);
                return (
                  <div key={i} className="flex justify-center">
                    <button
                      onClick={() => toggle(habit.id, day)}
                      disabled={future}
                      className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-150"
                      style={{
                        background: logged ? habit.bg : tod ? "rgba(214,141,132,0.06)" : "#f9f7ef",
                        border: logged ? `2px solid ${habit.color}` : tod ? "2px solid rgba(214,141,132,0.5)" : "2px solid #cbb8ad",
                        cursor: future ? "default" : "pointer",
                        opacity: future ? 0.3 : 1,
                      }}
                    >
                      {logged && (
                        <svg width="9" height="7" viewBox="0 0 11 9" fill="none">
                          <path d="M1 4L4 7.5L10 1" stroke={habit.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-4">
      {managing && (
        <ManageModal
          habits={habits}
          onSave={setHabits}
          onClose={() => setManaging(false)}
        />
      )}

      {/* Overall header */}
      <div className="glass rounded-xl p-4 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
          style={{ background: "#d68d84" }} />
        <div className="pl-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold" style={{ fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", color: "#785b4e" }}>
                Habit Tracker
              </h2>
              <p className="text-xs" style={{ color: "#a2998f" }}>{weekLabel}</p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <p className="text-xl font-bold"
                  style={{ color: overallPct >= 80 ? "#8e967d" : overallPct >= 50 ? "#cfbb9f" : "#d68d84" }}>
                  {Math.round(overallPct)}%
                </p>
                <p className="text-xs" style={{ color: "#a2998f" }}>weekly score</p>
              </div>
              <button
                onClick={() => setManaging(true)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                style={{ background: "#f6efdf", border: "1px solid #e8dfcf" }}
                title="Manage habits"
              >
                <Settings size={13} style={{ color: "#a2998f" }} />
              </button>
            </div>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#ebe6dd" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${overallPct}%`, background: overallPct >= 80 ? "#8e967d" : "#d68d84" }} />
          </div>
          <p className="text-xs mt-1" style={{ color: "#c5b9ab" }}>
            {totalDone} / {totalPossible} completions this week
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {renderHabitSection(dailyHabits, "Daily Habits")}
        {renderHabitSection(devotionalHabits, "Devotional Habits")}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {allHabits.map((habit) => {
          const count = weekCount(habit.id);
          const pct = Math.min((count / habit.goal) * 100, 100);
          return (
            <div key={habit.id} className="rounded-lg p-2 text-center"
              style={{ background: habit.bg, border: `1px solid ${habit.border}` }}>
              <div className="text-base mb-0.5">{habit.icon}</div>
              <p className="text-sm font-bold" style={{ color: habit.color }}>{count}</p>
              <p className="text-xs" style={{ color: "#a2998f", fontSize: "0.65rem" }}>/ {habit.goal}</p>
              <div className="h-0.5 rounded-full overflow-hidden mt-1.5" style={{ background: "#ebe6dd" }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: habit.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
