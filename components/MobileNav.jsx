"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/",         icon: "📊", label: "Главная" },
  { href: "/schedule", icon: "📅", label: "Распис." },
  { href: "/tasks",    icon: "✅", label: "Задачи" },
  { href: "/goals",    icon: "🎯", label: "Цели" },
  { href: "/inspire",  icon: "✨", label: "Вдохн." },
  { href: "/focus",    icon: "⏱", label: "Фокус" },
  { href: "/settings", icon: "⚙️", label: "Настр." },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-amber-400/30 bg-slate-950/95 backdrop-blur">
      <ul className="grid grid-cols-7">
        {links.map(({ href, icon, label }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[9px] transition ${
                  active ? "text-amber-300" : "text-amber-100/60"
                }`}
              >
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
