"use client";
import { useState } from "react";
import { format } from "date-fns";
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import type { YearlyReflection, YearlyBucket } from "../types";

const REFLECTION_CARDS = [
  {
    key: "vision" as const,
    title: "Life Vision",
    prompt: "What is my life vision?",
    description: "Your life vision is the big picture — who you're becoming and what you're building over the long arc of your life. Think beyond the year. What does a life well-lived look like for you? What legacy, feeling, or impact do you want to be known for?",
    color: "#d68d84",
    bg: "rgba(214,141,132,0.07)",
    border: "rgba(214,141,132,0.2)",
    icon: "✦",
  },
  {
    key: "nonNegotiables" as const,
    title: "Non-Negotiables",
    prompt: "What are my non-negotiables?",
    description: "Non-negotiables are the commitments you refuse to compromise on — the daily anchors and values that keep you grounded regardless of how busy or chaotic life gets. These protect your peace and identity.",
    color: "#8e967d",
    bg: "rgba(142,150,125,0.07)",
    border: "rgba(142,150,125,0.2)",
    icon: "◆",
  },
  {
    key: "focus" as const,
    title: "Focus",
    prompt: "What do I want to focus on?",
    description: "Focus is where your energy flows this year. Not everything, not everywhere — just the specific areas of life, work, or growth that deserve your deepest attention right now. What deserves a yes this year?",
    color: "#866a5b",
    bg: "rgba(134,106,91,0.07)",
    border: "rgba(134,106,91,0.2)",
    icon: "●",
  },
  {
    key: "change" as const,
    title: "Change",
    prompt: "What do I want to change?",
    description: "Change starts with honest awareness. What patterns, habits, relationships, or ways of thinking are no longer serving you? Name what needs to shift — not out of shame, but out of intentional growth.",
    color: "#cfbb9f",
    bg: "rgba(207,187,159,0.1)",
    border: "rgba(207,187,159,0.3)",
    icon: "→",
  },
];

const BUCKET_COLORS = [
  { color: "#d68d84", bg: "rgba(214,141,132,0.08)", border: "rgba(214,141,132,0.25)" },
  { color: "#8e967d", bg: "rgba(142,150,125,0.08)", border: "rgba(142,150,125,0.25)" },
  { color: "#7a816c", bg: "rgba(122,129,108,0.08)", border: "rgba(122,129,108,0.25)" },
  { color: "#866a5b", bg: "rgba(134,106,91,0.08)",  border: "rgba(134,106,91,0.25)"  },
  { color: "#cfbb9f", bg: "rgba(207,187,159,0.1)",  border: "rgba(207,187,159,0.3)"  },
  { color: "#9c948a", bg: "rgba(156,148,138,0.08)", border: "rgba(156,148,138,0.25)" },
];

interface Props {
  reflections: YearlyReflection[];
  setReflections: (r: YearlyReflection[] | ((prev: YearlyReflection[]) => YearlyReflection[])) => void;
  buckets: YearlyBucket[];
  setBuckets: (b: YearlyBucket[] | ((prev: YearlyBucket[]) => YearlyBucket[])) => void;
}

