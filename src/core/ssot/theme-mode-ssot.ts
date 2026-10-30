/**
 * @file theme-mode-ssot.ts
 * @description المصدر الوحيد للحقيقة (SSOT) لنظام الألوان والوضع الفاتح/الداكن (Light & Dark Mode).
 * تستخدمه كافة صفحات الموقع والتبويبات والنوافذ المنبثقة عبر زر التبديل الموحد،
 * بينما تظل ورقة طباعة الـ A4 بيضاء ناصعة دائماً (#ffffff !important).
 */

export type PlatformThemeMode = "light" | "dark";

const THEME_STORAGE_KEY_SSOT = "math_platform_theme_mode_v1";

/**
 * يقرأ الوضع الحالي من التخزين المحلي أو يرجع الوضع الافتراضي.
 */
export function resolveActiveThemeModeSSOT(): PlatformThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY_SSOT);
    return saved === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

/**
 * يبدل الوضع اللوني ويحدث وسم `documentElement` ويحفظه كحقيقة واحدة لكامل المنصة.
 */
export function applyThemeModeSSOT(mode: PlatformThemeMode): void {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
  }
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY_SSOT, mode);
  } catch {}
}
