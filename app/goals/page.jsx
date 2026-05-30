"use client";
import { useState } from "react";
import { useLocalStorage } from "@/lib/storage";
import { useSubjects, findSubject } from "@/lib/subjects";

export default function GoalsPage() {
  const [subjects] = useSubjects();
  const [goals, setGoals] = useLocalStorage("goals", []);
  const [form, setForm] = useState({ title: "", subject: "", deadline: "", description: "" });
  const [editingId, setEditingId] = useState(null);

  const add = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setGoals([{ ...form, id: Date.now(), progress: 0, steps: [] }, ...goals]);
    setForm({ title: "", subject: "", deadline: "", description: "" });
  };

  const remove = (id) => setGoals(goals.filter((g) => g.id !== id));
  const update = (id, patch) => setGoals(goals.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  const addStep = (id, text) => {
    if (!text.trim()) return;
    const g = goals.find((x) => x.id === id);
    const steps = [...(g.steps || []), { id: Date.now(), text: text.trim(), done: false }];
    update(id, { steps, progress: calcProgress(steps) });
  };
  const toggleStep = (id, stepId) => {
    const g = goals.find((x) => x.id === id);
    const steps = g.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s));
    update(id, { steps, progress: calcProgress(steps) });
  };
  const removeStep = (id, stepId) => {
    const g = goals.find((x) => x.id === id);
    const steps = g.steps.filter((s) => s.id !== stepId);
    update(id, { steps, progress: calcProgress(steps) });
  };

  const totalAvg = goals.length ? Math.round(goals.reduce((a, g) => a + (g.progress || 0), 0) / goals.length) : 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl md:text-5xl vg-serif vg-heading">🎯 Цели</h1>
        <p className="text-amber-100/70">Долгосрочные цели с дедлайнами и подзадачами. Прогресс считается автоматически.</p>
      </header>

      <div className="vg-card">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium">Средний прогресс</span>
          <span className="text-amber-100/60">{totalAvg}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-900/70 border border-amber-400/15">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 transition-all" style={{ width: `${totalAvg}%`, boxShadow: "0 0 12px rgba(251,191,36,0.6)" }} />
        </div>
      </div>

      <form onSubmit={add} className="vg-card grid gap-3 md:grid-cols-6">
        <input className="vg-input md:col-span-2" placeholder="Название цели" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <select className="vg-input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
          <option value="">— без предмета —</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input className="vg-input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        <input className="vg-input" placeholder="Описание" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button type="submit" className="vg-btn">+ Добавить</button>
      </form>

      {goals.length === 0 ? (
        <div className="vg-card text-center text-sm text-amber-100/60">
          Целей пока нет. Добавь первую цель выше.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              subjects={subjects}
              editing={editingId === g.id}
              onStartEdit={() => setEditingId(g.id)}
              onStopEdit={() => setEditingId(null)}
              onUpdate={(patch) => update(g.id, patch)}
              onRemove={() => remove(g.id)}
              onAddStep={(text) => addStep(g.id, text)}
              onToggleStep={(sid) => toggleStep(g.id, sid)}
              onRemoveStep={(sid) => removeStep(g.id, sid)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function calcProgress(steps) {
  if (!steps || steps.length === 0) return 0;
  return Math.round((steps.filter((s) => s.done).length / steps.length) * 100);
}

function GoalCard({ goal, subjects, editing, onStartEdit, onStopEdit, onUpdate, onRemove, onAddStep, onToggleStep, onRemoveStep }) {
  const [stepText, setStepText] = useState("");
  const [draft, setDraft] = useState({
    title: goal.title,
    subject: goal.subject || "",
    deadline: goal.deadline || "",
    description: goal.description || "",
  });
  const s = findSubject(subjects, goal.subject);
  const overdue = goal.deadline && new Date(goal.deadline) < new Date(new Date().toDateString()) && (goal.progress || 0) < 100;
  const manualProgress = !goal.steps || goal.steps.length === 0;

  const saveEdit = () => { onUpdate({ ...draft }); onStopEdit(); };

  return (
    <div className="vg-card space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="space-y-2">
              <input className="vg-input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              <div className="grid gap-2 grid-cols-2">
                <select className="vg-input" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })}>
                  <option value="">— без предмета —</option>
                  {subjects.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
                <input className="vg-input" type="date" value={draft.deadline} onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} />
              </div>
              <input className="vg-input" placeholder="Описание" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </div>
          ) : (
            <>
              {s && <span className={`inline-block rounded bg-${s.color}-500 px-2 py-0.5 text-[10px] text-white mb-1`}>{s.name}</span>}
              <h3 className="vg-serif font-bold text-lg">{goal.title}</h3>
              {goal.description && <p className="text-sm text-amber-100/70 mt-0.5">{goal.description}</p>}
              {goal.deadline && (
                <p className={`text-xs mt-1 ${overdue ? "text-rose-400 font-semibold" : "text-amber-100/60"}`}>
                  📅 до {goal.deadline}{overdue && " (просрочено)"}
                </p>
              )}
            </>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          {editing ? (
            <>
              <button onClick={saveEdit} className="vg-chip active">✓</button>
              <button onClick={onStopEdit} className="vg-chip">✗</button>
            </>
          ) : (
            <>
              <button onClick={onStartEdit} className="text-amber-100/40 hover:text-amber-300 transition p-1">✎</button>
              <button onClick={onRemove} className="text-amber-100/40 hover:text-rose-400 transition p-1">🗑</button>
            </>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-amber-100/60">Прогресс</span>
          <span className="text-amber-100/60">{goal.progress || 0}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900/70 border border-amber-400/10">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all" style={{ width: `${goal.progress || 0}%` }} />
        </div>
        {manualProgress && (
          <input
            type="range" min="0" max="100"
            value={goal.progress || 0}
            onChange={(e) => onUpdate({ progress: Number(e.target.value) })}
            className="w-full mt-2 accent-amber-400"
          />
        )}
      </div>

      <div>
        <div className="text-xs text-amber-100/60 mb-1">
          Подзадачи {goal.steps?.length ? `(${goal.steps.filter((s) => s.done).length}/${goal.steps.length})` : ""}
        </div>
        <ul className="space-y-1.5">
          {(goal.steps || []).map((st) => (
            <li key={st.id} className="flex items-center gap-2 text-sm group">
              <input type="checkbox" checked={st.done} onChange={() => onToggleStep(st.id)} className="h-4 w-4 rounded accent-amber-400" />
              <span className={`flex-1 ${st.done ? "line-through text-amber-100/40" : ""}`}>{st.text}</span>
              <button onClick={() => onRemoveStep(st.id)} className="text-amber-100/30 hover:text-rose-400 transition">🗑</button>
            </li>
          ))}
        </ul>
        <form onSubmit={(e) => { e.preventDefault(); onAddStep(stepText); setStepText(""); }} className="flex gap-2 mt-2">
          <input className="vg-input" placeholder="Добавить шаг..." value={stepText} onChange={(e) => setStepText(e.target.value)} />
          <button type="submit" className="vg-btn">+</button>
        </form>
      </div>
    </div>
  );
}
