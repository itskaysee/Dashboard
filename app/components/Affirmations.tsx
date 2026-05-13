"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AFFIRMATIONS = [
  "I am building wealth and abundance every single day.",
  "God's plan for my life is greater than I can imagine.",
  "My dedication transforms my body, mind, and future.",
  "I am a skilled engineer growing into a leader and architect.",
  "Every payment brings me closer to complete financial freedom.",
  "I attract opportunities that align with my highest goals.",
  "I am disciplined, focused, and consistent in all that I do.",
  "I am worthy of love, success, and everything I desire.",
  "My consistency today builds the life I dream of tomorrow.",
  "I am becoming the best version of myself, one day at a time.",
  "I have the courage to face challenges and grow through them.",
  "My home is a sanctuary of peace, love, and abundance.",
  "I am on track to build generational wealth before 35.",
  "My body grows stronger with every workout I complete.",
  "I am surrounded by people who inspire and lift me higher.",
  "I choose faith over fear in every area of my life.",
  "I am enough, and I am always growing into more.",
];

export default function Affirmations() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  const go = (dir: 1 | -1) => {
    setFading(true);
    setTimeout(() => {
      setIndex((i) => (i + dir + AFFIRMATIONS.length) % AFFIRMATIONS.length);
      setFading(false);
    }, 250);
  };

  useEffect(() => {
    const interval = setInterval(() => go(1), 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => go(-1)}
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
        style={{ background: "rgba(255,255,255,0.6)", border: "1px solid #ebe6dd" }}
      >
        <ChevronLeft size={14} style={{ color: "#a2998f" }} />
      </button>

      <div
        className="flex-1 rounded-xl px-5 py-3 text-center"
        style={{
          background: "rgba(255,255,255,0.55)",
          border: "1px solid rgba(235,230,221,0.7)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <p
          className="leading-relaxed transition-opacity duration-300"
          style={{ opacity: fading ? 0 : 1, color: "#785b4e", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", fontWeight: 700, fontStyle: "italic" }}
        >
          &ldquo;{AFFIRMATIONS[index]}&rdquo;
        </p>
        <div className="flex justify-center gap-1 mt-2.5">
          {AFFIRMATIONS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setFading(true);
                setTimeout(() => { setIndex(i); setFading(false); }, 250);
              }}
              className="rounded-full transition-all duration-200"
              style={{
                width: i === index ? "16px" : "4px",
                height: "4px",
                background: i === index ? "#d68d84" : "#e8dfcf",
              }}
            />
          ))}
        </div>
      </div>

      <button
        onClick={() => go(1)}
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
        style={{ background: "rgba(255,255,255,0.6)", border: "1px solid #ebe6dd" }}
      >
        <ChevronRight size={14} style={{ color: "#a2998f" }} />
      </button>
    </div>
  );
}
