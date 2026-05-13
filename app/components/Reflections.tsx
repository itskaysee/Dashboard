"use client";
import { useState, useEffect } from "react";
import { BookOpen, Save, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import type { Reflection } from "../types";

interface Props {
  reflections: Reflection[];
  setReflections: (r: Reflection[] | ((prev: Reflection[]) => Reflection[])) => void;
}

const CLOUDS = [
  { id: 1, top: "6%",  width: 110, duration: 22, delay: 0   },
  { id: 2, top: "28%", width: 140, duration: 30, delay: -8  },
  { id: 3, top: "50%", width: 90,  duration: 18, delay: -4  },
  { id: 4, top: "68%", width: 125, duration: 26, delay: -14 },
  { id: 5, top: "84%", width: 95,  duration: 20, delay: -10 },
];

function Cloud({ top, width, duration, delay }: { top: string; width: number; duration: number; delay: number }) {
  const h = width * 0.42;
  const c = "rgba(180,210,230,0.55)"; // soft blue-grey cloud color
  return (
    <div style={{
      position: "absolute",
      top,
      left: 0,
      width: `${width}px`,
      height: `${h}px`,
      animation: `cloudDrift ${duration}s linear ${delay}s infinite`,
      pointerEvents: "none",
      zIndex: 1,
    }}>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div style={{ position: "absolute", bottom: 0, left: "5%", width: "90%", height: "50%", background: c, borderRadius: "999px" }} />
        <div style={{ position: "absolute", bottom: "30%", left: "15%", width: "42%", height: "70%", background: c, borderRadius: "999px" }} />
        <div style={{ position: "absolute", bottom: "28%", left: "45%", width: "32%", height: "60%", background: c, borderRadius: "999px" }} />
        <div style={{ position: "absolute", bottom: "15%", left: "65%", width: "25%", height: "44%", background: c, borderRadius: "999px" }} />
      </div>
    </div>
  );
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
    <div className="rounded-2xl relative overflow-hidden"
      style={{ border: "1px solid #ebe6dd", boxShadow: "0 1px 8px rgba(120,91,78,0.06)" }}>

      {/* Cloud image background */}
      <div className="absolute inset-0" style={{
        backgroundImage: "url('/clouds.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.45,
      }} />

      {/* Content over clouds */}
      <div className="relative p-5" style={{ zIndex: 10 }}>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(246,239,223,0.85)", border: "1px solid #e8dfcf" }}>
              <BookOpen size={15} style={{ color: "#866a5b" }} />
            </div>
            <div>
              <p className="section-label">Reflection</p>
              <p className="text-xs font-medium" style={{ color: "#a2998f" }}>
                {isToday ? "Today" : format(viewDate, "MMM d, yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setViewDate((d) => subDays(d, 1))}
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "rgba(249,247,239,0.8)", border: "1px solid #ebe6dd" }}>
              <ChevronLeft size={12} style={{ color: "#a2998f" }} />
            </button>
            <button onClick={() => setViewDate(new Date())}
              className="px-2 h-6 rounded-md text-xs"
              style={{ background: "rgba(249,247,239,0.8)", border: "1px solid #ebe6dd", color: "#a2998f" }}>
              Today
            </button>
            <button onClick={() => setViewDate((d) => addDays(d, 1))}
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "rgba(249,247,239,0.8)", border: "1px solid #ebe6dd" }}>
              <ChevronRight size={12} style={{ color: "#a2998f" }} />
            </button>
          </div>
        </div>

        <textarea
          className="dash-input resize-none w-full"
          rows={5}
          placeholder={isToday ? "What's on your mind today? Gratitude, wins, thoughts..." : "No reflection for this day."}
          value={draft}
          onChange={(e) => { setDraft(e.target.value); setSaved(false); }}
          style={{ background: "rgba(255,255,255,0.45)", backdropFilter: "blur(2px)" }}
        />

        <div className="flex items-center justify-between mt-3">
          <p className="text-xs" style={{ color: "#c5b9ab" }}>
            {reflections.length} reflection{reflections.length !== 1 ? "s" : ""} total
          </p>
          <button
            onClick={save}
            disabled={!draft.trim()}
            className="dash-btn flex items-center gap-1.5 transition-all"
            style={{
              background: saved ? "rgba(142,150,125,0.15)" : draft.trim() ? "#866a5b" : "rgba(249,247,239,0.8)",
              color: saved ? "#8e967d" : draft.trim() ? "white" : "#c5b9ab",
              border: saved ? "1px solid rgba(142,150,125,0.3)" : "none",
              cursor: draft.trim() ? "pointer" : "default",
            }}>
            <Save size={13} />
            {saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
