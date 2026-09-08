"use client";
import { useState } from "react";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  getDay,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns";
// parseISO and isSameMonth used in MiniCalendar
import { Dumbbell, ChevronLeft, ChevronRight, LayoutGrid, Grid3X3, BookOpen } from "lucide-react";
import CurrentlyReadingWidget from "./CurrentlyReading";
import MonthlyReflections from "./MonthlyReflections";
import BingoCard from "./BingoCard";
import type { GymSession, CurrentlyReading, BookRead, MonthlyReflection } from "../types";

interface Props {
  gymSessions: GymSession[];
  monthlyReflections: MonthlyReflection[];
  setMonthlyReflections: (r: MonthlyReflection[] | ((prev: MonthlyReflection[]) => MonthlyReflection[])) => void;
  currentlyReading: CurrentlyReading | null;
  setCurrentlyReading: (b: CurrentlyReading | null) => void;
  onBookComplete: (book: BookRead) => void;
}

function MiniCalendar({ sessions, month, onPrev, onNext }: {
  sessions: GymSession[];
  month: Date;
  onPrev: () => void;
  onNext: () => void;
}) {
  const today = new Date();
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });

  const startDow = getDay(start);
  const leadingDays = startDow === 0 ? 6 : startDow - 1;
  const padded = Array(leadingDays).fill(null).concat(days);

  const sessionDates = sessions.map((s) => s.date);
  const monthSessions = sessions.filter((s) => isSameMonth(parseISO(s.date), month));

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#f6efdf", border: "1px solid #e8dfcf" }}>
            <Dumbbell size={15} style={{ color: "#866a5b" }} />
          </div>
          <div>
            <p className="section-label">Gym — {format(month, "MMMM yyyy")}</p>
            <p className="text-sm font-semibold" style={{ color: "#785b4e" }}>
              {monthSessions.length}{" "}
              <span className="font-normal" style={{ color: "#a2998f" }}>sessions</span>
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={onPrev}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "#f6efdf", border: "1px solid #e8dfcf" }}>
            <ChevronLeft size={14} style={{ color: "#a2998f" }} />
          </button>
          <button onClick={onNext}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "#f6efdf", border: "1px solid #e8dfcf" }}>
            <ChevronRight size={14} style={{ color: "#a2998f" }} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="text-center text-xs font-medium" style={{ color: "#c5b9ab" }}>{d}</div>
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
                background: isGym ? "#d68d84" : isToday ? "rgba(214,141,132,0.08)" : "transparent",
                border: isGym ? "1px solid #c47a72" : isToday ? "1px solid rgba(214,141,132,0.3)" : "1px solid transparent",
                color: isGym ? "#fff" : isToday ? "#d68d84" : "#c5b9ab",
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

type Section = "overview" | "bingo" | "reflections";

const SECTIONS: { id: Section; label: string; icon: typeof LayoutGrid }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "bingo", label: "Bingo Card", icon: Grid3X3 },
  { id: "reflections", label: "Reflections", icon: BookOpen },
];

export default function MonthView({
  gymSessions,
  monthlyReflections, setMonthlyReflections,
  currentlyReading, setCurrentlyReading,
  onBookComplete,
}: Props) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [section, setSection] = useState<Section>("overview");

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Left nav */}
      <nav className="lg:w-48 lg:shrink-0">
        <div className="glass rounded-2xl p-2 flex lg:flex-col gap-1 overflow-x-auto lg:sticky lg:top-6">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = section === s.id;
            return (
              <button key={s.id} onClick={() => setSection(s.id)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 lg:w-full"
                style={{
                  background: active ? "#f6efdf" : "transparent",
                  color: active ? "#785b4e" : "#a2998f",
                  border: active ? "1px solid #e8dfcf" : "1px solid transparent",
                }}>
                <Icon size={15} style={{ color: active ? "#866a5b" : "#c5b9ab" }} />
                {s.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-4">
        {section === "overview" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <MiniCalendar
              sessions={gymSessions}
              month={selectedMonth}
              onPrev={() => setSelectedMonth((m) => subMonths(m, 1))}
              onNext={() => setSelectedMonth((m) => addMonths(m, 1))}
            />
            <CurrentlyReadingWidget book={currentlyReading} setBook={setCurrentlyReading} onComplete={onBookComplete} />
          </div>
        )}
        {section === "bingo" && <BingoCard />}
        {section === "reflections" && (
          <MonthlyReflections
            reflections={monthlyReflections}
            setReflections={setMonthlyReflections}
            month={selectedMonth}
          />
        )}
      </div>
    </div>
  );
}
