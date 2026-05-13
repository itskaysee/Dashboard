"use client";
import { useState } from "react";
import { Target, Plus, X, Edit2, Check } from "lucide-react";
import { format, startOfWeek } from "date-fns";
import type { WeeklyFocus as WF } from "../types";

interface Props {
  focusData: WF[];
  setFocusData: (d: WF[] | ((prev: WF[]) => WF[])) => void;
  weekStart?: Date;
}

function getWeekKey(date: Date) {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return format(monday, "yyyy-'W'II");
}

/* SVG flower rendered inline so no external deps */
function Flower({ x, y, size, color, delay, duration }: {
  x: number; y: number; size: number; color: string; delay: number; duration: number;
}) {
  const id = `f-${x}-${y}`;
  return (
    <g style={{
      transformOrigin: `${x}px ${y}px`,
      animation: `flowerBloom ${duration}s ease-in-out ${delay}s infinite`,
    }}>
      {/* petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const px = x + Math.cos(rad) * size * 0.55;
        const py = y + Math.sin(rad) * size * 0.55;
        return (
          <ellipse
            key={i}
            cx={px} cy={py}
            rx={size * 0.32} ry={size * 0.2}
            transform={`rotate(${angle} ${px} ${py})`}
            fill={color}
            opacity={0.75}
          />
        );
      })}
      {/* centre */}
      <circle cx={x} cy={y} r={size * 0.22} fill="#cfbb9f" opacity={0.9} />
      <circle cx={x} cy={y} r={size * 0.1} fill="#866a5b" opacity={0.7} />
    </g>
  );
}

const FLOWERS = [
  { x: 30,  y: 30,  size: 18, color: "#d68d84", delay: 0,   duration: 6   },
  { x: 82,  y: 55,  size: 14, color: "#e1ad9d", delay: 0.8, duration: 7   },
  { x: 55,  y: 12,  size: 12, color: "#8e967d", delay: 1.6, duration: 5.5 },
  { x: 10,  y: 65,  size: 10, color: "#cfbb9f", delay: 2.2, duration: 6.5 },
  { x: 68,  y: 80,  size: 16, color: "#d68d84", delay: 0.4, duration: 7.5 },
  { x: 44,  y: 50,  size: 11, color: "#e1ad9d", delay: 1.2, duration: 6   },
  { x: 92,  y: 20,  size: 13, color: "#8e967d", delay: 2.8, duration: 5   },
  { x: 20,  y: 88,  size: 15, color: "#d68d84", delay: 0.6, duration: 7   },
  { x: 75,  y: 40,  size: 10, color: "#cfbb9f", delay: 3.2, duration: 6   },
  { x: 5,   y: 40,  size: 12, color: "#e1ad9d", delay: 1.9, duration: 5.5 },
  { x: 90,  y: 88,  size: 14, color: "#8e967d", delay: 0.3, duration: 6.5 },
  { x: 50,  y: 88,  size: 11, color: "#d68d84", delay: 2.5, duration: 7   },
];

