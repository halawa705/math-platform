"use client";

/**
 * @file official-mcq-answer-key-summary-table.tsx
 * @description جدول مفتاح إجابات الاختيار من متعدد الرسمي والمختصر في أسفل ورقة الـ A4
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 100 سطر).
 */

import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";
import {
  getChoiceLetterByNotationSSOT,
  formatNumeralsByModeSSOT,
  type MathNotationLanguage,
  type NumeralDisplayMode,
} from "../ssot/numeral-and-unit-ssot";
import type {
  PrintableMathQuestionItem,
  PrintThemePaletteTokens,
} from "./a4-vector-html-sheet-renderer";

export const MODULE_ID_OFFICIAL_MCQ_ANSWER_KEY_SUMMARY_TABLE =
  "official_mcq_answer_key_summary_table" as const;

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
          const letter = getChoiceLetterByNotationSSOT(idx, notationLanguage);
          const rawChoiceVal = q.mcqChoicesAr?.[idx] || q.modelAnswerAr || "";
          const choiceVal = rawChoiceVal.replace(/[،,.;]+$/g, "").trim();
          return (
            <div key={q.id} className="px-2 py-1 border-l border-b border-slate-300 flex items-center justify-between gap-1 min-w-0">
              <span style={{ backgroundColor: palette.primaryHex }} className="text-white font-black px-1.5 py-0.2 rounded text-[0.85em] shrink-0">
                س{formatNumeralsByModeSSOT(q.questionNumber, numeralMode)}
              </span>
              <span style={{ color: palette.primaryHex }} className="font-black truncate inline-flex items-center gap-1">
                <bdi dir="ltr">({letter})</bdi>
                <SafeKaTeXBiDiMathRenderer text={choiceVal} numeralMode={numeralMode} notationLanguage={notationLanguage} />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
