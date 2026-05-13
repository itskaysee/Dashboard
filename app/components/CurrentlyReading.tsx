"use client";
import { useState, useRef } from "react";
import { BookOpen, Search, X, Loader, CheckCircle, PauseCircle, BookMarked } from "lucide-react";
import type { CurrentlyReading, BookRead } from "../types";

interface OLDoc {
  title: string;
  author_name?: string[];
  cover_i?: number;
  key: string;
}

interface Props {
  book: CurrentlyReading | null;
  setBook: (b: CurrentlyReading | null) => void;
  onComplete: (book: BookRead) => void;
}

const STATUSES: { id: CurrentlyReading["status"]; label: string; color: string; bg: string; border: string; Icon: React.ElementType }[] = [
  { id: "reading",   label: "Reading",   color: "#8e967d", bg: "rgba(142,150,125,0.1)",  border: "rgba(142,150,125,0.25)", Icon: BookOpen    },
  { id: "paused",    label: "Paused",    color: "#cfbb9f", bg: "rgba(207,187,159,0.12)", border: "rgba(207,187,159,0.35)", Icon: PauseCircle },
  { id: "completed", label: "Completed", color: "#866a5b", bg: "rgba(134,106,91,0.1)",   border: "rgba(134,106,91,0.25)",  Icon: CheckCircle },
];

function currentQKey() {
  const today = new Date();
  const quarter = Math.ceil((today.getMonth() + 1) / 3);
  return `${today.getFullYear()}-Q${quarter}`;
}

export default function CurrentlyReadingWidget({ book, setBook, onComplete }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OLDoc[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleQueryChange(val: string) {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(val)}&limit=6&fields=title,author_name,cover_i,key`
        );
        const data = await res.json();
        setResults(data.docs ?? []);
      } catch { setResults([]); } finally { setSearching(false); }
    }, 500);
  }

  function pickBook(doc: OLDoc) {
    setBook({ title: doc.title, author: doc.author_name?.[0] ?? "Unknown author", coverId: doc.cover_i, openLibraryKey: doc.key, status: "reading" });
    setQuery(""); setResults([]); setShowSearch(false);
  }

  function setStatus(status: CurrentlyReading["status"]) {
    if (!book) return;
    if (status === "completed") {
      onComplete({ id: crypto.randomUUID(), quarterKey: currentQKey(), title: book.title, author: book.author, coverId: book.coverId, completedAt: new Date().toISOString() });
      setBook(null);
    } else {
      setBook({ ...book, status });
    }
  }

  const coverUrl = book?.coverId ? `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg` : null;
  const currentStatus = STATUSES.find((s) => s.id === (book?.status ?? "reading"));

  return (
    <div className="rounded-2xl p-5"
      style={{ background: "white", border: "1px solid #ebe6dd", boxShadow: "0 1px 8px rgba(120,91,78,0.06)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookMarked size={15} style={{ color: "#866a5b" }} />
          <span className="text-sm font-semibold" style={{ color: "#785b4e" }}>Currently Reading</span>
        </div>
        <button onClick={() => setShowSearch((s) => !s)}
          className="text-xs px-3 py-1 rounded-lg transition-all"
          style={{ background: "#f6efdf", color: "#866a5b", border: "1px solid #e8dfcf" }}>
          {showSearch ? "Cancel" : book ? "Change" : "+ Add book"}
        </button>
      </div>

      {showSearch && (
        <div className="mb-4">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#c5b9ab" }} />
            <input autoFocus type="text" value={query} onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search by title or author…"
              className="w-full pl-8 pr-4 py-2 rounded-xl text-sm outline-none"
              style={{ background: "#f9f7ef", border: "1px solid #ebe6dd", color: "#785b4e" }} />
            {searching && <Loader size={13} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin" style={{ color: "#c5b9ab" }} />}
          </div>

          {results.length > 0 && (
            <div className="mt-2 rounded-xl overflow-hidden" style={{ border: "1px solid #ebe6dd", background: "white" }}>
              {results.map((doc) => (
                <button key={doc.key} onClick={() => pickBook(doc)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                  style={{ borderBottom: "1px solid #f5f0ea" }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#f9f7ef")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {doc.cover_i ? (
                    <img src={`https://covers.openlibrary.org/b/id/${doc.cover_i}-S.jpg`} alt=""
                      className="rounded" style={{ width: 28, height: 40, objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div className="rounded flex items-center justify-center"
                      style={{ width: 28, height: 40, background: "#f6efdf", flexShrink: 0 }}>
                      <BookOpen size={12} style={{ color: "#c5b9ab" }} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: "#785b4e" }}>{doc.title}</p>
                    <p className="text-xs truncate" style={{ color: "#a2998f" }}>{doc.author_name?.[0] ?? "Unknown author"}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {book ? (
        <div className="space-y-3">
          <div className="flex gap-4 items-start">
            {coverUrl ? (
              <img src={coverUrl} alt={book.title} className="rounded-lg shadow-sm"
                style={{ width: 64, height: 92, objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div className="rounded-lg flex items-center justify-center"
                style={{ width: 64, height: 92, background: "#f6efdf", flexShrink: 0 }}>
                <BookOpen size={22} style={{ color: "#c5b9ab" }} />
              </div>
            )}
            <div className="flex-1 min-w-0 pt-1">
              <p className="font-semibold text-sm leading-snug mb-1" style={{ color: "#785b4e" }}>{book.title}</p>
              <p className="text-xs mb-2" style={{ color: "#a2998f" }}>{book.author}</p>
              {currentStatus && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: currentStatus.bg, color: currentStatus.color, border: `1px solid ${currentStatus.border}` }}>
                  <currentStatus.Icon size={10} />
                  {currentStatus.label}
                </div>
              )}
            </div>
            <button onClick={() => setBook(null)} className="mt-1 opacity-40 hover:opacity-70 transition-opacity">
              <X size={14} style={{ color: "#785b4e" }} />
            </button>
          </div>

          <div className="flex gap-1.5">
            {STATUSES.map((s) => (
              <button key={s.id} onClick={() => setStatus(s.id)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: book.status === s.id ? s.bg : "#f9f7ef",
                  color: book.status === s.id ? s.color : "#a2998f",
                  border: book.status === s.id ? `1px solid ${s.border}` : "1px solid #ebe6dd",
                }}>
                <s.Icon size={10} />
                {s.label}
              </button>
            ))}
          </div>
          <p className="text-xs" style={{ color: "#c5b9ab" }}>Marking complete will log it to your quarter.</p>
        </div>
      ) : (
        !showSearch && (
          <p className="text-xs text-center py-4" style={{ color: "#c5b9ab" }}>No book added yet</p>
        )
      )}
    </div>
  );
}
