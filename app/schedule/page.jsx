"use client";
import { useState } from "react";
import Link from "next/link";
import { useLocalStorage } from "@/lib/storage";
import { useSubjects, findSubject } from "@/lib/subjects";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const HOURS = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];

function fmtRu(d) {
  const months = ["янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function schoolYearStatus(sy) {
  if (!sy?.start || !sy?.end) return null;
  const now = new Date();
  const start = new Date(sy.start);
  const end = new Date(sy.end);
  const oneDay = 86400000;
  if (now < start) {
    const days = Math.ceil((start - now) / oneDay);
    return { icon: "🌅", title: "До начала учёбы", value: `${days} дн.`, sub: `${sy.name || "Учебный год"} стартует ${fmtRu(start)}` };
  }
  if (now > end) {
    return { icon: "🎓", title: "Учебный год завершён", value: "—", sub: `Был: ${fmtRu(start)} — ${fmtRu(end)}` };
  }
  const totalDays = Math.round((end - start) / oneDay);
  const passed = Math.round((now - start) / oneDay);
  const left = totalDays - passed;
  const weekNum = Math.floor(passed / 7) + 1;
  const pct = Math.round(passed / totalDays * 100);
  return { icon: "📚", title: `Неделя ${weekNum}`, value: `${left} дн.`, sub: `${sy.name || "Учебный год"} · ${pct}% пройдено`, pct };
}

export default function SchedulePage() {
  const [subjects] = useSubjects();
  const [events, setEvents] = useLocalStorage("schedule", []);
  const [schoolYear] = useLocalStorage("schoolYear", { start: "", end: "", name: "" });
  const [form, setForm] = useState({ day: 0, hour: "08:00", duration: 1, subject: "", note: "" });

  const sy = schoolYearStatus(schoolYear);

  const addEvent = (e) => {
    e.preventDefault();
    if (!form.subject) return;
    setEvents([...events, { ...form, id: Date.now(), day: Number(form.day), duration: Number(form.duration) }]);
  };

  const removeEvent = (id) => setEvents(events.filter((ev) => ev.id !== id));

  if (subjects.length === 0) {
    return (
      <div className="vg-card text-center space-y-3">
        <h1 className="vg-serif vg-heading text-3xl">📅 Расписание</h1>
        <p className="text-amber-100/70">Сначала добавь предметы.</p>
        <Link href="/settings" className="vg-btn inline-flex">К настройкам →</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl md:text-5xl vg-serif vg-heading">📅 Расписание</h1>
        <p className="text-amber-100/70">Сетка на неделю — повторяется каждую неделю учебного года.</p>
      </header>

      {sy && (
        <div className="vg-card flex flex-wrap items-center gap-4">
          <span className="text-3xl">{sy.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300/80">{sy.title}</div>
            <div className="vg-serif text-2xl vg-heading">{sy.value}</div>
            <div className="text-xs text-amber-100/60 mt-0.5">{sy.sub}</div>
          </div>
          {sy.pct !== undefined && (
            <div className="w-full sm:w-48">
              <div className="h-2 rounded-full bg-slate-900/70 overflow-hidden border border-amber-400/15">
                <div className="h-full bg-gradient-to-r from-amber-400 to-rose-500" style={{ width: `${sy.pct}%` }} />
              </div>
              <div className="text-[10px] text-amber-100/50 mt-1 text-right">{sy.pct}% позади</div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={addEvent} className="vg-card grid gap-3 md:grid-cols-6 items-end">
        <label className="text-sm">
          <span className="block mb-1 text-amber-100/60">День</span>
          <select className="vg-input" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
            {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="block mb-1 text-amber-100/60">Время</span>
          <select className="vg-input" value={form.hour} onChange={(e) => setForm({ ...form, hour: e.target.value })}>
            {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="block mb-1 text-amber-100/60">Часов</span>
          <input type="number" min="1" max="6" className="vg-input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
        </label>
        <label className="text-sm">
          <span className="block mb-1 text-amber-100/60">Предмет</span>
          <select className="vg-input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
            <option value="">— выбрать —</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="block mb-1 text-amber-100/60">Заметка</span>
          <input className="vg-input" placeholder="ауд., тема..." value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </label>
        <button type="submit" className="vg-btn">+ Добавить</button>
      </form>

      <div className="vg-card overflow-x-auto">
        <div className="grid gap-1 min-w-[800px]" style={{ gridTemplateColumns: "60px repeat(7, minmax(110px, 1fr))" }}>
          <div></div>
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-amber-100/60 py-2">{d}</div>
          ))}
          {HOURS.map((h) => (
            <RowHour key={h} hour={h} events={events} subjects={subjects} onRemove={removeEvent} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RowHour({ hour, events, subjects, onRemove }) {
  return (
    <>
      <div className="text-xs text-amber-100/60 py-2 pr-2 text-right">{hour}</div>
      {[0, 1, 2, 3, 4, 5, 6].map((d) => {
        const ev = events.find((e) => e.day === d && e.hour === hour);
        if (!ev) return <div key={d} className="h-12 rounded border border-dashed border-amber-400/15" />;
        const s = findSubject(subjects, ev.subject);
        const color = s?.color || "slate";
        return (
          <button
            key={d}
            onClick={() => onRemove(ev.id)}
            className={`group relative h-12 rounded bg-${color}-500 text-white text-xs p-1.5 text-left hover:opacity-80 transition`}
            style={{ gridRow: `span ${ev.duration}` }}
            title="Удалить"
          >
            <div className="font-semibold truncate">{s?.name || "—"}</div>
            {ev.note && <div className="truncate opacity-90">{ev.note}</div>}
          </button>
        );
      })}
    </>
  );
}
