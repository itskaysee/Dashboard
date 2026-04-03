"use client";
import { useState } from "react";
import { Calendar, Plus, Trash2, X, Clock } from "lucide-react";
import {
  format,
  parseISO,
  isThisWeek,
  isThisMonth,
  isFuture,
  isToday,
  startOfDay,
} from "date-fns";
import type { CalendarEvent } from "../types";

const EVENT_COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#ec4899", "#ef4444"];

interface Props {
  events: CalendarEvent[];
  setEvents: (e: CalendarEvent[] | ((prev: CalendarEvent[]) => CalendarEvent[])) => void;
  filter?: "week" | "month" | "all";
}

function AddModal({
  onSave,
  onClose,
}: {
  onSave: (e: CalendarEvent) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "",
    description: "",
    color: EVENT_COLORS[0],
  });

  const save = () => {
    if (!form.title.trim()) return;
    onSave({ id: crypto.randomUUID(), ...form });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="glass rounded-2xl p-6 w-full max-w-sm relative z-10 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-slate-100">Add Event</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="section-label block mb-1">Title</label>
            <input className="dash-input" placeholder="Event title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-label block mb-1">Date</label>
              <input className="dash-input" type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="section-label block mb-1">Time (optional)</label>
              <input className="dash-input" type="time" value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="section-label block mb-1">Notes (optional)</label>
            <textarea className="dash-input resize-none" rows={2} placeholder="Add details..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="section-label block mb-2">Color</label>
            <div className="flex gap-2">
              {EVENT_COLORS.map((c) => (
                <button key={c} onClick={() => setForm({ ...form, color: c })}
                  className="w-6 h-6 rounded-full transition-transform"
                  style={{
                    background: c,
                    transform: form.color === c ? "scale(1.3)" : "scale(1)",
                    outline: form.color === c ? `2px solid ${c}` : "none",
                    outlineOffset: "2px",
                  }} />
              ))}
            </div>
          </div>
        </div>
        <button onClick={save} className="dash-btn dash-btn-primary w-full mt-5">
          Add Event
        </button>
      </div>
    </div>
  );
}

export default function EventsWidget({ events, setEvents, filter = "week" }: Props) {
  const [adding, setAdding] = useState(false);

  const filtered = events
    .filter((e) => {
      const d = parseISO(e.date);
      const dayStart = startOfDay(d);
      const todayStart = startOfDay(new Date());
      if (filter === "week") return isThisWeek(d, { weekStartsOn: 1 }) || (isToday(d));
      if (filter === "month") return isThisMonth(d);
      return dayStart >= todayStart;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const remove = (id: string) => setEvents((prev) => prev.filter((e) => e.id !== id));

  const filterLabel = filter === "week" ? "This Week" : filter === "month" ? "This Month" : "Upcoming";

  return (
    <>
      {adding && (
        <AddModal onSave={(e) => setEvents((prev) => [...prev, e])} onClose={() => setAdding(false)} />
      )}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <Calendar size={15} className="text-violet-400" />
            </div>
            <div>
              <p className="section-label">Events</p>
              <p className="text-xs text-slate-500">{filterLabel}</p>
            </div>
          </div>
          <button onClick={() => setAdding(true)}
            className="w-7 h-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors">
            <Plus size={14} className="text-slate-400" />
          </button>
        </div>

        {filtered.length === 0 && (
          <p className="text-slate-600 text-sm text-center py-4">
            No events {filterLabel.toLowerCase()}.{" "}
            <button onClick={() => setAdding(true)} className="text-violet-400 hover:text-violet-300">
              Add one
            </button>
          </p>
        )}

        <div className="space-y-2">
          {filtered.map((ev) => {
            const d = parseISO(ev.date);
            const todayEv = isToday(d);
            return (
              <div key={ev.id}
                className="flex items-start gap-3 p-3 rounded-xl glass-hover group transition-all"
                style={{ borderLeft: `2px solid ${ev.color}` }}>
                <div className="flex-shrink-0 text-center min-w-[36px]">
                  <p className="text-xs font-medium" style={{ color: ev.color }}>
                    {format(d, "MMM")}
                  </p>
                  <p className="text-lg font-bold text-slate-200 leading-none">
                    {format(d, "d")}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {todayEv && (
                      <span className="text-xs font-semibold mr-1.5 px-1.5 py-0.5 rounded-md"
                        style={{ background: `${ev.color}22`, color: ev.color }}>
                        Today
                      </span>
                    )}
                    {ev.title}
                  </p>
                  {ev.time && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> {ev.time}
                    </p>
                  )}
                  {ev.description && (
                    <p className="text-xs text-slate-600 mt-0.5 truncate">{ev.description}</p>
                  )}
                </div>
                <button onClick={() => remove(ev.id)}
                  className="text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