export default function WeeklyFocus({ focusData, setFocusData, weekStart }: Props) {
  const refDate = weekStart ?? new Date();
  const weekKey = getWeekKey(refDate);
  const current = focusData.find((w) => w.weekKey === weekKey) ?? { weekKey, focus: "", goals: [] };

  const [editingFocus, setEditingFocus] = useState(false);
  const [focusDraft, setFocusDraft] = useState(current.focus);
  const [newGoal, setNewGoal] = useState("");

  const update = (patch: Partial<WF>) => {
    setFocusData((prev) => {
      const without = prev.filter((w) => w.weekKey !== weekKey);
      return [...without, { ...current, ...patch }];
    });
  };

  const saveFocus = () => { update({ focus: focusDraft }); setEditingFocus(false); };
  const addGoal = () => {
    if (!newGoal.trim()) return;
    update({ goals: [...current.goals, newGoal.trim()] });
    setNewGoal("");
  };
  const removeGoal = (i: number) => update({ goals: current.goals.filter((_, idx) => idx !== i) });

  const weekLabel = `Week of ${format(startOfWeek(refDate, { weekStartsOn: 1 }), "MMM d")}`;

  return (
    <div className="rounded-2xl relative overflow-hidden"
      style={{ border: "1px solid #ebe6dd", boxShadow: "0 1px 8px rgba(120,91,78,0.06)" }}>

      {/* Flower animation layer */}
      <style>{`
        @keyframes flowerBloom {
          0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
          20%  { transform: scale(1.15) rotate(5deg); opacity: 1; }
          50%  { transform: scale(1) rotate(0deg); opacity: 0.9; }
          80%  { transform: scale(1.05) rotate(-3deg); opacity: 0.85; }
          100% { transform: scale(0) rotate(20deg); opacity: 0; }
        }
      `}</style>

      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #fdf6ee 0%, #fef9f4 60%, #f9f3ea 100%)" }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", inset: 0 }}>
          {FLOWERS.map((f, i) => <Flower key={i} {...f} />)}
        </svg>
      </div>

      {/* Content over flowers */}
      <div className="relative z-10 p-5"
        style={{ background: "rgba(255,255,255,0.62)", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" }}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(246,239,223,0.85)", border: "1px solid #e8dfcf" }}>
            <Target size={15} style={{ color: "#8e967d" }} />
          </div>
          <div>
            <p className="section-label">Weekly Focus</p>
            <p className="text-xs" style={{ color: "#a2998f" }}>{weekLabel}</p>
          </div>
        </div>

        {/* Main focus */}
        <div className="mb-4">
          {editingFocus ? (
            <div className="flex gap-2">
              <input className="dash-input flex-1" placeholder="This week's main focus..."
                value={focusDraft} onChange={(e) => setFocusDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveFocus()} autoFocus />
              <button onClick={saveFocus}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(246,239,223,0.85)", border: "1px solid #e8dfcf" }}>
                <Check size={14} style={{ color: "#8e967d" }} />
              </button>
            </div>
          ) : (
            <button onClick={() => { setFocusDraft(current.focus); setEditingFocus(true); }}
              className="w-full text-left group">
              {current.focus ? (
                <div className="flex items-start justify-between gap-2">
                  <p className="text-base font-semibold leading-snug" style={{ color: "#785b4e" }}>
                    {current.focus}
                  </p>
                  <Edit2 size={13} style={{ color: "#c5b9ab" }} className="opacity-0 group-hover:opacity-100 mt-0.5 flex-shrink-0" />
                </div>
              ) : (
                <p className="text-sm italic" style={{ color: "#c5b9ab" }}>
                  Click to set this week&apos;s focus...
                </p>
              )}
            </button>
          )}
        </div>

        {/* Goals */}
        <div>
          <p className="section-label mb-2">Goals</p>
          <div className="space-y-1.5 mb-3">
            {current.goals.map((goal, i) => (
              <div key={i} className="flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#8e967d" }} />
                <span className="text-sm flex-1" style={{ color: "#785b4e" }}>{goal}</span>
                <button onClick={() => removeGoal(i)}
                  className="opacity-0 group-hover:opacity-100 transition-all"
                  style={{ color: "#c5b9ab" }}>
                  <X size={12} />
                </button>
              </div>
            ))}
            {current.goals.length === 0 && (
              <p className="text-xs italic" style={{ color: "#c5b9ab" }}>No goals yet.</p>
            )}
          </div>
          <div className="flex gap-2">
            <input className="dash-input flex-1 text-xs" placeholder="Add a goal..."
              value={newGoal} onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGoal()} />
            <button onClick={addGoal}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(246,239,223,0.85)", border: "1px solid #e8dfcf" }}>
              <Plus size={14} style={{ color: "#a2998f" }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
