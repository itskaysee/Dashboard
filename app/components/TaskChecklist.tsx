"use client";
import { useState } from "react";
import { CheckSquare, Plus, Trash2, Square, X } from "lucide-react";
import { format } from "date-fns";
import type { Task } from "../types";

interface Props {
  tasks: Task[];
  setTasks: (t: Task[] | ((prev: Task[]) => Task[])) => void;
  dateFilter?: string; // YYYY-MM-DD, defaults to today
  label?: string;
}

export default function TaskChecklist({ tasks, setTasks, dateFilter, label }: Props) {
  const [newTask, setNewTask] = useState("");
  const [newProject, setNewProject] = useState("");
  const [showForm, setShowForm] = useState(false);

  const targetDate = dateFilter ?? format(new Date(), "yyyy-MM-dd");
  const dayTasks = tasks.filter((t) => t.date === targetDate);
  const completed = dayTasks.filter((t) => t.completed).length;

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: newTask.trim(),
        completed: false,
        date: targetDate,
        project: newProject.trim() || undefined,
      },
    ]);
    setNewTask("");
    setNewProject("");
    setShowForm(false);
  };

  const toggle = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const remove = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const grouped = dayTasks.reduce<Record<string, Task[]>>((acc, task) => {
    const key = task.project ?? "__none__";
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});

  const pct = dayTasks.length > 0 ? (completed / dayTasks.length) * 100 : 0;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <CheckSquare size={15} className="text-indigo-400" />
          </div>
          <div>
            <p className="section-label">{label ?? "Today's Tasks"}</p>
            <p className="text-xs text-slate-500">
              {completed}/{dayTasks.length} complete
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="w-7 h-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          {showForm ? (
            <X size={14} className="text-slate-400" />
          ) : (
            <Plus size={14} className="text-slate-400" />
          )}
        </button>
      </div>

      {/* Progress */}
      {dayTasks.length > 0 && (
        <div className="mb-4">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct === 100
                  ? "linear-gradient(90deg, #10b981, #34d399)"
                  : "linear-gradient(90deg, #6366f1, #8b5cf6)",
                boxShadow: pct === 100 ? "0 0 8px #10b98166" : "0 0 8px #6366f166",
              }}
            />
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="mb-4 p-3 rounded-xl bg-white/4 border border-white/8 space-y-2 animate-slide-up">
          <input
            className="dash-input"
            placeholder="Task title..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            autoFocus
          />
          <input
            className="dash-input"
            placeholder="Project tag (optional)"
            value={newProject}
            onChange={(e) => setNewProject(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />
          <div className="flex gap-2">
            <button onClick={addTask} className="dash-btn dash-btn-primary flex-1">
              Add Task
            </button>
            <button onClick={() => setShowForm(false)} className="dash-btn dash-btn-ghost">
              Cancel
            </button>
          </div>
        </div>
      )}

      {dayTasks.length === 0 && !showForm && (
        <p className="text-slate-600 text-sm text-center py-3">
          No tasks for today.{" "}
          <button onClick={() => setShowForm(true)} className="text-indigo-400 hover:text-indigo-300">
            Add one
          </button>
        </p>
      )}

      <div className="space-y-4">
        {Object.entries(grouped).map(([project, projectTasks]) => (
          <div key={project}>
            {project !== "__none__" && (
              <p className="section-label mb-2 text-indigo-400/60">{project}</p>
            )}
            <div className="space-y-1.5">
              {projectTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-white/4 group transition-colors"
                >
                  <button
                    onClick={() => toggle(task.id)}
                    className="flex-shrink-0 transition-colors"
                  >
                    {task.completed ? (
                      <CheckSquare size={16} className="text-indigo-400" />
                    ) : (
                      <Square size={16} className="text-slate-600 hover:text-slate-400" />
                    )}
                  </button>
                  <span
                    className="text-sm flex-1"
                    style={{
                      color: task.completed ? "rgba(148,163,184,0.4)" : "#cbd5e1",
                      textDecoration: task.completed ? "line-through" : "none",
                    }}
                  >
                    {task.title}
                  </span>
                  <button
                    onClick={() => remove(task.id)}
                    className="text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
