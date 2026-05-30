"use client";
import { useEffect, useState } from "react";

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw));
    } catch {}
    setLoaded(true);

    // Синхронизация между всеми хуками на этот ключ (в т.ч. в одной вкладке)
    const onChange = (e) => {
      if (e.detail && e.detail.key && e.detail.key !== key) return;
      try {
        const raw = localStorage.getItem(key);
        setValue(raw !== null ? JSON.parse(raw) : initial);
      } catch {}
    };
    window.addEventListener("local-storage", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("local-storage", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent("local-storage", { detail: { key } }));
    } catch {}
  }, [key, value, loaded]);

  return [value, setValue, loaded];
}

export const STORAGE_KEYS = [
  "subjects", "profile", "schedule", "tasks", "notes", "goals",
  "userQuotes", "favQuotes", "books", "curiosity", "focus", "theme", "schoolYear",
];

export function exportAll() {
  const data = {};
  for (const k of STORAGE_KEYS) {
    const raw = localStorage.getItem(k);
    if (raw !== null) {
      try { data[k] = JSON.parse(raw); } catch {}
    }
  }
  return data;
}

export function importAll(data) {
  if (!data || typeof data !== "object") throw new Error("bad data");
  for (const k of STORAGE_KEYS) {
    if (k in data) localStorage.setItem(k, JSON.stringify(data[k]));
  }
}
