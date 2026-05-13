export interface CreditCard {
  id: string;
  name: string;
  balance: number;
  originalBalance: number;
  limit: number;
  color: string;
}

export interface SavingsAccount {
  id: string;
  name: string;
  balance: number;
  goal: number;
  color: string;
}

export interface GymSession {
  id: string;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  description?: string;
  color: string;
  fromGoogle?: boolean;
  googleId?: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
  project?: string;
}

export interface Reflection {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
}

export interface WeeklyFocus {
  weekKey: string; // e.g. "2024-W14"
  focus: string;
  goals: string[];
}

export interface QuarterlyAchievement {
  id: string;
  quarterKey: string; // e.g. "2024-Q2"
  text: string;
}

export type GoalCategory = "Finance" | "Health" | "Business" | "Personal";

export interface QuarterlyGoal {
  id: string;
  quarterKey: string;
  category: GoalCategory;
  text: string;
  completed: boolean;
}

export interface ParkingLotIdea {
  id: string;
  text: string;
  createdAt: string; // ISO date
}

export interface HabitLog {
  habitId: string;
  date: string; // YYYY-MM-DD
}

export interface CustomHabit {
  id: string;
  label: string;
  sublabel?: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  goal: number;
  section: "daily" | "devotional";
}

export interface DevotionalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  scripture: string;  // e.g. "John 3:16"
  notes: string;
}

export interface CurrentlyReading {
  title: string;
  author: string;
  coverId?: number; // Open Library cover ID
  openLibraryKey?: string; // e.g. "/works/OL123W"
  status: "reading" | "paused" | "completed";
}

export interface BookRead {
  id: string;
  quarterKey: string; // e.g. "2026-Q2"
  title: string;
  author: string;
  coverId?: number;
  completedAt: string; // ISO date
}

export interface BucketListItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string; // ISO date
  category?: string;
}

export interface YearlyReflection {
  year: number;
  vision: string;
  nonNegotiables: string;
  focus: string;
  change: string;
}

export interface YearlyBucket {
  id: string;
  year: number;
  title: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  items: string[];
}

export interface YearlyGoal {
  id: string;
  year: number;
  category: GoalCategory;
  text: string;
  completed: boolean;
}

export interface MonthlyReflection {
  monthKey: string; // e.g. "2026-04"
  answers: Record<string, string>; // questionId → answer
}
