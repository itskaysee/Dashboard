"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { BucketListItem } from "../types";

const CATEGORIES = ["Travel", "Experience", "Career", "Personal", "Health", "Creative", "Financial", "Other"];

const CATEGORY_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  Travel:     { color: "#7a816c", bg: "rgba(122,129,108,0.08)", border: "rgba(122,129,108,0.2)" },
  Experience: { color: "#d68d84", bg: "rgba(214,141,132,0.08)", border: "rgba(214,141,132,0.2)" },
  Career:     { color: "#866a5b", bg: "rgba(134,106,91,0.08)",  border: "rgba(134,106,91,0.2)"  },
  Personal:   { color: "#cfbb9f", bg: "rgba(207,187,159,0.1)",  border: "rgba(207,187,159,0.3)" },
  Health:     { color: "#8e967d", bg: "rgba(142,150,125,0.08)", border: "rgba(142,150,125,0.2)" },
  Creative:   { color: "#9c948a", bg: "rgba(156,148,138,0.08)", border: "rgba(156,148,138,0.2)" },
  Financial:  { color: "#7a816c", bg: "rgba(122,129,108,0.08)", border: "rgba(122,129,108,0.2)" },
  Other:      { color: "#a2998f", bg: "rgba(162,153,143,0.08)", border: "rgba(162,153,143,0.2)" },
};

interface Props {
  items: BucketListItem[];
  setItems: (i: BucketListItem[] | ((prev: BucketListItem[]) => BucketListItem[])) => void;
}

export default function BucketList({ items, setItems }: Props) {
  const [newText, setNewText] = useState("");
  const [newCategory, setNewCategory] = useState("Experience");
  const [filter, setFilter] = useState<"all" | "todo" | "done">("all");

  const add = () => {
    if (!newText.trim()) return;
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: newText.trim(), completed: false, category: newCategory },
    ]);
    setNewText("");
  };

  const toggle = (id: string) =>
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, completed: !item.completed, completedAt: !item.completed ? new Date().toISOString() : undefined }
          : item
      )
    );

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const filtered = items.filter((i) =>
    filter === "todo" ? !i.completed : filter === "done" ? i.completed : true
  );

  const doneCount = items.filter((i) => i.completed).length;
  const pct = items.length > 0 ? (doneCount / items.length) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="glass rounded-xl p-4 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background: "#d68d84" }} />
        <div className="pl-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold" style={{ fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", color: "#785b4e" }}>
                Life Bucket List
              </h2>
              <p className="text-xs" style={{ color: "#a2998f" }}>
                {doneCount} of {items.length} completed
              </p>
            </div>
            <p className="text-xl font-bold" style={{ color: pct === 100 && items.length > 0 ? "#8e967d" : "#d68d84" }}>
              {items.length > 0 ? `${Math.round(pct)}%` : "—"}
            </p>
          </div>
          {items.length > 0 && (
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#ebe6dd" }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: pct === 100 ? "#8e967d" : "#d68d84" }} />
            </div>
          )}
        </div>
      </div>

      {/* Add form */}
      <div className="glass rounded-xl p-4 space-y-3">
        <p className="section-label">Add to Bucket List</p>
        <input
          className="dash-input w-full"
          placeholder="Something you want to do before you die..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5 flex-1">
            {CATEGORIES.map((cat) => {
              const c = CATEGORY_COLORS[cat];
              return (
                <button key={cat} onClick={() => setNewCategory(cat)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: newCategory === cat ? c.bg : "#f9f7ef",
                    border: newCategory === cat ? `1px solid ${c.border}` : "1px solid #ebe6dd",
                    color: newCategory === cat ? c.color : "#a2998f",
                  }}>
                  {cat}
                </button>
              );
            })}
          </div>
          <button onClick={add} disabled={!newText.trim()}
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: newText.trim() ? "#785b4e" : "#f9f7ef",
              border: "none",
            }}>
            <Plus size={15} style={{ color: newText.trim() ? "#fff" : "#c5b9ab" }} />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-xl self-start" style={{ background: "#ebe6dd", width: "fit-content" }}>
        {(["all", "todo", "done"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: filter === f ? "#fff" : "transparent",
              color: filter === f ? "#785b4e" : "#a2998f",
              border: filter === f ? "1px solid #cbb8ad" : "1px solid transparent",
              boxShadow: filter === f ? "0 1px 4px rgba(120,91,78,0.1)" : "none",
            }}>
            {f === "all" ? `All (${items.length})` : f === "todo" ? `To Do (${items.length - doneCount})` : `Done (${doneCount})`}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="glass rounded-xl p-8 text-center">
          <p className="text-sm" style={{ color: "#c5b9ab" }}>
            {filter === "done" ? "Nothing checked off yet — go live!" : "Your bucket list is empty. Dream big."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const c = CATEGORY_COLORS[item.category ?? "Other"];
            return (
              <div key={item.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl group transition-all"
                style={{
                  background: item.completed ? "rgba(249,247,239,0.6)" : "#fff",
                  border: `1px solid ${item.completed ? "#f0ebe3" : "#ebe6dd"}`,
                  boxShadow: item.completed ? "none" : "0 1px 4px rgba(120,91,78,0.05)",
                }}>

                {/* Checkbox */}
                <button onClick={() => toggle(item.id)} className="flex-shrink-0 transition-all">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
                    style={{
                      background: item.completed ? "#d68d84" : "#fff",
                      border: item.completed ? "2px solid #d68d84" : "2px solid #cbb8ad",
                    }}>
                    {item.completed && (
                      <svg width="10" height="8" viewBox="0 0 11 9" fill="none">
                        <path d="M1 4L4 7.5L10 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </button>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug"
                    style={{
                      color: item.completed ? "#c5b9ab" : "#785b4e",
                      textDecoration: item.completed ? "line-through" : "none",
                      textDecorationColor: "rgba(197,185,171,0.55)",
                      opacity: item.completed ? 0.75 : 1,
                    }}>
                    {item.text}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.category && (
                      <span className="text-xs px-1.5 py-0.5 rounded-md"
                        style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontSize: "0.65rem" }}>
                        {item.category}
                      </span>
                    )}
                    {item.completed && item.completedAt && (
                      <span className="text-xs" style={{ color: "#c5b9ab", fontSize: "0.65rem" }}>
                        ✓ {format(new Date(item.completedAt), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete */}
                <button onClick={() => remove(item.id)}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "#c5b9ab" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#d68d84")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#c5b9ab")}>
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
