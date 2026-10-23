/**
 * @file theme-mode-ssot.ts
 * @description المصدر الوحيد للحقيقة (SSOT) لنظام الألوان والوضع الفاتح/الداكن (Light & Dark Mode).
 * تستخدمه كافة صفحات الموقع والتبويبات والنوافذ المنبثقة عبر زر التبديل الموحد،
 * بينما تظل ورقة طباعة الـ A4 بيضاء ناصعة دائماً (#ffffff !important).
 */

export type PlatformThemeMode = "light" | "dark";

export interface ThemePaletteTokens {
  readonly mode: PlatformThemeMode;
  readonly nameArabic: string;
  readonly bgPrimary: string;
  readonly bgSurfaceCard: string;
  readonly bgElevatedGlass: string;
  readonly borderSubtle: string;
  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly accentRoyalIndigo: string;
  readonly accentMathTeal: string;
  readonly accentProofGold: string;
  readonly a4SheetPrintBg: "#ffffff";
}

export const THEME_PALETTES_SSOT: Record<PlatformThemeMode, ThemePaletteTokens> = {
  light: {
    mode: "light",
    nameArabic: "الوضع الفاتح (عاجي أكاديمي)",
    bgPrimary: "#F8FAFC",
    bgSurfaceCard: "#FFFFFF",
    bgElevatedGlass: "rgba(255, 255, 255, 0.88)",
    borderSubtle: "#E2E8F0",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    accentRoyalIndigo: "#3730A3",
    accentMathTeal: "#0D9488",
    accentProofGold: "#D97706",
    a4SheetPrintBg: "#ffffff",
  },
  dark: {
    mode: "dark",
    nameArabic: "الوضع الداكن (كحلي ليلي عميق)",
    bgPrimary: "#090D16",
    bgSurfaceCard: "#111827",
    bgElevatedGlass: "rgba(17, 24, 39, 0.88)",
    borderSubtle: "#1E293B",
    textPrimary: "#F1F5F9",
    textSecondary: "#94A3B8",
    accentRoyalIndigo: "#6366F1",
    accentMathTeal: "#14B8A6",
    accentProofGold: "#F59E0B",
    a4SheetPrintBg: "#ffffff",
  },
};

export const THEME_STORAGE_KEY_SSOT = "math_platform_theme_mode_v1";

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
