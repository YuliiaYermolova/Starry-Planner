"use client";
import { useLocalStorage } from "@/lib/storage";

// Палитра доступных цветов Tailwind (для UI выбора)
export const COLOR_PALETTE = [
  "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal",
  "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose", "slate",
];

export function colorClasses(color) {
  // возвращает классы Tailwind для данного цвета
  return {
    bg: `bg-${color}-500`,
    bgSoft: `bg-${color}-100`,
    text: `text-${color}-700`,
    border: `border-${color}-500`,
    ring: `ring-${color}-400`,
  };
}

// Дефолтный стартовый набор предметов (можно полностью удалить и завести свои)
export const DEFAULT_SUBJECTS = [
  { id: "math", name: "Математика", color: "sky", level: "" },
  { id: "lang", name: "Язык", color: "rose", level: "" },
  { id: "history", name: "История", color: "amber", level: "" },
  { id: "it", name: "Информатика", color: "indigo", level: "" },
];

export function useSubjects() {
  return useLocalStorage("subjects", DEFAULT_SUBJECTS);
}

export function findSubject(subjects, id) {
  return subjects.find((s) => s.id === id);
}

export function newSubjectId() {
  return "s_" + Math.random().toString(36).slice(2, 9);
}
