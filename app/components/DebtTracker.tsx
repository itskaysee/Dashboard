"use client";
import { useState } from "react";
import { CreditCard as CardIcon, Plus, Edit2, Trash2, X } from "lucide-react";
import type { CreditCard } from "../types";

// Earthwoven palette swatches for card colors
const COLORS = ["#d68d84", "#e1ad9d", "#8e967d", "#7a816c", "#866a5b", "#cfbb9f"];

interface Props {
  cards: CreditCard[];
  setCards: (cards: CreditCard[] | ((c: CreditCard[]) => CreditCard[])) => void;
}

function ProgressBar({ paid, total, color }: { paid: number; total: number; color: string }) {
  const pct = total > 0 ? Math.min((paid / total) * 100, 100) : 0;
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#ebe6dd" }}>
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function EditModal({ card, onSave, onClose, onDelete }: {
  card: CreditCard | null;
  onSave: (c: CreditCard) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}) {
  const isNew = !card?.id;
  const [form, setForm] = useState<Omit<CreditCard, "id">>({
    name: card?.name ?? "",
    balance: card?.balance ?? 0,
    originalBalance: card?.originalBalance ?? 0,
    limit: card?.limit ?? 0,
    color: card?.color ?? COLORS[0],
  });

  const save = () => {
    if (!form.name.trim()) return;
    onSave({ id: card?.id ?? crypto.randomUUID(), ...form, originalBalance: form.originalBalance > 0 ? form.originalBalance : form.balance });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: "rgba(249,247,239,0.85)" }} onClick={onClose} />
      <div className="rounded-2xl p-6 w-full max-w-sm relative z-10 animate-slide-up"
        style={{ background: "#fff", border: "1px solid #ebe6dd", boxShadow: "0 8px 40px rgba(120,91,78,0.12)" }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold" style={{ color: "#785b4e", fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>
            {isNew ? "Add Credit Card" : "Edit Card"}
          </h3>
          <button onClick={onClose} style={{ color: "#c5b9ab" }}><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="section-label block mb-1">Card Name</label>
            <input className="dash-input" placeholder="e.g. Chase Sapphire" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-label block mb-1">Current Balance</label>
              <input className="dash-input" type="number" min="0" step="0.01" placeholder="0.00"
                value={form.balance || ""} onChange={(e) => setForm({ ...form, balance: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="section-label block mb-1">Original Balance</label>
              <input className="dash-input" type="number" min="0" step="0.01" placeholder="0.00"
                value={form.originalBalance || ""} onChange={(e) => setForm({ ...form, originalBalance: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div>
            <label className="section-label block mb-1">Credit Limit</label>
            <input className="dash-input" type="number" min="0" step="1" placeholder="0"
              value={form.limit || ""} onChange={(e) => setForm({ ...form, limit: parseFloat(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="section-label block mb-2">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setForm({ ...form, color: c })}
                  className="w-6 h-6 rounded-full transition-transform"
                  style={{ background: c, transform: form.color === c ? "scale(1.3)" : "scale(1)", outline: form.color === c ? `2px solid ${c}` : "none", outlineOffset: "2px" }} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={save} className="dash-btn dash-btn-primary flex-1">Save</button>
          {!isNew && onDelete && (
            <button onClick={() => { onDelete(card!.id); onClose(); }} className="dash-btn dash-btn-ghost"><Trash2 size={14} /></button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DebtTracker({ cards, setCards }: Props) {
  const [editing, setEditing] = useState<CreditCard | null | "new">(null);

  const totalDebt = cards.reduce((s, c) => s + c.balance, 0);
  const totalOriginal = cards.reduce((s, c) => s + c.originalBalance, 0);
  const totalPaid = totalOriginal - totalDebt;

  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const handleSave = (card: CreditCard) => {
    setCards((prev) => {
      const exists = prev.find((c) => c.id === card.id);
      return exists ? prev.map((c) => (c.id === card.id ? card : c)) : [...prev, card];
    });
  };
  const handleDelete = (id: string) => setCards((prev) => prev.filter((c) => c.id !== id));

  return (
    <>
      {editing && (
        <EditModal card={editing === "new" ? null : editing} onSave={handleSave} onClose={() => setEditing(null)}
          onDelete={editing !== "new" ? handleDelete : undefined} />
      )}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#f6efdf", border: "1px solid #e8dfcf" }}>
              <CardIcon size={15} style={{ color: "#d68d84" }} />
            </div>
            <div>
              <p className="section-label">Debt Tracker</p>
              <p className="text-xs mt-0.5" style={{ color: "#a2998f" }}>
                {fmt(totalPaid)} paid · {fmt(totalDebt)} remaining
              </p>
            </div>
          </div>
          <button onClick={() => setEditing("new")}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "#f9f7ef", border: "1px solid #ebe6dd" }}>
            <Plus size={14} style={{ color: "#a2998f" }} />
          </button>
        </div>

        {cards.length === 0 && (
          <p className="text-sm text-center py-4" style={{ color: "#c5b9ab" }}>
            No cards added.{" "}
            <button onClick={() => setEditing("new")} style={{ color: "#d68d84" }} className="hover:opacity-80">Add one</button>
          </p>
        )}

        <div className="space-y-3">
          {cards.map((card) => {
            const paid = card.originalBalance - card.balance;
            const paidPct = card.originalBalance > 0 ? ((paid / card.originalBalance) * 100).toFixed(0) : "0";
            return (
              <div key={card.id}
                className="rounded-xl p-3.5 glass-hover cursor-pointer group transition-all"
                style={{ background: "#f9f7ef", border: "1px solid #ebe6dd" }}
                onClick={() => setEditing(card)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: card.color }} />
                    <span className="text-sm font-medium" style={{ color: "#785b4e" }}>{card.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold" style={{ color: card.color }}>{fmt(card.balance)}</span>
                    <Edit2 size={12} style={{ color: "#c5b9ab" }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <ProgressBar paid={paid} total={card.originalBalance} color={card.color} />
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs" style={{ color: "#c5b9ab" }}>{paidPct}% paid off</span>
                  <span className="text-xs" style={{ color: "#c5b9ab" }}>of {fmt(card.originalBalance)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {cards.length > 1 && (
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid #ebe6dd" }}>
            <div className="flex justify-between text-xs">
              <span style={{ color: "#a2998f" }}>Total debt</span>
              <span className="font-semibold" style={{ color: "#d68d84" }}>{fmt(totalDebt)}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
