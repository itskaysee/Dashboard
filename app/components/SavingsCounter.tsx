"use client";
import { useState } from "react";
import { TrendingUp, Plus, Edit2, Trash2, X } from "lucide-react";
import type { SavingsAccount } from "../types";

const COLORS = [
  "#10b981",
  "#06b6d4",
  "#8b5cf6",
  "#f59e0b",
  "#ec4899",
  "#6366f1",
];

interface Props {
  accounts: SavingsAccount[];
  setAccounts: (
    a: SavingsAccount[] | ((prev: SavingsAccount[]) => SavingsAccount[])
  ) => void;
}

function EditModal({
  account,
  onSave,
  onClose,
  onDelete,
}: {
  account: SavingsAccount | null;
  onSave: (a: SavingsAccount) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}) {
  const isNew = !account?.id;
  const [form, setForm] = useState({
    name: account?.name ?? "",
    balance: account?.balance ?? 0,
    goal: account?.goal ?? 0,
    color: account?.color ?? COLORS[0],
  });

  const save = () => {
    if (!form.name.trim()) return;
    onSave({ id: account?.id ?? crypto.randomUUID(), ...form });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="glass rounded-2xl p-6 w-full max-w-sm relative z-10 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-slate-100">
            {isNew ? "Add Account" : "Edit Account"}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="section-label block mb-1">Account Name</label>
            <input
              className="dash-input"
              placeholder="e.g. Emergency Fund"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-label block mb-1">Current Balance</label>
              <input
                className="dash-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.balance || ""}
                onChange={(e) =>
                  setForm({ ...form, balance: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="section-label block mb-1">Goal</label>
              <input
                className="dash-input"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={form.goal || ""}
                onChange={(e) =>
                  setForm({ ...form, goal: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          </div>
          <div>
            <label className="section-label block mb-2">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className="w-6 h-6 rounded-full transition-transform"
                  style={{
                    background: c,
                    transform: form.color === c ? "scale(1.3)" : "scale(1)",
                    outline: form.color === c ? `2px solid ${c}` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={save} className="dash-btn dash-btn-primary flex-1">
            Save
          </button>
          {!isNew && onDelete && (
            <button
              onClick={() => { onDelete(account!.id); onClose(); }}
              className="dash-btn dash-btn-ghost"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SavingsCounter({ accounts, setAccounts }: Props) {
  const [editing, setEditing] = useState<SavingsAccount | null | "new">(null);

  const totalSavings = accounts.reduce((s, a) => s + a.balance, 0);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const handleSave = (account: SavingsAccount) => {
    setAccounts((prev) => {
      const exists = prev.find((a) => a.id === account.id);
      return exists
        ? prev.map((a) => (a.id === account.id ? account : a))
        : [...prev, account];
    });
  };

  const handleDelete = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <>
      {editing && (
        <EditModal
          account={editing === "new" ? null : editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
          onDelete={editing !== "new" ? handleDelete : undefined}
        />
      )}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <TrendingUp size={15} className="text-emerald-400" />
            </div>
            <div>
              <p className="section-label">Savings</p>
              <p className="gradient-text-green text-lg font-bold leading-none mt-0.5">
                {fmt(totalSavings)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setEditing("new")}
            className="w-7 h-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <Plus size={14} className="text-slate-400" />
          </button>
        </div>

        {accounts.length === 0 && (
          <p className="text-slate-600 text-sm text-center py-4">
            No accounts yet.{" "}
            <button
              onClick={() => setEditing("new")}
              className="text-emerald-400 hover:text-emerald-300"
            >
              Add one
            </button>
          </p>
        )}

        <div className="space-y-3">
          {accounts.map((acct) => {
            const pct =
              acct.goal > 0
                ? Math.min((acct.balance / acct.goal) * 100, 100)
                : 0;
            return (
              <div
                key={acct.id}
                className="glass rounded-xl p-3.5 glass-hover cursor-pointer group"
                onClick={() => setEditing(acct)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: acct.color }} />
                    <span className="text-sm font-medium text-slate-200">{acct.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold" style={{ color: acct.color }}>
                      {fmt(acct.balance)}
                    </span>
                    <Edit2 size={12} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                {acct.goal > 0 && (
                  <>
                    <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${acct.color}aa, ${acct.color})`,
                          boxShadow: `0 0 8px ${acct.color}66`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-xs text-slate-600">{pct.toFixed(0)}% of goal</span>
                      <span className="text-xs text-slate-600">{fmt(acct.goal)}</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
