"use client";

/**
 * @file studio-question-geometry-live-editor.tsx
 * @description محرر ذري فوري لوصف الرسم الهندسي أو البياني داخل بطاقة فحص السؤال
 * يعيد تشغيل محرك الرسوميات المحدث فورياً ويربط الـ SVG الجديد بالسؤال.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 95 سطراً).
 */

import React, { useState } from "react";
import type { QuestionAssessmentIR } from "@/core/ir/question-assessment-ir";
import { extractExamQuestionDiagrams } from "@/core/ingestion/exam-question-diagram-extractor";

export const MODULE_ID_STUDIO_QUESTION_GEOMETRY_LIVE_EDITOR =
  "studio_question_geometry_live_editor" as const;

export interface StudioQuestionGeometryLiveEditorProps {
  readonly question: QuestionAssessmentIR;
  readonly gradeId?: string;
  readonly onApplyDiagramPatch: (patch: Partial<QuestionAssessmentIR>) => void;
}

export default function StudioQuestionGeometryLiveEditor({
  question,
  gradeId,
  onApplyDiagramPatch,
}: StudioQuestionGeometryLiveEditorProps) {
  const [tagDraft, setTagDraft] = useState<string>(question.rawDrawingTagArabic ?? "");

  const handleRebuildFigure = (nextTag: string) => {
    setTagDraft(nextTag);
    const trimmed = nextTag.trim();
    const syntheticBlock = trimmed
      ? `${question.promptArabic}\nالرسم: ${trimmed}`
      : question.promptArabic;

    const extracted = extractExamQuestionDiagrams({
      block: syntheticBlock,
      basePrompt: question.promptArabic,
      rawDrawing: trimmed,
      branchId: question.branchId,
      lessonId: question.lessonId,
      lessonTitleArabic: question.lessonTitleArabic,
      orderNumber: question.displayOrderNumber,
      gradeId,
      notationLanguage: question.notationLanguage,
      numeralMode: question.numeralMode,
    });

    onApplyDiagramPatch({
      rawDrawingTagArabic: trimmed || undefined,
      attachedGeometryFigure: extracted.attachedGeometryFigure,
      graphSpec: extracted.graphSpec,
      rawSvgMarkup: extracted.rawSvgMarkup,
      figureDiagnosticsAr: extracted.figureDiagnosticsAr,
    });
  };

  return (
    <div className="space-y-1.5 p-2 rounded-xl bg-indigo-50/60 dark:bg-slate-900 border border-indigo-200/70 dark:border-slate-700">
      <div className="flex items-center justify-between gap-2">
        <span className="font-black text-[11px] text-indigo-950 dark:text-teal-300">
          📐 وصف الرسم الهندسي / البياني (يتحدث فورياً):
        </span>
        <button
          type="button"
          onClick={() => handleRebuildFigure(tagDraft)}
          className="px-2.5 py-1 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-[10px] font-black cursor-pointer"
        >
          🔄 إعادة توليد الشكل
        </button>
      </div>
      <input
        type="text"
        value={tagDraft}
        onChange={(e) => handleRebuildFigure(e.target.value)}
        placeholder="[رسم هندسي: مثلث ABC قائم في B، AB = 6 سم، BC = 8 سم]"
        className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold"
      />
      {question.figureDiagnosticsAr && question.figureDiagnosticsAr.length > 0 && (
        <div className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
          ⚠️ {question.figureDiagnosticsAr[0]}
        </div>
      )}
    </div>
  );
}
