"use client";
import { useState } from "react";
import { addWeeks, subWeeks, startOfWeek, endOfWeek, format, isSameWeek, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Affirmations from "./Affirmations";
import WeeklyFocus from "./WeeklyFocus";
import GymTracker from "./GymTracker";
import TaskChecklist from "./TaskChecklist";
import EventsWidget from "./EventsWidget";
import Reflections from "./Reflections";
import CurrentlyReadingWidget from "./CurrentlyReading";
import type {
  GymSession,
  CalendarEvent,
  Task,
  Reflection,
  WeeklyFocus as WF,
  CurrentlyReading,
  BookRead,
} from "../types";

interface Props {
  gymSessions: GymSession[];
  setGymSessions: (s: GymSession[] | ((prev: GymSession[]) => GymSession[])) => void;
  events: CalendarEvent[];
  setEvents: (e: CalendarEvent[] | ((prev: CalendarEvent[]) => CalendarEvent[])) => void;
  tasks: Task[];
  setTasks: (t: Task[] | ((prev: Task[]) => Task[])) => void;
  reflections: Reflection[];
  setReflections: (r: Reflection[] | ((prev: Reflection[]) => Reflection[])) => void;
  focusData: WF[];
  setFocusData: (d: WF[] | ((prev: WF[]) => WF[])) => void;
  currentlyReading: CurrentlyReading | null;
  setCurrentlyReading: (b: CurrentlyReading | null) => void;
  onBookComplete: (book: BookRead) => void;
  googleConnected: boolean | null;
}

export default function WeekView({
  gymSessions, setGymSessions,
  events, setEvents,
  tasks, setTasks,
  reflections, setReflections,
  focusData, setFocusData,
  currentlyReading, setCurrentlyReading,
  onBookComplete,
  googleConnected,
}: Props) {
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  const weekStart = startOfWeek(
    weekOffset === 0 ? today : weekOffset > 0
      ? addWeeks(today, weekOffset)
      : subWeeks(today, -weekOffset),
    { weekStartsOn: 1 }
  );
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const isCurrentWeek = isSameWeek(weekStart, today, { weekStartsOn: 1 });

  const weekLabel = isCurrentWeek
    ? "This Week"
    : `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`;

  // Filter events for the selected week
  const weekEvents = events.filter((e) => {
    const d = parseISO(e.date);
    return d >= weekStart && d <= weekEnd;
  });

  return (
    <div className="space-y-4">
      {/* Week nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "#f6efdf", border: "1px solid #e8dfcf" }}>
            <ChevronLeft size={14} style={{ color: "#a2998f" }} />
          </button>
          <span className="text-sm font-medium" style={{ color: "#785b4e", minWidth: 160, textAlign: "center" }}>
            {weekLabel}
          </span>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "#f6efdf", border: "1px solid #e8dfcf" }}>
            <ChevronRight size={14} style={{ color: "#a2998f" }} />
          </button>
          {!isCurrentWeek && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-xs px-2.5 py-1 rounded-lg"
              style={{ background: "#f6efdf", color: "#866a5b", border: "1px solid #e8dfcf" }}>
              Today
            </button>
          )}
        </div>
      </div>

      {googleConnected === false && (
        <a
          href="/api/auth/google"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm w-fit"
          style={{ background: "#f6efdf", border: "1px solid #e8dfcf", color: "#866a5b", textDecoration: "none" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Connect Google Calendar
        </a>
      )}

      <Affirmations />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="xl:col-span-2">
          <WeeklyFocus focusData={focusData} setFocusData={setFocusData} weekStart={weekStart} />
        </div>
        <div className="xl:col-span-2">
          <GymTracker sessions={gymSessions} setSessions={setGymSessions} weekStart={weekStart} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 flex flex-col gap-4">
          <TaskChecklist tasks={tasks} setTasks={setTasks} weekStart={weekStart} />
          <EventsWidget
            events={weekEvents}
            setEvents={setEvents}
            filter="all"
            filterLabel={isCurrentWeek ? "This Week" : format(weekStart, "MMM d")}
          />
        </div>
        <div className="flex flex-col gap-4">
          <CurrentlyReadingWidget book={currentlyReading} setBook={setCurrentlyReading} onComplete={onBookComplete} />
          <Reflections reflections={reflections} setReflections={setReflections} />
        </div>
      </div>
    </div>
  );
}
