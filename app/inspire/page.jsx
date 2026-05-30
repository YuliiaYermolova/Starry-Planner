"use client";
import { useState } from "react";
import { useLocalStorage } from "@/lib/storage";
import { QUOTES } from "@/lib/quotes";
import { BOOKS_TEMPLATE, CURIOSITY_TEMPLATE, BOOK_STATUSES } from "@/lib/books";

export default function InspirePage() {
  const [tab, setTab] = useState("quotes");
  const [favQuotes] = useLocalStorage("favQuotes", []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl md:text-5xl vg-serif vg-heading">✨ Вдохновение</h1>
        <p className="text-amber-100/70">Цитаты философов и психологов, книги, темы вне программы.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        <button className={`vg-tab ${tab === "quotes" ? "active" : ""}`} onClick={() => setTab("quotes")}>💭 Цитаты</button>
        <button className={`vg-tab ${tab === "favorites" ? "active" : ""}`} onClick={() => setTab("favorites")}>★ Избранные ({favQuotes.length})</button>
        <button className={`vg-tab ${tab === "books" ? "active" : ""}`} onClick={() => setTab("books")}>📚 Книги</button>
        <button className={`vg-tab ${tab === "curiosity" ? "active" : ""}`} onClick={() => setTab("curiosity")}>🌱 Любопытство</button>
      </div>

      {tab === "quotes"    && <QuotesTab />}
      {tab === "favorites" && <FavTab />}
      {tab === "books"     && <BooksTab />}
      {tab === "curiosity" && <CurioTab />}
    </div>
  );
}

