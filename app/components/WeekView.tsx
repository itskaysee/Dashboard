"use client";
import Affirmations from "./Affirmations";
import WeeklyFocus from "./WeeklyFocus";
import GymTracker from "./GymTracker";
import TaskChecklist from "./TaskChecklist";
import EventsWidget from "./EventsWidget";
import Reflections from "./Reflections";
import type {
  GymSession,
  CalendarEvent,
  Task,
  Reflection,
  WeeklyFocus as WF,
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
}

export default function WeekView({
  gymSessions, setGymSessions,
  events, setEvents,
  tasks, setTasks,
  reflections, setReflections,
  focusData, setFocusData,
}: Props) {
  return (
    <div className="space-y-4">
      <Affirmations />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WeeklyFocus focusData={focusData} setFocusData={setFocusData} />
        <GymTracker sessions={gymSessions} setSessions={setGymSessions} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TaskChecklist tasks={tasks} setTasks={setTasks} />
        <EventsWidget events={events} setEvents={setEvents} filter="week" />
      </div>

      <Reflections reflections={reflections} setReflections={setReflections} />
    </div>
  );
}
