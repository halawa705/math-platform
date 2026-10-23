"use client";

/**
 * @file global-theme-mode-toggle-button.tsx
 * @description زر التبديل الموحد بين الوضع الفاتح (Editorial Ivory) والوضع الداكن (Deep Obsidian).
 * يعتمد حصرياً على مصدر الحقيقة `theme-mode-ssot.ts` ليطبق على جميع صفحات وتبويبات المنصة.
 */

import { useEffect, useState } from "react";
import {
  applyThemeModeSSOT,
  resolveActiveThemeModeSSOT,
  type PlatformThemeMode,
} from "@/core/ssot/theme-mode-ssot";

export default function GlobalThemeModeToggleButton() {
  const [mode, setMode] = useState<PlatformThemeMode>("light");

  useEffect(() => {
    const initial = resolveActiveThemeModeSSOT();
    setMode(initial);
    applyThemeModeSSOT(initial);
  }, []);

  const handleToggle = () => {
    const next: PlatformThemeMode = mode === "light" ? "dark" : "light";
    setMode(next);
    applyThemeModeSSOT(next);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={mode === "light" ? "التبديل إلى الوضع الداكن" : "التبديل إلى الوضع الفاتح"}
      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
    >
      {mode === "light" ? "🌙 الوضع الداكن" : "☀️ الوضع الفاتح"}
    </button>
  );
}
