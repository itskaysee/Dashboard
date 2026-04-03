"use client";
import { useState } from "react";
import { Target, Plus, X, Edit2, Check } from "lucide-react";
import { format, startOfWeek } from "date-fns";
import type { WeeklyFocus as WF } from "../types";

interface Props {
  focusData: WF[];
  setFocusData: (d: WF[] | ((prev: WF[]) => WF[])) => void;
}

function getWeekKey(date: Date) {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return format(monday, "yyyy-'W'II");
}

export default function WeeklyFocus({ focusData, setFocusData }: Props) {
  const weekKey = getWeekKey(new Date());
  const current = focusData.find((w) => w.weekKey === weekKey) ?? {
    weekKey,
    focus: "",
    goals: [],
  };

  const [editingFocus, setEditingFocus] = useState(false);
  const [focusDraft, setFocusDraft] = useState(current.focus);
  const [newGoal, setNewGoal] = useState("");

  const update = (patch: Partial<WF>) => {
    setFocusData((prev) => {
      const without = prev.filter((w) => w.weekKey !== weekKey);
      return [...without, { ...current, ...patch }];
    });
  };

  const saveFocus = () => {
    update({ focus: focusDraft });
    setEditingFocus(false);
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    update({ goals: [...current.goals, newGoal.trim()] });
    setNewGoal("");
  };

  const removeGoal = (i: number) => {
    update({ goals: current.goals.filter((_, idx) => idx !== i) });
  };

  const weekLabel = `Week of ${format(startOfWeek(new Date(), { weekStartsOn: 1 }), "MMM d")}`;

  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 100% 100%, rgba(139,92,246,0.5) 0%, transparent 60%)",
        }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <Target size={15} className="text-violet-400" />
          </div>
          <div>
            <p className="section-label">Weekly Focus</p>
            <p className="text-xs text-slate-500">{weekLabel}</p>
          </div>
        </div>

        {/* Main focus */}
        <div className="mb-4">
          {editingFocus ? (
            <div className="flex gap-2">
              <input
                className="dash-input flex-1"
                placeholder="This week's main focus..."
                value={focusDraft}
                onChange={(e) => setFocusDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveFocus()}
                autoFocus
              />
              <button onClick={saveFocus} className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center hover:bg-violet-500/30">
                <Check size={14} className="text-violet-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setFocusDraft(current.focus); setEditingFocus(true); }}
              className="w-full text-left group"
            >
              {current.focus ? (
                <div className="flex items-start justify-between gap-2">
                  <p className="text-base font-semibold text-slate-100 leading-snug">
                    {current.focus}
                  </p>
                  <Edit2 size={13} className="text-slate-600 opacity-0 group-hover:opacity-100 mt-0.5 flex-shrink-0" />
                </div>
              ) : (
                <p className="text-slate-600 text-sm italic">
                  Click to set this week&apos;s focus...
                </p>
              )}
            </button>
          )}
        </div>

        {/* Goals */}
        <div>
          <p className="section-label mb-2">This Week&apos;s Goals</p>
          <div className="space-y-1.5 mb-3">
            {current.goals.map((goal, i) => (
              <div key={i} className="flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                <span className="text-sm text-slate-300 flex-1">{goal}</span>
                <button
                  onClick={() => removeGoal(i)}
                  className="text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {current.goals.length === 0 && (
              <p className="text-slate-700 text-xs italic">No goals yet.</p>
            )}
          </div>
          <div className="flex gap-2">
            <input
              className="dash-input flex-1 text-xs"
              placeholder="Add a goal..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGoal()}
            />
            <button onClick={addGoal} className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10">
              <Plus size={14} className="text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
