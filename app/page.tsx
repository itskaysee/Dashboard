"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import WeekView from "./components/WeekView";
import MonthView from "./components/MonthView";
import QuarterView from "./components/QuarterView";
import HabitTracker from "./components/HabitTracker";
import YearlyGoals from "./components/YearlyGoals";
import BucketList from "./components/BucketList";
import type {
  CreditCard,
  SavingsAccount,
  GymSession,
  CalendarEvent,
  Task,
  Reflection,
  WeeklyFocus,
  QuarterlyAchievement,
  QuarterlyGoal,
  ParkingLotIdea,
  HabitLog,
  DevotionalEntry,
  CurrentlyReading,
  BookRead,
  MonthlyReflection,
  CustomHabit,
  YearlyReflection,
  YearlyBucket,
  BucketListItem,
  BingoProgress,
} from "./types";
import { DEFAULT_HABITS } from "./components/HabitTracker";

type Tab = "week" | "month" | "quarter" | "habits" | "year" | "bucket";

const TABS: { id: Tab; label: string }[] = [
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "quarter", label: "Quarter" },
  { id: "habits", label: "Habits" },
  { id: "year", label: "Year" },
  { id: "bucket", label: "Bucket List" },
];

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("week");
  const [loaded, setLoaded] = useState(false);

  const [googleConnected, setGoogleConnected] = useState<boolean | null>(null);

  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [gymSessions, setGymSessions] = useState<GymSession[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [focusData, setFocusData] = useState<WeeklyFocus[]>([]);
  const [achievements, setAchievements] = useState<QuarterlyAchievement[]>([]);
  const [quarterlyGoals, setQuarterlyGoals] = useState<QuarterlyGoal[]>([]);
  const [parkingLot, setParkingLot] = useState<ParkingLotIdea[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [devotionalEntries, setDevotionalEntries] = useState<DevotionalEntry[]>([]);
  const [currentlyReading, setCurrentlyReading] = useState<CurrentlyReading | null>(null);
  const [booksRead, setBooksRead] = useState<BookRead[]>([]);
  const [monthlyReflections, setMonthlyReflections] = useState<MonthlyReflection[]>([]);
  const [customHabits, setCustomHabits] = useState<CustomHabit[]>(DEFAULT_HABITS);
  const [yearlyReflections, setYearlyReflections] = useState<YearlyReflection[]>([]);
  const [yearlyBuckets, setYearlyBuckets] = useState<YearlyBucket[]>([]);
  const [bucketList, setBucketList] = useState<BucketListItem[]>([]);
  const [bingoProgress, setBingoProgress] = useState<BingoProgress[]>([]);

  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then((d) => {
        if (d.creditCards) setCreditCards(d.creditCards);
        if (d.savingsAccounts) setSavingsAccounts(d.savingsAccounts);
        if (d.gymSessions) setGymSessions(d.gymSessions);
        if (d.events) setEvents(d.events);
        if (d.tasks) setTasks(d.tasks);
        if (d.reflections) setReflections(d.reflections);
        if (d.focusData) setFocusData(d.focusData);
        if (d.achievements) setAchievements(d.achievements);
        if (d.quarterlyGoals) setQuarterlyGoals(d.quarterlyGoals);
        if (d.parkingLot) setParkingLot(d.parkingLot);
        if (d.habitLogs) setHabitLogs(d.habitLogs);
        if (d.devotionalEntries) setDevotionalEntries(d.devotionalEntries);
        if (d.currentlyReading) setCurrentlyReading(d.currentlyReading as CurrentlyReading);
        if (d.booksRead) setBooksRead(d.booksRead as BookRead[]);
        if (d.monthlyReflections) setMonthlyReflections(d.monthlyReflections as MonthlyReflection[]);
        if (d.customHabits) setCustomHabits(d.customHabits as CustomHabit[]);
        if (d.yearlyReflections) setYearlyReflections(d.yearlyReflections as YearlyReflection[]);
        if (d.yearlyBuckets) setYearlyBuckets(d.yearlyBuckets as YearlyBucket[]);
        if (d.bucketList) setBucketList(d.bucketList as BucketListItem[]);
        if (d.bingoProgress) setBingoProgress(d.bingoProgress as BingoProgress[]);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));

  }, []);

  useEffect(() => {
    if (!loaded) return;
    fetch("/api/calendar")
      .then((r) => r.json())
      .then((d) => {
        if (d.needsAuth) {
          setGoogleConnected(false);
        } else {
          setGoogleConnected(true);
          if (d.events?.length) {
            setEvents((prev) => [
              ...prev.filter((e) => !e.fromGoogle),
              ...d.events,
            ]);
          }
        }
      })
      .catch(() => setGoogleConnected(false));
  }, [loaded]);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getAllData = useCallback(
    () => ({
      creditCards, savingsAccounts, gymSessions,
      events: events.filter((e) => !e.fromGoogle),
      tasks, reflections, focusData, achievements, quarterlyGoals,
      parkingLot, habitLogs, devotionalEntries, currentlyReading, booksRead,
      monthlyReflections, customHabits, yearlyReflections, yearlyBuckets, bucketList,
      bingoProgress,
    }),
    [
      creditCards, savingsAccounts, gymSessions, events, tasks,
      reflections, focusData, achievements, quarterlyGoals,
      parkingLot, habitLogs, devotionalEntries, currentlyReading, booksRead,
      monthlyReflections, customHabits, yearlyReflections, yearlyBuckets, bucketList,
      bingoProgress,
    ]
  );

  function handleBookComplete(book: BookRead) {
    setBooksRead((prev) => [...prev, book]);
  }

  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch("/api/data", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getAllData()),
      });
    }, 1500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [getAllData, loaded]);

  const [today] = useState(() => new Date());
  const dayOfWeek = format(today, "EEEE");
  const dateLabel = format(today, "MMMM d, yyyy");

  return (
    <div className="min-h-screen" style={{ background: "#ffffff" }}>
      {/* Vision board header */}
      <img
        src="/headerimg.png"
        alt="Vision board"
        className="w-full block"
      />

      <div className="max-w-7xl mx-auto px-6 py-7">
        {/* Header */}
        <div className="mb-7 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", color: "#785b4e" }}>
              Hey Casey <span style={{ color: "#d68d84" }}>✦</span>
            </h1>
            <p style={{ color: "#a2998f", fontSize: "0.85rem", marginTop: "3px" }}>
              {dayOfWeek}, {dateLabel}
            </p>
          </div>

          <div className="flex gap-0.5 p-1 rounded-xl"
            style={{ background: "#ebe6dd", border: "1px solid #cbb8ad" }}>
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: tab === t.id ? "#ffffff" : "transparent",
                  color: tab === t.id ? "#785b4e" : "#a2998f",
                  border: tab === t.id ? "1px solid #cbb8ad" : "1px solid transparent",
                  boxShadow: tab === t.id ? "0 1px 4px rgba(120,91,78,0.1)" : "none",
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="animate-fade-in">
          {tab === "week" && (
            <WeekView
              gymSessions={gymSessions} setGymSessions={setGymSessions}
              events={events} setEvents={setEvents}
              tasks={tasks} setTasks={setTasks}
              reflections={reflections} setReflections={setReflections}
              focusData={focusData} setFocusData={setFocusData}
              currentlyReading={currentlyReading} setCurrentlyReading={setCurrentlyReading}
              onBookComplete={handleBookComplete}
              googleConnected={googleConnected}
            />
          )}
          {tab === "month" && (
            <MonthView
              gymSessions={gymSessions}
              monthlyReflections={monthlyReflections} setMonthlyReflections={setMonthlyReflections}
              currentlyReading={currentlyReading} setCurrentlyReading={setCurrentlyReading}
              onBookComplete={handleBookComplete}
              bingoProgress={bingoProgress} setBingoProgress={setBingoProgress}
            />
          )}
          {tab === "quarter" && (
            <QuarterView
              creditCards={creditCards} savingsAccounts={savingsAccounts}
              gymSessions={gymSessions}
              achievements={achievements} setAchievements={setAchievements}
              quarterlyGoals={quarterlyGoals} setQuarterlyGoals={setQuarterlyGoals}
              parkingLot={parkingLot} setParkingLot={setParkingLot}
              booksRead={booksRead} setBooksRead={setBooksRead}
            />
          )}
          {tab === "habits" && (
            <HabitTracker
              habits={customHabits} setHabits={setCustomHabits}
              logs={habitLogs} setLogs={setHabitLogs}
            />
          )}
          {tab === "bucket" && (
            <BucketList items={bucketList} setItems={setBucketList} />
          )}
          {tab === "year" && (
            <YearlyGoals
              reflections={yearlyReflections} setReflections={setYearlyReflections}
              buckets={yearlyBuckets} setBuckets={setYearlyBuckets}
            />
          )}
        </div>

        <p className="text-center text-xs mt-10" style={{ color: "#c5b9ab" }}>
          Built for you · {format(today, "yyyy")}
        </p>
      </div>
    </div>
  );
}
