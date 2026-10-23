"use client";

/**
 * @file a4-pedagogical-capsule-and-key-table.tsx
 * @description مكون ذري مستقل لتصيير:
 * 1. كبسولة الفكرة والمفهوم الرياضي والقانون المؤطر (`PedagogicalIdeaAndRuleCapsule`) في المذكرات والمراجعات.
 * 2. صندوق خطوات الحل النموذجي المرقم (`StructuredStepByStepSolutionBox`).
 * 3. جدول مفتاح إجابات الاختيار من متعدد الرسمي (`OfficialMcqAnswerKeySummaryTable`) في أسفل الورقة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 190 سطراً).
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

export function PedagogicalIdeaAndRuleCapsule({
  item,
  palette,
  numeralMode,
  notationLanguage,
}: {
  readonly item: PrintableMathQuestionItem;
  readonly palette: PrintThemePaletteTokens;
  readonly numeralMode: NumeralDisplayMode;
  readonly notationLanguage: MathNotationLanguage;
}) {
  if (!item.ideaBannerTitleAr && !item.conceptExplanationAr && !item.framedRuleAr) {
    return null;
  }

  return (
    <div className="mb-2 space-y-1.5">
      {item.ideaBannerTitleAr && (
        <div
          style={{ background: palette.headerGradientCss }}
          className="px-2.5 py-1 rounded-md text-white flex items-center justify-between text-[0.88em] font-black shadow-2xs"
        >
          <span>💡 {formatNumeralsByModeSSOT(item.ideaBannerTitleAr, numeralMode)}</span>
          <span className="text-[0.82em] opacity-90 font-bold">{item.branchBadgeAr}</span>
        </div>
      )}

      {(item.conceptExplanationAr || item.framedRuleAr) && (
        <div className="grid grid-cols-1 gap-1.5">
          {item.conceptExplanationAr && (
            <div
              style={{ backgroundColor: palette.softSurfaceHex, borderColor: palette.borderHex }}
              className="px-2.5 py-1.5 rounded-md border-r-4 text-[0.88em] text-slate-800"
            >
              <span style={{ color: palette.primaryHex }} className="font-black ml-1.5">
                📘 المفهوم:
              </span>
              <SafeKaTeXBiDiMathRenderer
                text={item.conceptExplanationAr}
                numeralMode={numeralMode}
                notationLanguage={notationLanguage}
              />
            </div>
          )}

          {item.framedRuleAr && (
            <div
              style={{ backgroundColor: palette.ruleBgHex, borderColor: palette.ruleBorderHex }}
              className="px-2.5 py-1.5 rounded-md border border-dashed text-[0.9em] font-bold text-slate-900"
            >
              <span style={{ color: palette.secondaryHex }} className="font-black ml-1.5">
                📐 القاعدة المؤطرة:
              </span>
              <SafeKaTeXBiDiMathRenderer
                text={item.framedRuleAr}
                numeralMode={numeralMode}
                notationLanguage={notationLanguage}
              />
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
}: {
  readonly item: PrintableMathQuestionItem;
  readonly palette: PrintThemePaletteTokens;
  readonly numeralMode: NumeralDisplayMode;
  readonly notationLanguage: MathNotationLanguage;
}) {
  const steps =
    item.solutionStepsAr && item.solutionStepsAr.length > 0
      ? item.solutionStepsAr
      : [item.modelAnswerAr];

  return (
    <div
      style={{
        backgroundColor: palette.solvedBgHex,
        borderColor: palette.solvedBorderHex,
        color: palette.solvedTextHex,
      }}
      className="mt-1.5 p-2 rounded-md border text-[0.88em] space-y-1"
    >
      <div className="font-black flex items-center justify-between border-b border-black/10 pb-0.5 mb-1">
        <span>✓ خطوات الحل والإجابة النموذجية:</span>
        {item.kind === "mcq" && item.correctMcqIndex !== undefined && (
          <span className="px-1.5 py-0.2 rounded bg-white/90 text-[0.85em] font-black shadow-2xs">
            البديل الصحيح: ({ARABIC_CHOICE_LETTERS[item.correctMcqIndex]})
          </span>
        )}
      </div>
      <div className="space-y-1">
        {steps.map((stepText, idx) => {
          const isLast = idx === steps.length - 1 && steps.length > 1;
          return (
            <div key={idx} className="flex items-baseline gap-1.5 leading-snug">
              <span
                style={{
                  backgroundColor: isLast ? palette.primaryHex : "#ffffff",
                  color: isLast ? "#ffffff" : palette.primaryHex,
                  borderColor: palette.solvedBorderHex,
                }}
                className="shrink-0 px-1.5 py-0.2 rounded border text-[0.78em] font-black"
              >
                {isLast ? "∴ الناتج" : `خطوة ${formatNumeralsByModeSSOT(idx + 1, numeralMode)}`}
              </span>
              <div className={isLast ? "font-black" : "font-semibold"}>
                <SafeKaTeXBiDiMathRenderer
                  text={stepText}
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

export function OfficialMcqAnswerKeySummaryTable({
  questions,
  palette,
  numeralMode,
  notationLanguage,
}: {
  readonly questions: readonly PrintableMathQuestionItem[];
  readonly palette: PrintThemePaletteTokens;
  readonly numeralMode: NumeralDisplayMode;
  readonly notationLanguage: MathNotationLanguage;
}) {
  const mcqItems = questions.filter((q) => q.kind === "mcq" && q.mcqChoicesAr);
  if (mcqItems.length === 0) return null;

  return (
    <div style={{ borderColor: palette.primaryHex }} className="mt-3 pt-2 border-t-2 break-inside-avoid">
      <div
        style={{ backgroundColor: palette.badgeBgHex, color: palette.primaryHex }}
        className="px-2.5 py-1 rounded-t-md font-black text-[0.82em] flex items-center justify-between border border-b-0 border-slate-300"
      >
        <span>🔑 جدول مفتاح إجابات الاختيار من متعدد السريع</span>
        <span>إجمالي الأسئلة الموضوعية: {formatNumeralsByModeSSOT(mcqItems.length, numeralMode)}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-r border-slate-300 bg-white text-[0.8em]">
        {mcqItems.map((q) => {
          const idx = q.correctMcqIndex ?? 0;
          const letter = ARABIC_CHOICE_LETTERS[idx] || "أ";
          const choiceVal = q.mcqChoicesAr?.[idx] || q.modelAnswerAr;
          return (
            <div key={q.id} className="px-2 py-1 border-l border-b border-slate-300 flex items-center justify-between gap-1">
              <span style={{ backgroundColor: palette.primaryHex }} className="text-white font-black px-1.5 py-0.2 rounded text-[0.85em]">
                س{formatNumeralsByModeSSOT(q.questionNumber, numeralMode)}
              </span>
              <span className="font-black text-emerald-800 truncate">
                ({letter}){" "}
                <SafeKaTeXBiDiMathRenderer text={choiceVal} numeralMode={numeralMode} notationLanguage={notationLanguage} />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
