"use client";
import { useEffect } from "react";
import { useLocalStorage } from "@/lib/storage";

export default function ThemeApplier() {
  const [theme] = useLocalStorage("theme", "starry");
  useEffect(() => {
    document.body.setAttribute("data-theme", theme || "starry");
  }, [theme]);
  return null;
}

export const THEMES = [
  { id: "starry",     name: "Звёздная ночь",  emoji: "🌌" },
  { id: "sunflowers", name: "Подсолнухи",     emoji: "🌻" },
  { id: "olives",     name: "Оливковая роща", emoji: "🫒" },
  { id: "cafe",       name: "Ночное кафе",    emoji: "☕" },
  { id: "iris",       name: "Ирисы",          emoji: "🪻" },
];
