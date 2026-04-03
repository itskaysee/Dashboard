"use client";
import { useState, useEffect } from "react";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

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
    <div className="glass rounded-2xl p-6 relative overflow-hidden">
      {/* glow bg */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.4) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex items-center gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
          <Sparkles size={18} className="text-violet-400" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="section-label mb-1">Daily Affirmation</p>
          <p
            className="text-base font-medium text-slate-100 leading-snug transition-opacity duration-300"
            style={{ opacity: fading ? 0 : 1 }}
          >
            &ldquo;{AFFIRMATIONS[index]}&rdquo;
          </p>
        </div>

        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => go(-1)}
            className="w-7 h-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={14} className="text-slate-400" />
          </button>
          <button
            onClick={() => go(1)}
            className="w-7 h-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ChevronRight size={14} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* dot indicators */}
      <div className="relative z-10 flex justify-center gap-1 mt-4">
        {AFFIRMATIONS.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setFading(true);
              setTimeout(() => {
                setIndex(i);
                setFading(false);
              }, 250);
            }}
            className="w-1.5 h-1.5 rounded-full transition-all duration-200"
            style={{
              background: i === index ? "#8b5cf6" : "rgba(255,255,255,0.2)",
              transform: i === index ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
