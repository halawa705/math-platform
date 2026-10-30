"use client";

/**
 * @file question-card-badge-header.tsx
 * @description شريط الترويسة والشارة لبطاقة السؤال أو المثال المحلول أو التمرين في الـ PDF:
 * - يميز بين المثال المحلولة (✍️ مثال توضيحي)، تدريب الفهم (🎯 حاول بنفسك)، والواجب المنزلي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import type { PrintThemePaletteTokens } from "./a4-vector-html-sheet-renderer";

export interface QuestionCardBadgeHeaderProps {
  readonly isBookletSolvedExample: boolean;
  readonly isBookletDrill: boolean;
  readonly formattedQNum: string;
  readonly exampleRoleLabel: string;
  readonly badgeBgColorHex: string;
  readonly cardBorderColorHex: string;
  readonly palette: PrintThemePaletteTokens;
  readonly citationBadgeAr?: string;
}

export function QuestionCardBadgeHeader({
  isBookletSolvedExample,
  isBookletDrill,
  formattedQNum,
  exampleRoleLabel,
  badgeBgColorHex,
  cardBorderColorHex,
  palette,
  citationBadgeAr,
}: QuestionCardBadgeHeaderProps) {
  if (isBookletSolvedExample) {
    return (
      <div style={{ breakAfter: "avoid" }} className="mb-2 flex items-center justify-between gap-2">
        <span
          style={{ backgroundColor: badgeBgColorHex }}
          className="px-3 py-1 rounded-lg text-white text-[0.86em] font-black inline-flex items-center gap-1.5 shadow-xs"
        >
          <span>✍️</span>
          <span>
            مثال توضيحي {formattedQNum} ({exampleRoleLabel})
          </span>
        </span>
        {citationBadgeAr && (
          <span
            style={{ color: palette.secondaryHex, borderColor: cardBorderColorHex }}
            className="px-2 py-0.5 rounded bg-white border text-[0.75em] font-black truncate"
          >
            📍 {citationBadgeAr}
          </span>
        )}
      </div>
    );
  }

  if (isBookletDrill) {
    return (
      <div style={{ breakAfter: "avoid" }} className="mb-2 flex items-center justify-between gap-2">
        <span
          style={{ backgroundColor: "#4338CA" }}
          className="px-3 py-1 rounded-lg text-white text-[0.86em] font-black inline-flex items-center gap-1.5 shadow-xs"
        >
          <span>🎯</span>
          <span>حاول بنفسك ({formattedQNum})</span>
        </span>
        <span
          style={{ color: "#4338CA", borderColor: "#C7D2FE" }}
          className="px-2 py-0.5 rounded bg-indigo-50 border text-[0.78em] font-black"
        >
          تدريب فهم مباشر
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: `linear-gradient(90deg, ${palette.softSurfaceHex} 0%, ${palette.badgeBgHex} 100%)`,
        borderColor: cardBorderColorHex,
        breakAfter: "avoid",
      }}
      className="px-2.5 py-1 mb-2 rounded-lg border-r-4 border flex flex-wrap items-center justify-between gap-1.5"
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          style={{ backgroundColor: palette.primaryHex }}
          className="px-2 py-0.5 rounded-md text-white text-[0.84em] font-black shrink-0 shadow-2xs"
        >
          {`#${formattedQNum}`}
        </span>
        {citationBadgeAr && (
          <span
            style={{ color: palette.secondaryHex, borderColor: palette.borderHex }}
            className="px-1.5 py-0.2 rounded bg-white border text-[0.75em] font-black truncate"
          >
            📍 {citationBadgeAr}
          </span>
        )}
      </div>
      <span
        style={{ color: "#9D174D" }}
        className="text-[0.78em] font-black bg-white px-2 py-0.2 rounded-md border border-slate-200 shrink-0 shadow-2xs"
      >
        مسألة واجب ({formattedQNum})
      </span>
    </div>
  );
}
