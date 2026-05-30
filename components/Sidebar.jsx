"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocalStorage } from "@/lib/storage";

const links = [
  { href: "/",         label: "Главная",     icon: "📊" },
  { href: "/schedule", label: "Расписание",  icon: "📅" },
  { href: "/tasks",    label: "Задачи",      icon: "✅" },
  { href: "/goals",    label: "Цели",        icon: "🎯" },
  { href: "/notes",    label: "Заметки",     icon: "📝" },
  { href: "/inspire",  label: "Вдохновение", icon: "✨" },
  { href: "/focus",    label: "Фокус",       icon: "⏱" },
  { href: "/settings", label: "Настройки",   icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [profile] = useLocalStorage("profile", { name: "Студент", school: "" });

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-amber-400/20 bg-slate-900/60 backdrop-blur-md p-5">
      <div className="mb-6 px-2">
        <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300/70 truncate">
          {profile.school || "Мой планер"}
        </div>
        <div className="vg-heading vg-serif text-2xl font-black leading-tight">
          🌌 Starry<br />Planner
        </div>
        <div className="vg-swirl mt-2" />
      </div>
      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`vg-nav-item ${active ? "active" : ""}`}
            >
              <span className="text-base">{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      {profile.name && (
        <div className="mt-auto pt-6 text-xs text-amber-100/50 px-2">
          <div className="vg-swirl mb-2" />
          Привет, <span className="text-amber-200">{profile.name}</span>
        </div>
      )}
    </aside>
  );
}
