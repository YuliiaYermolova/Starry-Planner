"use client";
import { useState } from "react";
import Link from "next/link";
import { useLocalStorage } from "@/lib/storage";
import { useSubjects, findSubject } from "@/lib/subjects";
import { QUOTES, HOME_SUBTITLES } from "@/lib/quotes";
import BackupNudge from "@/components/BackupNudge";

function greet(name) {
  const h = new Date().getHours();
  const who = name || "друг";
  if (h < 5)  return `Тихой ночи 🌙, ${who}`;
  if (h < 12) return `Доброе утро ☀️, ${who}`;
  if (h < 17) return `Добрый день ✨, ${who}`;
  if (h < 22) return `Добрый вечер 🌌, ${who}`;
  return `Поздний вечер 🌠, ${who}`;
}

function todayQuoteIndex(len) {
  return Math.floor(Date.now() / 86400000) % Math.max(len, 1);
}

export default function Dashboard() {
  const [subjects] = useSubjects();
  const [tasks] = useLocalStorage("tasks", []);
  const [goals] = useLocalStorage("goals", []);
  const [profile] = useLocalStorage("profile", { name: "", school: "" });
  const [userQuotes] = useLocalStorage("userQuotes", []);
  const [favQuotes, setFavQuotes] = useLocalStorage("favQuotes", []);
  const [randomIdx, setRandomIdx] = useState(null);

  const allQuotes = [...QUOTES, ...userQuotes];
  const idx = randomIdx ?? todayQuoteIndex(allQuotes.length);
  const q = allQuotes[idx] || { text: "Загрузка...", author: "" };
  const isFav = favQuotes.some((f) => f.text === q.text);

  const openTasks = tasks.filter((t) => !t.done);
  const upcoming = [...openTasks]
    .filter((t) => t.due)
    .sort((a, b) => new Date(a.due) - new Date(b.due))
    .slice(0, 5);

  const goalsAvg = goals.length
    ? Math.round(goals.reduce((acc, g) => acc + (g.progress || 0), 0) / goals.length)
    : 0;

  const sub = HOME_SUBTITLES[Math.floor(Date.now() / 86400000) % HOME_SUBTITLES.length];

  const toggleFav = () => {
    const ex = favQuotes.findIndex((f) => f.text === q.text);
    if (ex >= 0) setFavQuotes(favQuotes.filter((_, i) => i !== ex));
    else setFavQuotes([...favQuotes, q]);
  };

  const newQuote = () => {
    let next;
    do { next = Math.floor(Math.random() * allQuotes.length); }
    while (next === idx && allQuotes.length > 1);
    setRandomIdx(next);
  };

  return (
    <div className="space-y-6">
      <header className="mb-2">
        <h1 className="text-4xl md:text-5xl vg-serif vg-heading">{greet(profile.name)}</h1>
        <p className="vg-serif italic text-lg mt-2 text-amber-100/80">{sub}</p>
        {profile.school && (
          <p className="text-amber-100/40 text-[11px] mt-2 tracking-[0.2em] uppercase">{profile.school}</p>
        )}
      </header>

      <BackupNudge />

      <section className="vg-quote">
        <p className="vg-quote-text">{q.text}</p>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="vg-quote-author">— {q.author}</p>
          <div className="flex gap-2">
            <button onClick={toggleFav} className={`vg-chip ${isFav ? "active" : ""}`}>
              {isFav ? "★ В избранном" : "☆ В избранное"}
            </button>
            <button onClick={newQuote} className="vg-chip">🔄 Другая</button>
            <Link href="/inspire" className="vg-chip">✨ Все цитаты</Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Открытых задач" value={openTasks.length} icon="✅" href="/tasks" />
        <StatCard label="Предметов"     value={subjects.length}   icon="🎓" href="/settings" />
        <StatCard label="Прогресс целей" value={`${goalsAvg}%`}   icon="🎯" href="/goals" />
        <StatCard label="Ближайший дедлайн" value={upcoming[0]?.due || "—"} icon="📅" href="/tasks" small />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="vg-card">
          <h2 className="mb-3 vg-serif text-xl font-bold text-amber-200">📌 Ближайшие задачи</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-amber-100/60">
              Пока пусто. <Link href="/tasks" className="text-amber-300 underline">Добавить →</Link>
            </p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((t) => {
                const s = findSubject(subjects, t.subject);
                return (
                  <li key={t.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-900/50 border border-amber-400/15 p-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {s && <span className={`h-2 w-2 rounded-full bg-${s.color}-500`} />}
                      <span className="truncate text-sm font-medium">{t.title}</span>
                    </div>
                    <span className="text-xs text-amber-100/60 whitespace-nowrap">{t.due}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="vg-card">
          <h2 className="mb-3 vg-serif text-xl font-bold text-amber-200">🎓 Мои предметы</h2>
          {subjects.length === 0 ? (
            <p className="text-sm text-amber-100/60">
              Пока нет. <Link href="/settings" className="text-amber-300 underline">Добавить →</Link>
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <span key={s.id} className={`vg-pill bg-${s.color}-500`}>
                  {s.name}
                  {s.level && <span className="opacity-70">· {s.level}</span>}
                </span>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="vg-card">
        <h2 className="mb-3 vg-serif text-xl font-bold text-amber-200">🎯 Активные цели</h2>
        {goals.length === 0 ? (
          <p className="text-sm text-amber-100/60">
            Целей пока нет. <Link href="/goals" className="text-amber-300 underline">Создать цель →</Link>
          </p>
        ) : (
          <ul className="grid gap-2 md:grid-cols-2">
            {goals.slice(0, 4).map((g) => {
              const s = findSubject(subjects, g.subject);
              return (
                <li key={g.id} className="rounded-lg bg-slate-900/50 border border-amber-400/15 p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      {s && <span className={`h-2 w-2 rounded-full bg-${s.color}-500`} />}
                      <span className="truncate text-sm font-medium">{g.title}</span>
                    </div>
                    <span className="text-xs text-amber-100/60">{g.progress || 0}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-900/70 border border-amber-400/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${g.progress || 0}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="vg-card">
        <h2 className="mb-3 vg-serif text-xl font-bold text-amber-200">🚀 Быстрая навигация</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <NavCard href="/schedule" icon="📅" title="Расписание" />
          <NavCard href="/tasks"    icon="✅" title="Задачи" />
          <NavCard href="/goals"    icon="🎯" title="Цели" />
          <NavCard href="/notes"    icon="📝" title="Заметки" />
          <NavCard href="/inspire"  icon="✨" title="Вдохновение" />
          <NavCard href="/focus"    icon="⏱" title="Фокус" />
          <NavCard href="/settings" icon="⚙️" title="Настройки" />
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon, href, small }) {
  return (
    <Link href={href} className="block vg-card hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.15em] text-amber-300/80">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className={`mt-2 vg-serif font-black vg-heading ${small ? "text-lg" : "text-3xl"}`}>
        {value}
      </div>
    </Link>
  );
}

function NavCard({ href, icon, title }) {
  return (
    <Link href={href} className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-slate-900/40 p-3 hover:border-amber-400/60 hover:bg-slate-900/70 transition">
      <span className="text-xl">{icon}</span>
      <div className="font-semibold text-sm">{title}</div>
    </Link>
  );
}
