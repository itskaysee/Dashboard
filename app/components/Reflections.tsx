"use client";
import { useState, useEffect } from "react";
import { BookOpen, Save, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays, parseISO } from "date-fns";
import type { Reflection } from "../types";

interface Props {
  reflections: Reflection[];
  setReflections: (r: Reflection[] | ((prev: Reflection[]) => Reflection[])) => void;
}

export default function Reflections({ reflections, setReflections }: Props) {
  const [viewDate, setViewDate] = useState(new Date());
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);

  const dateStr = format(viewDate, "yyyy-MM-dd");
  const existing = reflections.find((r) => r.date === dateStr);

  useEffect(() => {
    setDraft(existing?.content ?? "");
    setSaved(false);
  }, [dateStr, existing?.content]);

  const save = () => {
    if (!draft.trim()) return;
    setReflections((prev) => {
      const without = prev.filter((r) => r.date !== dateStr);
      return [...without, { id: existing?.id ?? crypto.randomUUID(), date: dateStr, content: draft }];
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isToday = dateStr === format(new Date(), "yyyy-MM-dd");

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
            <BookOpen size={15} className="text-pink-400" />
          </div>
          <div>
            <p className="section-label">Reflection</p>
            <p className="text-xs text-slate-400 font-medium">
              {isToday ? "Today" : format(viewDate, "MMM d, yyyy")}
            </p>
          </div>
        </div>

        {/* date nav */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewDate((d) => subDays(d, 1))}
            className="w-6 h-6 rounded-md bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10"
          >
            <ChevronLeft size={12} className="text-slate-400" />
          </button>
          <button
            onClick={() => setViewDate(new Date())}
            className="px-2 h-6 rounded-md bg-white/5 border border-white/8 text-xs text-slate-400 hover:bg-white/10"
          >
            Today
          </button>
          <button
            onClick={() => setViewDate((d) => addDays(d, 1))}
            className="w-6 h-6 rounded-md bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10"
          >
            <ChevronRight size={12} className="text-slate-400" />
          </button>
        </div>
      </div>

      <textarea
        className="dash-input resize-none w-full"
        rows={5}
        placeholder={
          isToday
            ? "What's on your mind today? Gratitude, wins, thoughts..."
            : "No reflection for this day."
        }
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setSaved(false);
        }}
      />

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-slate-600">
          {reflections.length} reflection{reflections.length !== 1 ? "s" : ""} total
        </p>
        <button
          onClick={save}
          disabled={!draft.trim()}
          className="dash-btn flex items-center gap-1.5 transition-all"
          style={{
            background: saved
              ? "rgba(16,185,129,0.2)"
              : draft.trim()
              ? "linear-gradient(135deg, #7c3aed, #db2777)"
              : "rgba(255,255,255,0.05)",
            color: saved ? "#34d399" : draft.trim() ? "white" : "rgba(148,163,184,0.3)",
            border: saved ? "1px solid rgba(16,185,129,0.3)" : "none",
            cursor: draft.trim() ? "pointer" : "default",
          }}
        >
          <Save size={13} />
          {saved ? "Saved!" : "Save"}
        </button>
      </div>
    </div>
  );
}