function ReflectionCard({
  card,
  value,
  onChange,
}: {
  card: typeof REFLECTION_CARDS[number];
  value: string;
  onChange: (v: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4" style={{ borderBottom: "1px solid #ebe6dd" }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-bold" style={{ color: card.color }}>{card.icon}</span>
          <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: card.color, letterSpacing: "0.06em" }}>
            {card.title}
          </p>
        </div>
        <p className="text-sm font-semibold leading-snug" style={{ color: "#785b4e", fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>
          {card.prompt}
        </p>
      </div>

      {/* Description (collapsible) */}
      <div className="px-4 pt-3">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-1 text-xs mb-2 transition-opacity hover:opacity-70"
          style={{ color: "#a2998f" }}
        >
          {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          {expanded ? "Hide guide" : "Show guide"}
        </button>
        {expanded && (
          <p className="text-xs leading-relaxed mb-3 pb-3" style={{ color: "#a2998f", borderBottom: "1px solid #f0ebe3" }}>
            {card.description}
          </p>
        )}
      </div>

      {/* Answer */}
      <div className="px-4 pb-4 flex-1 flex flex-col">
        <textarea
          className="dash-input resize-none w-full flex-1"
          rows={5}
          placeholder={`Write your answer...`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ background: card.bg, border: `1px solid ${card.border}`, fontSize: "0.82rem" }}
        />
        {value.trim() && (
          <p className="text-xs mt-1.5 text-right" style={{ color: card.color, opacity: 0.7 }}>✓ saved</p>
        )}
      </div>
    </div>
  );
}

function BucketCard({
  bucket,
  onDelete,
  onAddItem,
  onDeleteItem,
}: {
  bucket: YearlyBucket;
  onDelete: () => void;
  onAddItem: (text: string) => void;
  onDeleteItem: (idx: number) => void;
}) {
  const [newItem, setNewItem] = useState("");

  const add = () => {
    if (!newItem.trim()) return;
    onAddItem(newItem.trim());
    setNewItem("");
  };

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "#fff", border: `1px solid ${bucket.border}`, boxShadow: "0 1px 8px rgba(120,91,78,0.06)" }}>
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ background: bucket.bg, borderBottom: `1px solid ${bucket.border}` }}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: bucket.color, fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>
            {bucket.title}
          </p>
          {bucket.description && (
            <p className="text-xs truncate mt-0.5" style={{ color: "#a2998f" }}>{bucket.description}</p>
          )}
        </div>
        <button onClick={onDelete} className="flex-shrink-0 ml-2 opacity-50 hover:opacity-100 transition-opacity" style={{ color: "#c5b9ab" }}>
          <X size={14} />
        </button>
      </div>

      <div className="p-3 space-y-1.5">
        {bucket.items.length === 0 && (
          <p className="text-xs italic px-1" style={{ color: "#c5b9ab" }}>No items yet.</p>
        )}
        {bucket.items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 group px-1 py-0.5 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="flex-shrink-0 mt-0.5" style={{ color: bucket.color }}>→</span>
            <span className="text-sm flex-1 leading-snug" style={{ color: "#785b4e" }}>{item}</span>
            <button onClick={() => onDeleteItem(i)}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: "#c5b9ab" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#d68d84")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#c5b9ab")}>
              <X size={11} />
            </button>
          </div>
        ))}
      </div>

      <div className="px-3 pb-3 flex gap-2">
        <input
          className="dash-input flex-1 text-xs"
          placeholder="Add item..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          style={{ fontSize: "0.78rem" }}
        />
        <button onClick={add}
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: bucket.bg, border: `1px solid ${bucket.border}` }}>
          <Plus size={13} style={{ color: bucket.color }} />
        </button>
      </div>
    </div>
  );
}

