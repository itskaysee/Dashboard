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
