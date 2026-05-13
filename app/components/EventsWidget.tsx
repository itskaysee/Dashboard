"use client";
import { useState } from "react";
import { Calendar, Plus, Trash2, X, Clock } from "lucide-react";
import { format, parseISO, isThisWeek, isThisMonth, isToday, startOfDay } from "date-fns";
import type { CalendarEvent } from "../types";

const EVENT_COLORS = ["#d68d84", "#8e967d", "#e1ad9d", "#7a816c", "#cfbb9f", "#866a5b"];

interface Props {
  events: CalendarEvent[];
  setEvents: (e: CalendarEvent[] | ((prev: CalendarEvent[]) => CalendarEvent[])) => void;
  filter?: "week" | "month" | "all";
  filterLabel?: string;
}

function AddModal({ onSave, onClose }: { onSave: (e: CalendarEvent) => void; onClose: () => void }) {
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
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: "rgba(249,247,239,0.85)" }} onClick={onClose} />
      <div className="rounded-2xl p-6 w-full max-w-sm relative z-10 animate-slide-up"
        style={{ background: "#fff", border: "1px solid #ebe6dd", boxShadow: "0 8px 40px rgba(120,91,78,0.12)" }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold" style={{ color: "#785b4e", fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>
            Add Event
          </h3>
          <button onClick={onClose} style={{ color: "#c5b9ab" }}><X size={18} /></button>
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
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="section-label block mb-2">Color</label>
            <div className="flex gap-2">
              {EVENT_COLORS.map((c) => (
                <button key={c} onClick={() => setForm({ ...form, color: c })}
                  className="w-6 h-6 rounded-full transition-transform"
                  style={{ background: c, transform: form.color === c ? "scale(1.3)" : "scale(1)", outline: form.color === c ? `2px solid ${c}` : "none", outlineOffset: "2px" }} />
              ))}
            </div>
          </div>
        </div>
        <button onClick={save} className="dash-btn dash-btn-primary w-full mt-5">Add Event</button>
      </div>
    </div>
  );
}

export default function EventsWidget({ events, setEvents, filter = "week", filterLabel: filterLabelOverride }: Props) {
  const [adding, setAdding] = useState(false);

  const filtered = events
    .filter((e) => {
      const d = parseISO(e.date);
      const dayStart = startOfDay(d);
      const todayStart = startOfDay(new Date());
      if (filter === "week") return isThisWeek(d, { weekStartsOn: 1 }) || isToday(d);
      if (filter === "month") return isThisMonth(d);
      return dayStart >= todayStart;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const remove = (id: string) => setEvents((prev) => prev.filter((e) => e.id !== id));
  const filterLabel = filterLabelOverride ?? (filter === "week" ? "This Week" : filter === "month" ? "This Month" : "Upcoming");

  return (
    <>
      {adding && (
        <AddModal
          onSave={(e) => setEvents((prev) => [...prev, e])}
          onClose={() => setAdding(false)}
        />
      )}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#f6efdf", border: "1px solid #e8dfcf" }}>
              <Calendar size={15} style={{ color: "#866a5b" }} />
            </div>
            <div>
              <p className="section-label">Events</p>
              <p className="text-xs" style={{ color: "#a2998f" }}>{filterLabel}</p>
            </div>
          </div>
          <button onClick={() => setAdding(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "#f9f7ef", border: "1px solid #ebe6dd" }}>
            <Plus size={14} style={{ color: "#a2998f" }} />
          </button>
        </div>

        {filtered.length === 0 && (
          <p className="text-sm text-center py-4" style={{ color: "#c5b9ab" }}>
            No events {filterLabel.toLowerCase()}.{" "}
            <button onClick={() => setAdding(true)} style={{ color: "#d68d84" }} className="hover:opacity-80">Add one</button>
          </p>
        )}

        <div className="space-y-2">
          {filtered.map((ev) => {
            const d = parseISO(ev.date);
            const todayEv = isToday(d);
            return (
              <div key={ev.id}
                className="flex items-start gap-3 p-3 rounded-xl group transition-all"
                style={{
                  background: "#f9f7ef",
                  border: `1px solid #ebe6dd`,
                  borderLeft: `3px solid ${ev.color}`,
                }}>
                <div className="flex-shrink-0 text-center min-w-[36px]">
                  <p className="text-xs font-medium" style={{ color: ev.color }}>{format(d, "MMM")}</p>
                  <p className="text-lg font-bold leading-none" style={{ color: "#785b4e" }}>{format(d, "d")}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#785b4e" }}>
                    {todayEv && (
                      <span className="text-xs font-semibold mr-1.5 px-1.5 py-0.5 rounded-md"
                        style={{ background: `${ev.color}20`, color: ev.color }}>Today</span>
                    )}
                    {ev.title}
                  </p>
                  {ev.time && (
                    <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "#a2998f" }}>
                      <Clock size={10} /> {ev.time}
                    </p>
                  )}
                  {ev.description && (
                    <p className="text-xs mt-0.5 truncate" style={{ color: "#c5b9ab" }}>{ev.description}</p>
                  )}
                </div>
                <button onClick={() => remove(ev.id)}
                  className="opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                  style={{ color: "#c5b9ab" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#d68d84")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#c5b9ab")}>
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