export default function YearlyGoals({ reflections, setReflections, buckets, setBuckets }: Props) {
  const year = new Date().getFullYear();
  const existing = reflections.find((r) => r.year === year);

  const updateField = (field: keyof Omit<YearlyReflection, "year">, value: string) => {
    setReflections((prev) => {
      const without = prev.filter((r) => r.year !== year);
      const current = existing ?? { year, vision: "", nonNegotiables: "", focus: "", change: "" };
      return [...without, { ...current, [field]: value }];
    });
  };

  const yearBuckets = buckets.filter((b) => b.year === year);

  // New bucket form
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [colorIdx, setColorIdx] = useState(0);
  const [addingBucket, setAddingBucket] = useState(false);

  const addBucket = () => {
    if (!newTitle.trim()) return;
    const col = BUCKET_COLORS[colorIdx];
    setBuckets((prev) => [...prev, {
      id: crypto.randomUUID(),
      year,
      title: newTitle.trim(),
      description: newDesc.trim(),
      items: [],
      ...col,
    }]);
    setNewTitle("");
    setNewDesc("");
    setColorIdx(0);
    setAddingBucket(false);
  };

  const deleteBucket = (id: string) => setBuckets((prev) => prev.filter((b) => b.id !== id));

  const addItem = (id: string, text: string) => setBuckets((prev) =>
    prev.map((b) => b.id === id ? { ...b, items: [...b.items, text] } : b)
  );

  const deleteItem = (id: string, idx: number) => setBuckets((prev) =>
    prev.map((b) => b.id === id ? { ...b, items: b.items.filter((_, i) => i !== idx) } : b)
  );

  return (
    <div className="space-y-8">
      {/* Year heading */}
      <div>
        <h2 className="text-xl font-bold" style={{ fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", color: "#785b4e" }}>
          {year} — Your Year
        </h2>
        <p className="text-sm mt-1" style={{ color: "#a2998f" }}>
          Answer these four questions to set the foundation for your year.
        </p>
      </div>

      {/* 4 reflection columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {REFLECTION_CARDS.map((card) => (
          <ReflectionCard
            key={card.key}
            card={card}
            value={existing?.[card.key] ?? ""}
            onChange={(v) => updateField(card.key, v)}
          />
        ))}
      </div>

      {/* Yearly buckets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold" style={{ fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", color: "#785b4e" }}>
              Focus Buckets
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "#a2998f" }}>
              Group your intentions into themes — areas of life you're actively investing in this year.
            </p>
          </div>
          <button
            onClick={() => setAddingBucket((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: "#f6efdf", border: "1px solid #e8dfcf", color: "#866a5b" }}>
            <Plus size={14} />
            New Bucket
          </button>
        </div>

        {/* Add bucket form */}
        {addingBucket && (
          <div className="glass rounded-2xl p-4 mb-4 space-y-3">
            <p className="section-label">New Focus Bucket</p>
            <div className="flex gap-2">
              <input className="dash-input flex-1" placeholder="Bucket name (e.g. Career, Health, Finances)"
                value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addBucket()} />
            </div>
            <input className="dash-input w-full" placeholder="Short description (optional)"
              value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {BUCKET_COLORS.map((c, i) => (
                  <button key={i} onClick={() => setColorIdx(i)}
                    className="w-5 h-5 rounded-full transition-transform"
                    style={{
                      background: c.color,
                      transform: colorIdx === i ? "scale(1.35)" : "scale(1)",
                      outline: colorIdx === i ? `2px solid ${c.color}` : "none",
                      outlineOffset: "2px",
                    }} />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setAddingBucket(false)}
                  className="px-3 py-1.5 rounded-lg text-sm"
                  style={{ background: "#f9f7ef", color: "#a2998f", border: "1px solid #ebe6dd" }}>
                  Cancel
                </button>
                <button onClick={addBucket} disabled={!newTitle.trim()}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: newTitle.trim() ? "#785b4e" : "#f9f7ef",
                    color: newTitle.trim() ? "#fff" : "#c5b9ab",
                  }}>
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {yearBuckets.length === 0 && !addingBucket && (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-sm" style={{ color: "#c5b9ab" }}>
              No focus buckets yet.{" "}
              <button onClick={() => setAddingBucket(true)} style={{ color: "#d68d84" }} className="hover:opacity-80">
                Add your first one
              </button>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {yearBuckets.map((bucket) => (
            <BucketCard
              key={bucket.id}
              bucket={bucket}
              onDelete={() => deleteBucket(bucket.id)}
              onAddItem={(text) => addItem(bucket.id, text)}
              onDeleteItem={(idx) => deleteItem(bucket.id, idx)}
            />
          ))}
        </div>
      </div>

      <p className="text-center text-xs" style={{ color: "#c5b9ab" }}>
        {format(new Date(), "yyyy")} · Make it your year ✦
      </p>
    </div>
  );
}
