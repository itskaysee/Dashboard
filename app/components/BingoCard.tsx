"use client";
import { Grid3X3 } from "lucide-react";

export default function BingoCard() {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "#f6efdf", border: "1px solid #e8dfcf" }}>
          <Grid3X3 size={15} style={{ color: "#866a5b" }} />
        </div>
        <div>
          <p className="section-label">Bingo Card</p>
          <p className="text-sm font-semibold" style={{ color: "#785b4e" }}>
            September{" "}
            <span className="font-normal" style={{ color: "#a2998f" }}>challenge</span>
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <img
          src="/bingo-card.jpg"
          alt="September bingo card"
          className="w-full max-w-md rounded-xl"
          style={{ border: "1px solid #ebe6dd", boxShadow: "0 1px 8px rgba(120,91,78,0.06)" }}
        />
      </div>

      <p className="text-center text-xs mt-4" style={{ color: "#c5b9ab" }}>
        Cross one off each time you complete it — go for a full row.
      </p>
    </div>
  );
}