/* ============ Цитаты ============ */
function QuotesTab() {
  const [userQuotes, setUserQuotes] = useLocalStorage("userQuotes", []);
  const [favQuotes, setFavQuotes] = useLocalStorage("favQuotes", []);
  const [form, setForm] = useState({ text: "", author: "" });

  const all = [...QUOTES, ...userQuotes];

  const add = (e) => {
    e.preventDefault();
    if (!form.text.trim() || !form.author.trim()) return;
    setUserQuotes([...userQuotes, { text: form.text.trim(), author: form.author.trim() }]);
    setForm({ text: "", author: "" });
  };

  const toggleFav = (q) => {
    const ex = favQuotes.findIndex((f) => f.text === q.text);
    if (ex >= 0) setFavQuotes(favQuotes.filter((_, i) => i !== ex));
    else setFavQuotes([...favQuotes, q]);
  };

  const removeUserQuote = (i) => setUserQuotes(userQuotes.filter((_, j) => j !== i));

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="vg-card grid gap-3 md:grid-cols-6">
        <input className="vg-input md:col-span-3" placeholder="Своя цитата..." value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
        <input className="vg-input md:col-span-2" placeholder="Автор" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
        <button type="submit" className="vg-btn">+ Добавить</button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {all.map((q, idx) => {
          const isFav = favQuotes.some((f) => f.text === q.text);
          const isUser = idx >= QUOTES.length;
          return (
            <article key={idx} className="vg-quote">
              <p className="vg-quote-text">{q.text}</p>
              <div className="flex items-center justify-between flex-wrap gap-2 mt-1">
                <p className="vg-quote-author">— {q.author}</p>
                <div className="flex gap-2">
                  <button onClick={() => toggleFav(q)} className={`vg-chip ${isFav ? "active" : ""}`}>{isFav ? "★" : "☆"}</button>
                  {isUser && (
                    <button onClick={() => removeUserQuote(idx - QUOTES.length)} className="vg-chip">🗑</button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ============ Избранные ============ */
function FavTab() {
  const [favQuotes, setFavQuotes] = useLocalStorage("favQuotes", []);
  if (favQuotes.length === 0) {
    return <div className="vg-card text-center text-amber-100/60 py-8">Пока нет избранных. Жми ☆ рядом с цитатой.</div>;
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {favQuotes.map((q, i) => (
        <article key={i} className="vg-quote">
          <p className="vg-quote-text">{q.text}</p>
          <div className="flex items-center justify-between flex-wrap gap-2 mt-1">
            <p className="vg-quote-author">— {q.author}</p>
            <button onClick={() => setFavQuotes(favQuotes.filter((_, j) => j !== i))} className="vg-chip active">★ Убрать</button>
          </div>
        </article>
      ))}
    </div>
  );
}

/* ============ Книги ============ */
function BooksTab() {
  const [books, setBooks] = useLocalStorage("books", []);
  const [form, setForm] = useState({ title: "", author: "", category: "", status: "wishlist", note: "" });
  const [cat, setCat] = useState("all");

  const seed = () => {
    const existing = new Set(books.map((b) => b.title));
    const toAdd = BOOKS_TEMPLATE.filter((b) => !existing.has(b.title));
    setBooks([...books, ...toAdd]);
  };

  const add = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) return;
    setBooks([...books, { ...form, category: form.category || "Прочее" }]);
    setForm({ title: "", author: "", category: "", status: "wishlist", note: "" });
  };

  const remove = (i) => setBooks(books.filter((_, j) => j !== i));
  const setStatus = (i, status) => setBooks(books.map((b, j) => (j === i ? { ...b, status } : b)));

  const cats = ["all", ...new Set(books.map((b) => b.category))];
  const filtered = books.filter((b) => cat === "all" || b.category === cat);

  return (
    <div className="space-y-4">
      {books.length === 0 && (
        <button onClick={seed} className="vg-btn">✨ Загрузить рекомендации (Франкл, Юнг, Камю, Ницше...)</button>
      )}

      <form onSubmit={add} className="vg-card grid gap-3 md:grid-cols-6">
        <input className="vg-input md:col-span-2" placeholder="Название книги" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="vg-input md:col-span-2" placeholder="Автор" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
        <input className="vg-input" placeholder="Категория" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <select className="vg-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          {BOOK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>)}
        </select>
        <input className="vg-input md:col-span-5" placeholder="Заметка (необязательно)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        <button type="submit" className="vg-btn">+ Добавить</button>
      </form>

      {cats.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`vg-chip ${cat === c ? "active" : ""}`}>
              {c === "all" ? "Все" : c}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="vg-card text-center text-sm text-amber-100/60">Пусто.</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((b) => {
            const i = books.indexOf(b);
            const status = BOOK_STATUSES.find((s) => s.value === b.status) || BOOK_STATUSES[0];
            return (
              <article key={i} className="vg-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase tracking-wider text-amber-300/80 mb-1">{b.category}</div>
                    <h3 className="vg-serif font-bold text-lg text-amber-50">{b.title}</h3>
                    <p className="text-xs text-amber-100/70 italic">{b.author}</p>
                  </div>
                  <button onClick={() => remove(i)} className="text-amber-100/40 hover:text-rose-400 transition">🗑</button>
                </div>
                {b.note && <p className="mt-2 text-sm text-amber-100/80">{b.note}</p>}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <select className="vg-input" style={{ width: "auto", fontSize: "0.75rem", padding: "0.25rem 0.5rem" }} value={b.status} onChange={(e) => setStatus(i, e.target.value)}>
                    {BOOK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>)}
                  </select>
                  <span className="text-xs text-amber-300">{status.emoji} {status.label}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============ Любопытство ============ */
function CurioTab() {
  const [items, setItems] = useLocalStorage("curiosity", []);
  const [form, setForm] = useState({ title: "", category: "", note: "" });

  const seed = () => {
    const existing = new Set(items.map((c) => c.title));
    const toAdd = CURIOSITY_TEMPLATE.filter((c) => !existing.has(c.title)).map((c) => ({ ...c, done: false }));
    setItems([...items, ...toAdd]);
  };

  const add = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setItems([...items, { ...form, category: form.category || "Прочее", done: false }]);
    setForm({ title: "", category: "", note: "" });
  };

  const toggle = (i) => setItems(items.map((c, j) => (j === i ? { ...c, done: !c.done } : c)));
  const remove = (i) => setItems(items.filter((_, j) => j !== i));

  return (
    <div className="space-y-4">
      {items.length === 0 && <button onClick={seed} className="vg-btn">✨ Загрузить идеи для изучения</button>}

      <form onSubmit={add} className="vg-card grid gap-3 md:grid-cols-6">
        <input className="vg-input md:col-span-3" placeholder="Что хочется изучить?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="vg-input md:col-span-2" placeholder="Категория" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <button type="submit" className="vg-btn">+ Добавить</button>
        <input className="vg-input md:col-span-6" placeholder="Заметка / источник (необязательно)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
      </form>

      {items.length === 0 ? (
        <div className="vg-card text-center text-sm text-amber-100/60">Пусто.</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((c, i) => (
            <article key={i} className="vg-card flex items-start gap-3">
              <input type="checkbox" checked={c.done} onChange={() => toggle(i)} className="mt-1 h-4 w-4 rounded accent-amber-400" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-amber-300/80 mb-0.5">{c.category}</div>
                <h3 className={`vg-serif font-bold ${c.done ? "line-through text-amber-100/40" : "text-amber-50"}`}>{c.title}</h3>
                {c.note && <p className="mt-1 text-xs text-amber-100/70">{c.note}</p>}
              </div>
              <button onClick={() => remove(i)} className="text-amber-100/40 hover:text-rose-400 transition">🗑</button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
