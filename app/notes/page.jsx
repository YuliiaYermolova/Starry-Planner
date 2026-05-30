"use client";
import { useState } from "react";
import { useLocalStorage } from "@/lib/storage";
import { useSubjects, findSubject } from "@/lib/subjects";

export default function NotesPage() {
  const [subjects] = useSubjects();
  const [notes, setNotes] = useLocalStorage("notes", []);
  const [form, setForm] = useState({ subject: "", title: "", body: "", url: "" });
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  const add = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setNotes([{ ...form, id: Date.now(), createdAt: new Date().toISOString() }, ...notes]);
    setForm({ ...form, title: "", body: "", url: "" });
  };
  const remove = (id) => setNotes(notes.filter((n) => n.id !== id));

  const filtered = notes.filter((n) => {
    if (filter !== "all" && n.subject !== filter) return false;
    if (q && !`${n.title} ${n.body}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl md:text-5xl vg-serif vg-heading">📝 Заметки</h1>
        <p className="text-amber-100/70">Конспекты, формулы, ссылки.</p>
      </header>

      <form onSubmit={add} className="vg-card space-y-3">
        <div className="grid gap-3 md:grid-cols-3">
          <select className="vg-input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
            <option value="">— без предмета —</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input className="vg-input md:col-span-2" placeholder="Заголовок" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <textarea
          className="vg-input min-h-[80px]"
          placeholder="Текст заметки, формулы, шаги..."
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          style={{ resize: "vertical" }}
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <input className="vg-input flex-1" placeholder="Ссылка (необязательно)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          <button type="submit" className="vg-btn">+ Сохранить</button>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <input className="vg-input flex-1 min-w-[200px]" placeholder="🔍 Поиск..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="vg-input" style={{ width: "auto" }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Все предметы</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.length === 0 && (
          <div className="vg-card text-center text-sm text-amber-100/60 md:col-span-2">Заметок нет</div>
        )}
        {filtered.map((n) => {
          const s = findSubject(subjects, n.subject);
          return (
            <article key={n.id} className="vg-card">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {s && <span className={`inline-block rounded bg-${s.color}-500 px-2 py-0.5 text-[10px] text-white mb-1`}>{s.name}</span>}
                  <h3 className="vg-serif font-bold text-lg">{n.title}</h3>
                </div>
                <button onClick={() => remove(n.id)} className="text-amber-100/40 hover:text-rose-400 transition">🗑</button>
              </div>
              {n.body && <p className="mt-2 text-sm text-amber-100/80 whitespace-pre-wrap">{n.body}</p>}
              {n.url && (
                <a href={n.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-amber-300 hover:underline break-all">
                  🔗 {n.url}
                </a>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
