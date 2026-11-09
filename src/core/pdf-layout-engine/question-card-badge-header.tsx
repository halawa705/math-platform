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
  readonly isBookletHomework?: boolean;
  readonly isAnswerCard?: boolean;
  readonly formattedQNum: string;
  readonly formattedMarks?: string;
  readonly exampleRoleLabel: string;
  readonly badgeBgColorHex: string;
  readonly badgeGradientCss?: string;
  readonly cardBorderColorHex: string;
  readonly palette: PrintThemePaletteTokens;
  readonly citationBadgeAr?: string;
  readonly formattedIdeaIndex?: string;
}

export function QuestionCardBadgeHeader({
  isBookletSolvedExample,
  isBookletDrill,
  isBookletHomework = false,
  isAnswerCard = false,
  formattedQNum,
  formattedMarks,
  exampleRoleLabel,
  badgeBgColorHex,
  badgeGradientCss,
  cardBorderColorHex,
  palette,
  citationBadgeAr,
  formattedIdeaIndex,
}: QuestionCardBadgeHeaderProps) {
  if (isAnswerCard) {
    return (
      <div style={{ breakAfter: "avoid" }} className="mb-1 flex items-center justify-between gap-1.5">
        <span
          style={{
            background: badgeGradientCss || badgeBgColorHex,
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.12)",
          }}
          className="px-2.5 py-0.5 rounded-md text-white text-[0.82em] font-black inline-flex items-center gap-1.5"
        >
          <span>✍️</span>
          <span>إجابة سؤال {formattedQNum}</span>
        </span>
        {citationBadgeAr && (
          <span
            style={{ color: badgeBgColorHex, borderColor: cardBorderColorHex }}
            className="px-1.5 py-0.2 rounded bg-white border text-[0.72em] font-black truncate shadow-2xs"
          >
            📍 {citationBadgeAr}
          </span>
        )}
      </div>
    );
  }

  if (isBookletSolvedExample) {
    return (
      <div style={{ breakAfter: "avoid" }} className="mb-1 flex items-center justify-between gap-1.5">
        <span
          style={{ backgroundColor: badgeBgColorHex }}
          className="px-2.5 py-0.5 rounded-md text-white text-[0.82em] font-black inline-flex items-center gap-1 shadow-2xs"
        >
          <span>✍️</span>
          <span>
            مثال توضيحي {formattedQNum} ({exampleRoleLabel})
          </span>
        </span>
        {citationBadgeAr && (
          <span
            style={{ color: palette.secondaryHex, borderColor: cardBorderColorHex }}
            className="px-1.5 py-0.2 rounded bg-white border text-[0.72em] font-black truncate"
          >
            📍 {citationBadgeAr}
          </span>
        )}
      </div>
    );
  }

  if (isBookletDrill) {
    return (
      <div style={{ breakAfter: "avoid" }} className="mb-1 flex items-center justify-between gap-1.5">
        <span
          style={{ backgroundColor: "#4338CA" }}
          className="px-2.5 py-0.5 rounded-md text-white text-[0.82em] font-black inline-flex items-center gap-1 shadow-2xs"
        >
          <span>🎯</span>
          <span>حاول بنفسك ({formattedQNum})</span>
        </span>
        <span
          style={{ color: "#4338CA", borderColor: "#C7D2FE", backgroundColor: "#FFFFFF" }}
          className="px-1.5 py-0.2 rounded bg-white border text-[0.74em] font-black"
        >
          تدريب فهم مباشر
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: cardBorderColorHex,
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
        breakAfter: "avoid",
      }}
      className="px-2 py-0.5 mb-1 rounded-md border-r-4 border bg-white flex flex-wrap items-center justify-between gap-1"
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
        style={{ color: isBookletHomework ? "#9D174D" : palette.primaryHex }}
        className="text-[0.78em] font-black bg-white px-2 py-0.2 rounded-md border border-slate-200 shrink-0 shadow-2xs inline-flex items-center gap-1"
      >
        <span>{isBookletHomework ? `مسألة واجب (${formattedQNum})` : `سؤال (${formattedQNum})`}</span>
        {!isBookletHomework && formattedMarks && (
          <span className="text-slate-600 bg-slate-50 px-1.5 py-0.1 rounded border border-slate-200 font-extrabold text-[0.88em]">
            ({formattedMarks} درجـة)
          </span>
        )}
        {formattedIdeaIndex && (
          <span className="text-[#9D174D] bg-pink-50 px-1 py-0.1 rounded border border-pink-200 font-extrabold text-[0.88em]">
            (فكرة {formattedIdeaIndex})
          </span>
        )}
      </span>
    </div>
  );
}
