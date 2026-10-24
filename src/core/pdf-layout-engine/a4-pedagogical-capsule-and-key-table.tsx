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
    <section
      style={{
        breakInside: "avoid",
        borderColor: palette.borderHex,
        boxShadow: "0 2px 6px rgba(76, 29, 149, 0.08)",
      }}
      className="w-full min-w-0 rounded-xl border-2 bg-white overflow-hidden my-0.5"
    >
      {item.ideaBannerTitleAr && (
        <div
          style={{ background: palette.headerGradientCss }}
          className="px-3 py-1 text-white flex flex-wrap items-center justify-between gap-2 text-[0.92em] font-black"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[0.82em] shrink-0">💡</span>
            <span className="break-words">
              {formatNumeralsByModeSSOT(item.ideaBannerTitleAr, numeralMode)}
            </span>
          </div>
          {item.branchBadgeAr && (
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[0.76em] font-extrabold shrink-0">
              {item.branchBadgeAr}
            </span>
          )}
        </div>
      )}

      {(item.conceptExplanationAr || item.framedRuleAr) && (
        <div className="p-2 grid grid-cols-1 gap-1.5 bg-white">
          {item.conceptExplanationAr && (
            <div
              style={{ backgroundColor: palette.softSurfaceHex, borderColor: palette.primaryHex }}
              className="px-2.5 py-1 rounded-lg border-r-4 text-[0.9em] text-slate-800 leading-relaxed min-w-0"
            >
              <span style={{ color: palette.primaryHex }} className="font-black ml-1.5">
                📘 مفهوم الفكرة:
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
              className="px-2.5 py-1 rounded-lg border-2 border-dashed text-[0.92em] font-bold text-slate-900 leading-relaxed min-w-0"
            >
              <span style={{ color: palette.secondaryHex }} className="font-black ml-1.5">
                📐 القاعدة الرياضية المؤطرة:
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
    </section>
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

  const effectiveEm = Number((0.88 * compactScale).toFixed(2));

  return (
    <div
      style={{
        backgroundColor: palette.solvedBgHex,
        borderColor: palette.solvedBorderHex,
        color: palette.solvedTextHex,
        fontSize: `${effectiveEm}em`,
      }}
      className="mt-1.5 p-2 rounded-lg border-2 space-y-1 min-w-0"
    >
      <div className="font-black flex flex-wrap items-center justify-between gap-1 border-b border-purple-900/10 pb-1 mb-1">
        <span>✓ خطوات الحل والإجابة النموذجية:</span>
        {item.kind === "mcq" && item.correctMcqIndex !== undefined && (
          <span
            style={{
              backgroundColor: palette.primaryHex,
              color: "#ffffff",
              borderColor: palette.borderHex,
            }}
            className="px-2 py-0.5 rounded-md border text-[0.84em] font-black shadow-2xs"
          >
            الإجابة الصحيحة: ({ARABIC_CHOICE_LETTERS[item.correctMcqIndex]})
          </span>
        )}
      </div>
      <div className="space-y-1">
        {steps.map((rawStepText, idx) => {
          const isExplicitFinal = /^الناتج\s*النهائي\s*:/i.test(rawStepText);
          const isLast = (idx === steps.length - 1 && steps.length > 1) || isExplicitFinal;
          const cleanStepText = rawStepText.replace(/^الناتج\s*النهائي\s*:\s*/i, "").trim();

          return (
            <div
              key={idx}
              style={{ breakInside: "avoid" }}
              className="flex items-baseline gap-1.5 leading-relaxed min-w-0"
            >
              <span
                style={{
                  background: isLast ? palette.headerGradientCss : "#ffffff",
                  color: isLast ? "#ffffff" : palette.primaryHex,
                  borderColor: palette.borderHex,
                }}
                className="shrink-0 px-1.5 py-0.2 rounded-md border text-[0.78em] font-black shadow-2xs"
              >
                {isLast ? "∴ الناتج" : `خطوة ${formatNumeralsByModeSSOT(idx + 1, numeralMode)}`}
              </span>
              <div className={`min-w-0 flex-1 break-words ${isLast ? "font-black" : "font-semibold"}`}>
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
            <div key={q.id} className="px-2 py-1 border-l border-b border-slate-300 flex items-center justify-between gap-1 min-w-0">
              <span style={{ backgroundColor: palette.primaryHex }} className="text-white font-black px-1.5 py-0.2 rounded text-[0.85em] shrink-0">
                س{formatNumeralsByModeSSOT(q.questionNumber, numeralMode)}
              </span>
              <span style={{ color: palette.primaryHex }} className="font-black truncate">
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
