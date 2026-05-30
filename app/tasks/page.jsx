"use client";
import { useState } from "react";
import Link from "next/link";
import { useLocalStorage } from "@/lib/storage";
import { useSubjects, findSubject } from "@/lib/subjects";

export default function TasksPage() {
  const [subjects] = useSubjects();
  const [tasks, setTasks] = useLocalStorage("tasks", []);
  const [form, setForm] = useState({ title: "", subject: "", due: "", type: "homework" });
  const [filter, setFilter] = useState("all");

  const add = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setTasks([{ ...form, id: Date.now(), done: false }, ...tasks]);
    setForm({ ...form, title: "", due: "" });
  };

  const toggle = (id) => setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id) => setTasks(tasks.filter((t) => t.id !== id));

  const filtered = tasks.filter((t) => {
    if (filter === "open") return !t.done;
    if (filter === "done") return t.done;
    if (filter === "exam") return t.type === "exam";
    if (subjects.find((s) => s.id === filter)) return t.subject === filter;
    return true;
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl md:text-5xl vg-serif vg-heading">✅ Задачи</h1>
        <p className="text-amber-100/70">Домашка, дедлайны, экзамены, проекты.</p>
      </header>

      {subjects.length === 0 && (
        <div className="vg-card text-sm text-amber-100/70">
          Чтобы привязать задачу к предмету — <Link href="/settings" className="text-amber-300 underline">добавь предметы</Link>.
        </div>
      )}

      <form onSubmit={add} className="vg-card grid gap-3 md:grid-cols-6">
        <input className="vg-input md:col-span-2" placeholder="Что сделать?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <select className="vg-input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
          <option value="">— без предмета —</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="vg-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="homework">Домашка</option>
          <option value="project">Проект</option>
          <option value="exam">Экзамен</option>
          <option value="read">Чтение</option>
        </select>
        <input className="vg-input" type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} />
        <button type="submit" className="vg-btn">+ Добавить</button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <FilterBtn current={filter} value="all"  set={setFilter}>Все</FilterBtn>
        <FilterBtn current={filter} value="open" set={setFilter}>Открытые</FilterBtn>
        <FilterBtn current={filter} value="done" set={setFilter}>Готово</FilterBtn>
        <FilterBtn current={filter} value="exam" set={setFilter}>Экзамены</FilterBtn>
        <div className="w-full sm:w-auto" />
        {subjects.map((s) => (
          <FilterBtn key={s.id} current={filter} value={s.id} set={setFilter}>
            <span className={`h-2 w-2 rounded-full bg-${s.color}-500 mr-1.5 inline-block`} />
            {s.name}
          </FilterBtn>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="vg-card text-center text-sm text-amber-100/60">Нет задач в этом фильтре</div>
        )}
        {filtered.map((t) => {
          const s = findSubject(subjects, t.subject);
          const overdue = t.due && !t.done && new Date(t.due) < new Date(new Date().toDateString());
          return (
            <div key={t.id} className="vg-card flex items-center gap-3">
              <button
                onClick={() => toggle(t.id)}
                className={`h-6 w-6 shrink-0 rounded-md border-2 flex items-center justify-center transition ${
                  t.done ? "bg-amber-400 border-amber-400 text-slate-900" : "border-amber-400/50 hover:border-amber-400"
                }`}
              >
                {t.done && "✓"}
              </button>
              <div className="min-w-0 flex-1">
                <div className={`font-medium ${t.done ? "line-through text-amber-100/40" : "text-amber-50"}`}>
                  {t.title}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-amber-100/60">
                  {s && <span className={`inline-flex items-center gap-1 rounded bg-${s.color}-500 px-2 py-0.5 text-white`}>{s.name}</span>}
                  <span className="rounded bg-slate-900/60 border border-amber-400/20 px-2 py-0.5">{t.type}</span>
                  {t.due && <span className={overdue ? "text-rose-400 font-semibold" : ""}>📅 {t.due}{overdue && " (просрочено)"}</span>}
                </div>
              </div>
              <button onClick={() => remove(t.id)} className="p-2 text-amber-100/40 hover:text-rose-400 transition">🗑</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterBtn({ current, value, set, children }) {
  const active = current === value;
  return (
    <button onClick={() => set(value)} className={`vg-chip ${active ? "active" : ""}`}>
      {children}
    </button>
  );
}
