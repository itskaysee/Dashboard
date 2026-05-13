"use client";
import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import type { MonthlyReflection } from "../types";

const QUESTIONS: { id: string; prompt: string }[] = [
  { id: "wins",       prompt: "What were your biggest wins this month?" },
  { id: "challenges", prompt: "What was your biggest challenge and how did you handle it?" },
  { id: "grateful",   prompt: "What are you most grateful for this month?" },
  { id: "learned",    prompt: "What's the most important thing you learned?" },
  { id: "health",     prompt: "How did you take care of your health — body and mind?" },
  { id: "growth",     prompt: "How did you grow personally or professionally?" },
  { id: "differently",prompt: "What would you do differently next month?" },
  { id: "intention",  prompt: "What's your intention going into next month?" },
];

interface Props {
  reflections: MonthlyReflection[];
  setReflections: (r: MonthlyReflection[] | ((prev: MonthlyReflection[]) => MonthlyReflection[])) => void;
  month: Date;
}

export default function MonthlyReflections({ reflections, setReflections, month }: Props) {
  const monthKey = format(month, "yyyy-MM");
  const existing = reflections.find((r) => r.monthKey === monthKey);
  const answers = existing?.answers ?? {};

  const [expanded, setExpanded] = useState<string | null>(QUESTIONS[0].id);

  const update = (id: string, value: string) => {
    setReflections((prev) => {
      const without = prev.filter((r) => r.monthKey !== monthKey);
      const newAnswers = { ...answers, [id]: value };
      return [...without, { monthKey, answers: newAnswers }];
    });
  };

  const answered = QUESTIONS.filter((q) => answers[q.id]?.trim()).length;

  return (
    <div className="rounded-2xl relative overflow-hidden"
      style={{ border: "1px solid #ebe6dd", boxShadow: "0 1px 8px rgba(120,91,78,0.06)" }}>

      {/* Cloud image background */}
      <div className="absolute inset-0" style={{
        backgroundImage: "url('/clouds.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.35,
      }} />

      <div className="relative p-5" style={{ zIndex: 10 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(246,239,223,0.85)", border: "1px solid #e8dfcf" }}>
              <BookOpen size={15} style={{ color: "#866a5b" }} />
            </div>
            <div>
              <p className="section-label">Monthly Reflection</p>
              <p className="text-xs" style={{ color: "#a2998f" }}>
                {format(month, "MMMM yyyy")} · {answered}/{QUESTIONS.length} answered
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {QUESTIONS.map((q) => {
            const isOpen = expanded === q.id;
            const hasAnswer = !!answers[q.id]?.trim();
            return (
              <div key={q.id} className="rounded-xl overflow-hidden transition-all"
                style={{ background: "rgba(255,255,255,0.55)", border: `1px solid ${hasAnswer ? "rgba(142,150,125,0.35)" : "#ebe6dd"}` }}>
                <button
                  onClick={() => setExpanded(isOpen ? null : q.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs flex-shrink-0" style={{ color: hasAnswer ? "#8e967d" : "#c5b9ab" }}>
                      {hasAnswer ? "✓" : "○"}
                    </span>
                    <span className="text-xs font-medium truncate" style={{ color: "#785b4e" }}>
                      {q.prompt}
                    </span>
                  </div>
                  <span className="flex-shrink-0 ml-2" style={{ color: "#c5b9ab" }}>
                    {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-3 pb-3">
                    <textarea
                      className="dash-input resize-none w-full"
                      rows={3}
                      placeholder="Write your thoughts..."
                      value={answers[q.id] ?? ""}
                      onChange={(e) => update(q.id, e.target.value)}
                      style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(2px)", fontSize: "0.8rem" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
