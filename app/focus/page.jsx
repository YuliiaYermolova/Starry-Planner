"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocalStorage } from "@/lib/storage";
import { useSubjects, findSubject } from "@/lib/subjects";

const DURATIONS = { work: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 };
const MODE_LABEL = { work: "Фокус", shortBreak: "Короткий перерыв", longBreak: "Длинный перерыв" };
const R = 130;
const C = 2 * Math.PI * R;

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.15, 0.3].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 660 + i * 110;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.18);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.2);
    });
  } catch {}
}

export default function FocusPage() {
  const [subjects] = useSubjects();
  const [sessions, setSessions] = useLocalStorage("focus", []);
  const [mode, setMode] = useState("work");
  const [remaining, setRemaining] = useState(DURATIONS.work);
  const [running, setRunning] = useState(false);
  const [subject, setSubject] = useState("");
  const [cycle, setCycle] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!subject && subjects.length > 0) setSubject(subjects[0].id);
  }, [subjects, subject]);

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  useEffect(() => {
    if (remaining === 0 && running) {
      complete();
    }
    // Title update
    const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
    const ss = String(remaining % 60).padStart(2, "0");
    document.title = running ? `${mm}:${ss} — ${MODE_LABEL[mode]} | Starry Planner` : "Starry Planner";
  }, [remaining, running, mode]);

  function complete() {
    clearInterval(intervalRef.current);
    setRunning(false);
    beep();

    if (mode === "work") {
      const now = new Date();
      setSessions([...sessions, {
        subject,
        minutes: Math.round(DURATIONS.work / 60),
        mode: "work",
        date: now.toISOString().slice(0, 10),
        time: now.toTimeString().slice(0, 5),
      }]);
      const nextCycle = cycle + 1;
      if (nextCycle >= 4) {
        setCycle(0);
        setMode("longBreak");
        setRemaining(DURATIONS.longBreak);
      } else {
        setCycle(nextCycle);
        setMode("shortBreak");
        setRemaining(DURATIONS.shortBreak);
      }
    } else {
      setMode("work");
      setRemaining(DURATIONS.work);
    }

    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(mode === "work" ? "Помидор готов! ☕ Отдохни" : "Перерыв окончен! Время фокуса 🎯");
    }
  }

  const toggleRun = () => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
    setRunning((r) => !r);
  };

  const reset = () => {
    setRunning(false);
    setRemaining(DURATIONS[mode]);
  };

  const skip = () => { setRemaining(0); };

  const total = DURATIONS[mode];
  const pct = remaining / total;
  const offset = C * (1 - pct);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const isBreak = mode !== "work";

  // Сегодня
  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = sessions.filter((s) => s.date === today);
  const totalMinToday = todaySessions.reduce((sum, s) => sum + s.minutes, 0);
  const bySubject = {};
  todaySessions.forEach((s) => { bySubject[s.subject] = (bySubject[s.subject] || 0) + s.minutes; });
  const maxMin = Math.max(...Object.values(bySubject), 1);

  return (
    <div className="space-y-6">
      <header className="text-center">
        <h1 className="text-4xl md:text-5xl vg-serif vg-heading">⏱ Фокус</h1>
        <p className="text-amber-100/70 mt-2 vg-serif italic">«Чтобы добиться большого, надо начать с малого». — Цицерон</p>
      </header>

      <div className="vg-card">
        <div className="vg-timer-wrap">
          <svg className="vg-timer-ring" width="280" height="280" viewBox="0 0 280 280">
            <defs>
              <linearGradient id="vgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <linearGradient id="vgGradientBreak" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#86efac" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
            <circle className="vg-timer-track" cx="140" cy="140" r={R} />
            <circle
              className={`vg-timer-progress ${isBreak ? "break" : ""}`}
              cx="140" cy="140" r={R}
              strokeDasharray={C}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="vg-timer-center">
            <div className="vg-timer-time">{mm}:{ss}</div>
            <div className="vg-timer-mode">{MODE_LABEL[mode]}</div>
            <div className="flex gap-1.5 mt-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`vg-pomodoro-dot ${i < cycle ? "done" : ""}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button onClick={toggleRun} className="vg-btn text-base px-6" disabled={!subject && subjects.length > 0}>
            {running ? "⏸ Пауза" : "▶ Старт"}
          </button>
          <button onClick={reset} className="vg-chip">↻ Сброс</button>
          <button onClick={skip} className="vg-chip">⏭ Дальше</button>
        </div>

        {subjects.length === 0 ? (
          <p className="mt-6 text-center text-sm text-amber-100/60">
            Добавь предметы в <Link href="/settings" className="text-amber-300 underline">настройках</Link>, чтобы выбирать, на чём фокусируешься.
          </p>
        ) : (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-amber-100/60 mr-2">Предмет:</span>
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => setSubject(s.id)}
                className={`vg-chip ${subject === s.id ? "active" : ""}`}
              >
                <span className={`h-2 w-2 rounded-full bg-${s.color}-500 mr-1.5`} />
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="vg-card">
          <h2 className="vg-serif text-xl font-bold text-amber-200 mb-3">🔥 Сегодня</h2>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="vg-serif text-4xl vg-heading">{todaySessions.filter((s) => s.mode === "work").length}</span>
            <span className="text-amber-100/60 text-sm">помидоров · {totalMinToday} мин фокуса</span>
          </div>
          {Object.keys(bySubject).length === 0 ? (
            <p className="text-sm text-amber-100/60">Пока ни одной сессии сегодня.</p>
          ) : (
            <div className="space-y-1.5">
              {Object.entries(bySubject).sort((a, b) => b[1] - a[1]).map(([sid, min]) => {
                const s = findSubject(subjects, sid);
                const p = Math.round((min / maxMin) * 100);
                return (
                  <div key={sid}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full bg-${s?.color || "slate"}-500`} />
                        {s?.name || sid}
                      </span>
                      <span className="text-amber-100/60">{min} мин</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-900/60 overflow-hidden">
                      <div className={`h-full rounded-full bg-${s?.color || "slate"}-500`} style={{ width: `${p}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="vg-card">
          <h2 className="vg-serif text-xl font-bold text-amber-200 mb-3">📜 История сессий</h2>
          {sessions.length === 0 ? (
            <p className="text-sm text-amber-100/60">История пуста.</p>
          ) : (
            <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {[...sessions].reverse().slice(0, 20).map((s, i) => {
                const sub = findSubject(subjects, s.subject);
                return (
                  <li key={i} className="flex items-center justify-between gap-2 text-xs rounded bg-slate-900/40 border border-amber-400/15 px-3 py-2">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className={`h-2 w-2 rounded-full bg-${sub?.color || "slate"}-500 shrink-0`} />
                      <span className="font-medium truncate">{sub?.name || s.subject}</span>
                      <span className="text-amber-100/50 shrink-0">· {s.minutes} мин</span>
                    </span>
                    <span className="text-amber-100/40 shrink-0">{s.date} {s.time || ""}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
