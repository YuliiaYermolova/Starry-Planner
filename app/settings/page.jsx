"use client";
import { useRef, useState } from "react";
import { useLocalStorage, exportAll, importAll, STORAGE_KEYS } from "@/lib/storage";
import { useSubjects, COLOR_PALETTE, newSubjectId } from "@/lib/subjects";
import { THEMES } from "@/components/ThemeApplier";

export default function SettingsPage() {
  const [subjects, setSubjects] = useSubjects();
  const [profile, setProfile] = useLocalStorage("profile", { name: "", school: "" });
  const [theme, setTheme] = useLocalStorage("theme", "starry");
  const [schoolYear, setSchoolYear] = useLocalStorage("schoolYear", { name: "", start: "", end: "" });
  const [form, setForm] = useState({ name: "", color: "amber", level: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", color: "amber", level: "" });
  const fileRef = useRef(null);

  const addSubject = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubjects([...subjects, { id: newSubjectId(), name: form.name.trim(), color: form.color, level: form.level.trim() }]);
    setForm({ name: "", color: "amber", level: "" });
  };

  const removeSubject = (id) => {
    if (!confirm("Удалить предмет? Записи с ним останутся, но потеряют связь.")) return;
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditForm({ name: s.name, color: s.color, level: s.level || "" });
  };
  const saveEdit = () => {
    setSubjects(subjects.map((s) => (s.id === editingId ? { ...s, ...editForm, name: editForm.name.trim(), level: editForm.level.trim() } : s)));
    setEditingId(null);
  };

  const onExport = () => {
    const data = exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `starry-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    try { localStorage.setItem("lastBackupAt", JSON.stringify(Date.now())); } catch {}
  };

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!confirm("Импортировать данные? Текущие данные будут заменены.")) return;
      importAll(data);
      location.reload();
    } catch (err) {
      alert("Не удалось импортировать файл: " + err.message);
    } finally {
      e.target.value = "";
    }
  };

  const wipeAll = () => {
    if (!confirm("Точно удалить ВСЕ данные? Это действие необратимо.")) return;
    if (!confirm("Точно-точно? Все предметы, задачи, цели, заметки, цитаты, расписание будут стёрты.")) return;
    for (const k of STORAGE_KEYS) localStorage.removeItem(k);
    location.reload();
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl md:text-5xl vg-serif vg-heading">⚙️ Настройки</h1>
        <p className="text-amber-100/70">Профиль, тема, предметы, учебный год, бэкапы.</p>
      </header>

      {/* Профиль */}
      <section className="vg-card space-y-3">
        <h2 className="vg-serif text-xl font-bold text-amber-200">👤 Профиль</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            <span className="block mb-1 text-amber-100/60">Имя</span>
            <input className="vg-input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-amber-100/60">Школа / университет</span>
            <input className="vg-input" value={profile.school} onChange={(e) => setProfile({ ...profile, school: e.target.value })} />
          </label>
        </div>
      </section>

      {/* Тема */}
      <section className="vg-card space-y-3">
        <h2 className="vg-serif text-xl font-bold text-amber-200">🎨 Тема оформления</h2>
        <p className="text-xs text-amber-100/60">5 палитр, вдохновлённых картинами Ван Гога.</p>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`vg-chip ${theme === t.id ? "active" : ""}`}
              type="button"
            >
              <span className="mr-1">{t.emoji}</span>{t.name}
            </button>
          ))}
        </div>
      </section>

      {/* Учебный год */}
      <section className="vg-card space-y-3">
        <h2 className="vg-serif text-xl font-bold text-amber-200">📅 Учебный год</h2>
        <p className="text-xs text-amber-100/60">Покажется в расписании: сколько недель осталось.</p>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm">
            <span className="block mb-1 text-amber-100/60">Название</span>
            <input className="vg-input" placeholder="напр. 10 класс · 2025–2026" value={schoolYear.name} onChange={(e) => setSchoolYear({ ...schoolYear, name: e.target.value })} />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-amber-100/60">Начало</span>
            <input className="vg-input" type="date" value={schoolYear.start} onChange={(e) => setSchoolYear({ ...schoolYear, start: e.target.value })} />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-amber-100/60">Конец</span>
            <input className="vg-input" type="date" value={schoolYear.end} onChange={(e) => setSchoolYear({ ...schoolYear, end: e.target.value })} />
          </label>
        </div>
      </section>

      {/* Добавить предмет */}
      <section className="vg-card space-y-3">
        <h2 className="vg-serif text-xl font-bold text-amber-200">➕ Добавить предмет</h2>
        <form onSubmit={addSubject} className="grid gap-3 md:grid-cols-6">
          <input className="vg-input md:col-span-2" placeholder="Название" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="vg-input md:col-span-2" placeholder="Уровень / тег (необязательно)" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} />
          <ColorPicker value={form.color} onChange={(c) => setForm({ ...form, color: c })} />
          <button type="submit" className="vg-btn">+ Добавить</button>
        </form>
      </section>

      {/* Список предметов */}
      <section className="vg-card space-y-3">
        <h2 className="vg-serif text-xl font-bold text-amber-200">🎓 Мои предметы ({subjects.length})</h2>
        {subjects.length === 0 && <p className="text-sm text-amber-100/60">Пока нет предметов.</p>}
        <ul className="space-y-2">
          {subjects.map((s) => (
            <li key={s.id} className="rounded-lg border border-amber-400/20 bg-slate-900/40 p-3">
              {editingId === s.id ? (
                <div className="grid gap-2 md:grid-cols-6 items-center">
                  <input className="vg-input md:col-span-2" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                  <input className="vg-input md:col-span-2" placeholder="уровень" value={editForm.level} onChange={(e) => setEditForm({ ...editForm, level: e.target.value })} />
                  <ColorPicker value={editForm.color} onChange={(c) => setEditForm({ ...editForm, color: c })} />
                  <div className="flex gap-1">
                    <button onClick={saveEdit} className="vg-btn flex-1">✓</button>
                    <button onClick={() => setEditingId(null)} className="vg-btn-ghost">✗</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className={`h-6 w-6 shrink-0 rounded-full bg-${s.color}-500`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-amber-50">{s.name}</div>
                    {s.level && <div className="text-xs text-amber-100/60">{s.level}</div>}
                  </div>
                  <button onClick={() => startEdit(s)} className="text-amber-100/40 hover:text-amber-300 transition p-2">✎</button>
                  <button onClick={() => removeSubject(s.id)} className="text-amber-100/40 hover:text-rose-400 transition p-2">🗑</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Данные */}
      <section className="vg-card space-y-3">
        <h2 className="vg-serif text-xl font-bold text-amber-200">💾 Данные</h2>
        <p className="text-sm text-amber-100/60">Всё хранится только в твоём браузере. Сделай бэкап, чтобы не потерять.</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={onExport} className="vg-btn">⬇ Экспорт JSON</button>
          <button onClick={() => fileRef.current?.click()} className="vg-btn-ghost">⬆ Импорт JSON</button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onImport} />
          <button onClick={wipeAll} className="vg-btn-danger ml-auto">⚠ Стереть всё</button>
        </div>
      </section>
    </div>
  );
}

function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {COLOR_PALETTE.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={c}
          onClick={() => onChange(c)}
          className={`h-6 w-6 rounded-full bg-${c}-500 transition ${value === c ? "ring-2 ring-offset-2 ring-amber-300 ring-offset-slate-900" : "hover:scale-110"}`}
        />
      ))}
    </div>
  );
}
