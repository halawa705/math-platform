"use client";

/**
 * @file a4-pedagogical-capsule-and-key-table.tsx
 * @description مكون ذري مستقل لتصيير:
 * 1. كبسولة الفكرة والمفهوم الرياضي والقانون المؤطر (`PedagogicalIdeaAndRuleCapsule`) بعرض كامل للورقة (`col-span-full`).
 * 2. صندوق خطوات الحل النموذجي المرقم (`StructuredStepByStepSolutionBox`) بدون تكرار لفظ "الناتج النهائي".
 * 3. جدول مفتاح إجابات الاختيار من متعدد الرسمي (`OfficialMcqAnswerKeySummaryTable`) في أسفل الورقة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import React from "react";
import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";
import {
  formatNumeralsByModeSSOT,
  type MathNotationLanguage,
  type NumeralDisplayMode,
} from "../ssot/numeral-and-unit-ssot";
import type {
  PrintableMathQuestionItem,
  PrintThemePaletteTokens,
} from "./a4-vector-html-sheet-renderer";

export const MODULE_ID_A4_PEDAGOGICAL_CAPSULE_AND_KEY_TABLE =
  "a4_pedagogical_capsule_and_key_table" as const;

const ARABIC_CHOICE_LETTERS = ["أ", "ب", "جـ", "د"] as const;

const ARABIC_ORDINAL_MAP: Record<string, string> = {
  "الأولى": "1", "الاولى": "1", "الأول": "1", "الاول": "1",
  "الثانية": "2", "الثاني": "2",
  "الثالثة": "3", "الثالث": "3",
  "الرابعة": "4", "الرابع": "4",
  "الخامسة": "5", "الخامس": "5",
  "السادسة": "6", "السادس": "6",
  "السابعة": "7", "السابع": "7",
  "الثامنة": "8", "الثامن": "8",
  "التاسعة": "9", "التاسع": "9",
  "العاشرة": "10", "العاشر": "10",
  "الحادية عشرة": "11", "الحادية عشر": "11",
  "الثانية عشرة": "12", "الثانية عشر": "12",
  "الثالثة عشرة": "13", "الثالثة عشر": "13",
  "الرابعة عشرة": "14", "الرابعة عشر": "14",
  "الخامسة عشرة": "15", "الخامسة عشر": "15",
};

export function PedagogicalIdeaAndRuleCapsule({
  item,
  palette,
  numeralMode,
  notationLanguage,
  ideaIndex,
}: {
  readonly item: PrintableMathQuestionItem;
  readonly palette: PrintThemePaletteTokens;
  readonly numeralMode: NumeralDisplayMode;
  readonly notationLanguage: MathNotationLanguage;
  readonly ideaIndex?: number;
}) {
  if (!item.ideaBannerTitleAr && !item.conceptExplanationAr && !item.framedRuleAr) {
    return null;
  }

  const rawBanner = item.ideaBannerTitleAr || "";
  let ideaNumberText = ideaIndex !== undefined ? String(ideaIndex) : "";
  if (!ideaNumberText) {
    const numMatch = rawBanner.match(/الفكرة\s*\(?(\d+|[٠-٩]+)\)?/);
    if (numMatch?.[1]) {
      ideaNumberText = numMatch[1];
    } else {
      for (const [word, val] of Object.entries(ARABIC_ORDINAL_MAP)) {
        if (rawBanner.includes(word)) {
          ideaNumberText = val;
          break;
        }
      }
    }
  }
  if (!ideaNumberText) ideaNumberText = "1";

  const isHomeworkSection = /الواجب\s*المنزلي|ثانياً/.test(rawBanner);
  const displayTitle = rawBanner;

  return (
    <div
      style={{
        breakInside: "avoid",
      }}
      className="pedagogical-idea-capsule w-full min-w-0 my-1 space-y-1.5"
    >
      {item.ideaBannerTitleAr && (
        <div
          style={{
            breakInside: "avoid",
            background: isHomeworkSection
              ? "linear-gradient(90deg, #FDF2F8 0%, #9D174D 100%)"
              : palette.headerGradientCss,
            borderColor: isHomeworkSection ? "#BE185D" : palette.primaryHex,
          }}
          className="rounded-xl border-2 p-1.5 text-white flex items-center justify-between gap-2 shadow-xs"
        >
          <div className="flex items-center gap-2 min-w-0">
            {!isHomeworkSection ? (
              <span
                style={{ color: palette.primaryHex }}
                className="bg-white px-2.5 py-0.5 rounded-lg text-[0.88em] font-black shrink-0 shadow-2xs border border-slate-200"
              >
                الفكرة ({formatNumeralsByModeSSOT(ideaNumberText, numeralMode)})
              </span>
            ) : (
              <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[0.88em] font-black shrink-0">
                📚 الواجب المنزلي
              </span>
            )}
            <span className="font-black text-[0.95em] break-words">
              {formatNumeralsByModeSSOT(displayTitle, numeralMode)}
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-lg bg-white/15 border border-white/25 text-white text-[0.76em] font-black shrink-0">
            {item.branchBadgeAr || "المستوى: متوسط"}
          </span>
        </div>
      )}

      {(item.conceptExplanationAr || item.framedRuleAr) && (
        <div className="space-y-1.5 w-full min-w-0">
          {item.conceptExplanationAr && (
            <div
              style={{
                backgroundColor: "#FFFDF5",
                borderColor: "#F59E0B",
              }}
              className="p-2 px-2.5 rounded-xl border-2 text-[0.88em] text-slate-900 leading-relaxed min-w-0 shadow-2xs"
            >
              <div className="text-[#92400E] font-black mb-0.5 pb-0.5 border-b border-amber-200/80 flex items-center gap-1 text-[0.9em]">
                <span>💡</span>
                <span>المفهوم الرياضي والشرح:</span>
              </div>
              <div className="font-bold text-slate-800 break-words">
                <SafeKaTeXBiDiMathRenderer
                  text={item.conceptExplanationAr}
                  numeralMode={numeralMode}
                  notationLanguage={notationLanguage}
                />
              </div>
            </div>
          )}

          {item.framedRuleAr && (
            <div
              style={{
                backgroundColor: "#F5F7FF",
                borderColor: "#818CF8",
              }}
              className="p-2 px-2.5 rounded-xl border-2 text-[0.88em] font-bold text-slate-900 leading-relaxed min-w-0 shadow-2xs overflow-hidden"
            >
              <div
                style={{ color: palette.primaryHex }}
                className="font-black mb-0.5 pb-0.5 border-b border-indigo-200/80 flex items-center gap-1 text-[0.9em]"
              >
                <span>📐</span>
                <span>القاعدة والقانون المعتمد:</span>
              </div>
              <div className="font-extrabold text-slate-900 overflow-x-auto no-scrollbar max-w-full">
                <SafeKaTeXBiDiMathRenderer
                  text={item.framedRuleAr}
                  numeralMode={numeralMode}
                  notationLanguage={notationLanguage}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function StructuredStepByStepSolutionBox({
  item,
  palette,
  numeralMode,
  notationLanguage,
  compactScale = 1,
}: {
  readonly item: PrintableMathQuestionItem;
  readonly palette: PrintThemePaletteTokens;
  readonly numeralMode: NumeralDisplayMode;
  readonly notationLanguage: MathNotationLanguage;
  readonly compactScale?: number;
}) {
  const steps =
    item.solutionStepsAr && item.solutionStepsAr.length > 0
      ? item.solutionStepsAr
      : [item.modelAnswerAr];

  const effectiveEm = Number((0.84 * compactScale).toFixed(2));

  return (
    <div
      style={{
        fontSize: `${effectiveEm}em`,
      }}
      className="mt-1.5 pt-1.5 border-t border-slate-200/90 space-y-1 min-w-0"
    >
      <div className="font-black flex flex-wrap items-center justify-between gap-1 text-slate-900 text-[0.92em]">
        <span>خطوات الحل والشرح بالتفصيل:</span>
        {item.kind === "mcq" && item.correctMcqIndex !== undefined && (
          <span
            style={{
              backgroundColor: palette.primaryHex,
              color: "#ffffff",
              borderColor: palette.borderHex,
            }}
            className="px-2 py-0.5 rounded-md border text-[0.82em] font-black shadow-2xs"
          >
            الإجابة الصحيحة: ({ARABIC_CHOICE_LETTERS[item.correctMcqIndex]})
          </span>
        )}
      </div>
      <div className="space-y-0.5">
        {steps.map((rawStepText, idx) => {
          const isExplicitFinal = /^الناتج\s*النهائي\s*:/i.test(rawStepText);
          const isLast = (idx === steps.length - 1 && steps.length > 1) || isExplicitFinal;
          const cleanStepText = rawStepText
            .replace(/^الناتج\s*النهائي\s*:\s*/i, "")
            .replace(/^\d+[\.\-–]\s*/, "")
            .trim();

          return (
            <div
              key={idx}
              className={`p-1 px-1.5 rounded border min-w-0 flex items-start gap-1 text-[0.88em] leading-snug break-inside-avoid shadow-2xs ${
                isLast
                  ? "bg-emerald-50/70 border-emerald-300 font-black text-slate-950"
                  : "bg-slate-50/70 border-slate-200 font-bold text-slate-900"
              }`}
            >
              <span
                style={{
                  backgroundColor: isLast ? palette.primaryHex : "#ffffff",
                  color: isLast ? "#ffffff" : palette.primaryHex,
                  borderColor: isLast ? palette.primaryHex : "#CBD5E1",
                }}
                className="shrink-0 px-1 py-0.2 rounded text-[0.74em] font-black border shadow-2xs mt-0.5"
              >
                {isLast ? "الناتج" : `خطوة ${formatNumeralsByModeSSOT(idx + 1, numeralMode)}`}
              </span>
              <div className="min-w-0 flex-1 break-words">
                <SafeKaTeXBiDiMathRenderer
                  text={cleanStepText}
                  numeralMode={numeralMode}
                  notationLanguage={notationLanguage}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { OfficialMcqAnswerKeySummaryTable } from "./official-mcq-answer-key-summary-table";

