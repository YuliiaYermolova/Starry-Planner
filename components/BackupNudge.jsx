"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocalStorage } from "@/lib/storage";

const ONE_DAY = 86400000;

export default function BackupNudge() {
  const [lastBackup] = useLocalStorage("lastBackupAt", 0);
  const [firstVisit] = useLocalStorage("firstVisitAt", 0);
  const [dismissed, setDismissed] = useLocalStorage("backupNudgeDismissedAt", 0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!firstVisit) {
      try { localStorage.setItem("firstVisitAt", JSON.stringify(Date.now())); } catch {}
    }
    const now = Date.now();
    const since = lastBackup || firstVisit || now;
    const daysSince = (now - since) / ONE_DAY;
    const dismissedRecently = dismissed && now - dismissed < 3 * ONE_DAY;
    setShow(daysSince > 7 && !dismissedRecently);
  }, [lastBackup, firstVisit, dismissed]);

  if (!show) return null;

  return (
    <div className="vg-card border-amber-300/50 bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-start gap-3">
      <span className="text-2xl">💾</span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-amber-200">Сделай бэкап своих данных</div>
        <p className="text-sm text-amber-100/70 mt-0.5">
          Всё хранится в этом браузере. Если очистишь кэш или сменишь устройство —
          данные пропадут. Скачай JSON-файл за пару секунд.
        </p>
        <div className="flex gap-2 mt-3">
          <Link href="/settings" className="vg-btn">⬇ К бэкапу</Link>
          <button
            onClick={() => { try { localStorage.setItem("backupNudgeDismissedAt", JSON.stringify(Date.now())); } catch {} setShow(false); }}
            className="vg-btn-ghost"
          >
            Позже
          </button>
        </div>
      </div>
    </div>
  );
}
