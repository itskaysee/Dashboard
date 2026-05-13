"use client";
import { useState, useRef, useCallback } from "react";
import { CheckSquare, Plus, Trash2, Square, X } from "lucide-react";
import { format, startOfWeek, endOfWeek, parseISO, isWithinInterval } from "date-fns";
import type { Task } from "../types";

interface Props {
  tasks: Task[];
  setTasks: (t: Task[] | ((prev: Task[]) => Task[])) => void;
  label?: string;
  weekStart?: Date;
}

const CONFETTI_COLORS = ["#d68d84", "#8e967d", "#cfbb9f", "#e1ad9d", "#7a816c", "#866a5b", "#f6efdf"];

function useConfetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  interface Particle {
    x: number; y: number; vx: number; vy: number;
    color: string; size: number; angle: number; spin: number; opacity: number;
  }

  const fire = useCallback((rect: DOMRect) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.display = "block";

    // Spawn particles from the click area (roughly left side)
    particlesRef.current = Array.from({ length: 60 }, () => ({
      x: Math.random() * rect.width * 0.5 + rect.width * 0.25,
      y: rect.height * 0.5,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 1.2) * 6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: Math.random() * 6 + 4,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.3,
      opacity: 1,
    }));

    if (animRef.current) cancelAnimationFrame(animRef.current);

    function draw() {
      const ctx = canvas!.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      particlesRef.current = particlesRef.current.filter((p) => p.opacity > 0.02);

      for (const p of particlesRef.current) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.angle += p.spin;
        p.opacity -= 0.018;
      }

      if (particlesRef.current.length > 0) {
        animRef.current = requestAnimationFrame(draw);
      } else {
        canvas!.style.display = "none";
      }
    }

    draw();
  }, []);

  return { canvasRef, fire };
}

export default function TaskChecklist({ tasks, setTasks, label, weekStart: weekStartProp }: Props) {
  const [newTask, setNewTask] = useState("");
  const [newProject, setNewProject] = useState("");
  const [showForm, setShowForm] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { canvasRef, fire } = useConfetti();

  const today = new Date();
  const weekStart = weekStartProp ?? startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekTasks = tasks.filter((t) =>
    isWithinInterval(parseISO(t.date), { start: weekStart, end: weekEnd })
  );
  const completed = weekTasks.filter((t) => t.completed).length;
  const pct = weekTasks.length > 0 ? (completed / weekTasks.length) * 100 : 0;
  const groupedTasks = weekTasks.reduce<Record<string, Task[]>>((acc, task) => {
    const key = task.project ?? "__none__";
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: newTask.trim(),
        completed: false,
        date: format(weekStart, "yyyy-MM-dd"),
        project: newProject.trim() || undefined,
      },
    ]);
    setNewTask("");
    setNewProject("");
    setShowForm(false);
  };

  const playPopThenCheer = () => {
    try {
      const ctx = new AudioContext();

      // --- Pop ---
      const popBuf = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
      const popData = popBuf.getChannelData(0);
      for (let i = 0; i < popData.length; i++) {
        popData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / popData.length, 3);
      }
      const popSrc = ctx.createBufferSource();
      popSrc.buffer = popBuf;
      const popFilter = ctx.createBiquadFilter();
      popFilter.type = "bandpass";
      popFilter.frequency.value = 800;
      popFilter.Q.value = 0.8;
      const popGain = ctx.createGain();
      popGain.gain.setValueAtTime(0.35, ctx.currentTime);
      popSrc.connect(popFilter);
      popFilter.connect(popGain);
      popGain.connect(ctx.destination);
      popSrc.start(ctx.currentTime);

      popSrc.onended = () => ctx.close();
    } catch {}
  };

  const toggle = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    const wasCompleted = task?.completed;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    // Fire confetti + sound only when marking complete (not unchecking)
    if (!wasCompleted && containerRef.current) {
      fire(containerRef.current.getBoundingClientRect());
      playPopThenCheer();
    }
  };

  const remove = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

  return (
    <div ref={containerRef} className="glass rounded-2xl p-5 relative overflow-hidden">
      {/* Confetti canvas — sits over the card */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          pointerEvents: "none", display: "none", zIndex: 20,
        }}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#f6efdf", border: "1px solid #e8dfcf" }}>
            <CheckSquare size={15} style={{ color: "#8e967d" }} />
          </div>
          <div>
            <p className="section-label">{label ?? "This Week's Tasks"}</p>
            <p className="text-xs" style={{ color: "#a2998f" }}>{completed}/{weekTasks.length} complete</p>
          </div>
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: "#f6efdf", border: "1px solid #e8dfcf" }}>
          {showForm ? <X size={14} style={{ color: "#a2998f" }} /> : <Plus size={14} style={{ color: "#a2998f" }} />}
        </button>
      </div>

      {weekTasks.length > 0 && (
        <div className="mb-4">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "#ebe6dd" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: pct === 100 ? "#8e967d" : "#d68d84" }} />
          </div>
        </div>
      )}

      {showForm && (
        <div className="mb-4 p-3 rounded-xl space-y-2 animate-slide-up"
          style={{ background: "#f9f7ef", border: "1px solid #ebe6dd" }}>
          <input className="dash-input" placeholder="Task title..." value={newTask}
            onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} autoFocus />
          <input className="dash-input" placeholder="Project tag (optional)" value={newProject}
            onChange={(e) => setNewProject(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} />
          <div className="flex gap-2">
            <button onClick={addTask} className="dash-btn dash-btn-primary flex-1">Add Task</button>
            <button onClick={() => setShowForm(false)} className="dash-btn dash-btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {weekTasks.length === 0 && !showForm && (
        <p className="text-sm text-center py-3" style={{ color: "#c5b9ab" }}>
          No tasks this week.{" "}
          <button onClick={() => setShowForm(true)} style={{ color: "#8e967d" }} className="hover:opacity-80">Add one</button>
        </p>
      )}

      <div className="space-y-3">
        {Object.entries(groupedTasks).map(([project, projectTasks]) => (
          <div key={project}>
            {project !== "__none__" && (
              <p className="section-label mb-1 ml-2" style={{ color: "#8e967d" }}>{project}</p>
            )}
            <div className="space-y-0.5">
              {projectTasks.map((task) => (
                <div key={task.id}
                  className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg group transition-colors"
                  style={{ background: "transparent" }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#f9f7ef")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <button onClick={() => toggle(task.id)} className="flex-shrink-0 transition-colors">
                    {task.completed
                      ? <CheckSquare size={15} style={{ color: "#8e967d" }} />
                      : <Square size={15} style={{ color: "#e8dfcf" }} />}
                  </button>
                  <span className="text-sm flex-1"
                    style={{ color: task.completed ? "#c5b9ab" : "#785b4e", textDecoration: task.completed ? "line-through" : "none" }}>
                    {task.title}
                  </span>
                  <button onClick={() => remove(task.id)}
                    className="opacity-0 group-hover:opacity-100 transition-all"
                    style={{ color: "#c5b9ab" }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "#d68d84")}
                    onMouseOut={(e) => (e.currentTarget.style.color = "#c5b9ab")}>
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
