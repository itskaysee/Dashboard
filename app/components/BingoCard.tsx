"use client";
import { Grid3X3, Check, RotateCcw } from "lucide-react";
import type { BingoProgress } from "../types";

/**
 * The current bingo card. When a new month's card is exported from Canva,
 * drop the image in /public and update these four fields — the grid geometry
 * below only needs touching if the Canva layout itself changes.
 */
const CARD = {
  monthKey: "2026-09",
  monthLabel: "September",
  image: "/bingo-card.jpg",
  squares: [
    "Read one book",
    "Try a new recipe",
    "Go for a morning walk",
    "5 hours leetcode/week",
    "Solo movie date",
    "Porch cleanup",
    "Scroll-free day",
    "Discover a new artist",
    "Try a new workout class",
  ],
};

// Measured from the card image: square positions as % of image width/height.
const COL_LEFT = [18.4, 40.1, 62.0];
const ROW_TOP = [34.2, 51.8, 69.4];
const SQUARE_W = 19.5;
const SQUARE_H = 15.7;

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],            // diagonals
];

interface Props {
  progress: BingoProgress[];
  setProgress: (p: BingoProgress[] | ((prev: BingoProgress[]) => BingoProgress[])) => void;
}

export default function BingoCard({ progress, setProgress }: Props) {
  const completed = progress.find((p) => p.monthKey === CARD.monthKey)?.completed ?? [];

  const toggle = (i: number) => {
    setProgress((prev) => {
      const without = prev.filter((p) => p.monthKey !== CARD.monthKey);
      const next = completed.includes(i)
        ? completed.filter((n) => n !== i)
        : [...completed, i];
      return [...without, { monthKey: CARD.monthKey, completed: next }];
    });
  };

  const clear = () => {
    setProgress((prev) => prev.filter((p) => p.monthKey !== CARD.monthKey));
  };

  const bingos = LINES.filter((line) => line.every((i) => completed.includes(i))).length;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#f6efdf", border: "1px solid #e8dfcf" }}>
            <Grid3X3 size={15} style={{ color: "#866a5b" }} />
          </div>
          <div>
            <p className="section-label">Bingo Card</p>
            <p className="text-sm font-semibold" style={{ color: "#785b4e" }}>
              {completed.length}/9{" "}
              <span className="font-normal" style={{ color: "#a2998f" }}>
                crossed off{bingos > 0 ? ` · ${bingos} bingo${bingos > 1 ? "s" : ""}!` : ""}
              </span>
            </p>
          </div>
        </div>
        {completed.length > 0 && (
          <button onClick={clear} className="dash-btn dash-btn-ghost flex items-center gap-1.5">
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>

      <div className="flex justify-center">
        <div className="relative w-full max-w-md">
          <img
            src={CARD.image}
            alt={`${CARD.monthLabel} bingo card`}
            className="w-full rounded-xl block"
            style={{ border: "1px solid #ebe6dd", boxShadow: "0 1px 8px rgba(120,91,78,0.06)" }}
          />

          {CARD.squares.map((label, i) => {
            const done = completed.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                aria-pressed={done}
                aria-label={`${label}${done ? " — done" : ""}`}
                title={label}
                className="absolute flex items-center justify-center rounded-2xl transition-all duration-200"
                style={{
                  left: `${COL_LEFT[i % 3]}%`,
                  top: `${ROW_TOP[Math.floor(i / 3)]}%`,
                  width: `${SQUARE_W}%`,
                  height: `${SQUARE_H}%`,
                  background: done ? "rgba(120,91,78,0.55)" : "transparent",
                  cursor: "pointer",
                  border: "none",
                  padding: 0,
                }}
              >
                {done && (
                  <Check size={38} strokeWidth={3} style={{ color: "#fff" }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-center text-xs mt-4" style={{ color: "#c5b9ab" }}>
        {bingos > 0
          ? "You got a line — keep going for the blackout ✦"
          : "Tap a square each time you finish one — go for a full row."}
      </p>
    </div>
  );
}
