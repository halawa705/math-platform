"use client";

/**
 * @file studio-exam-forms-difficulty-and-progression-selector.tsx
 * @description مكون ذري لاختيار سياسة صعوبة النماذج (بنفس مستوى الصعوبة المتكافئ أو صعوبة متدرجة تصاعدياً)
 * ومستوى الصعوبة المستهدف، بتصميم متجاوب 100% للهواتف (360px+).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 115 سطراً).
 */

import React from "react";
import type {
  ExamFormsDifficultyProfile,
  ExamFormsProgressionMode,
} from "@/core/ssot/studio-state-persistence-ssot";

export const MODULE_ID_STUDIO_EXAM_FORMS_DIFFICULTY_AND_PROGRESSION_SELECTOR =
  "studio_exam_forms_difficulty_and_progression_selector" as const;

export interface StudioExamFormsDifficultyAndProgressionSelectorProps {
  readonly formsCount: number;
  readonly difficulty: ExamFormsDifficultyProfile;
  readonly progressionMode: ExamFormsProgressionMode;
  readonly onChangeDifficulty: (d: ExamFormsDifficultyProfile) => void;
  readonly onChangeProgressionMode: (m: ExamFormsProgressionMode) => void;
}

const PROGRESSION_OPTIONS: readonly {
  readonly id: ExamFormsProgressionMode;
  readonly label: string;
  readonly sub: string;
}[] = [
  { id: "uniform_equivalent", label: "⚖️ نفس مستوى الصعوبة", sub: "نماذج متكافئة تماماً" },
  { id: "progressive_escalating", label: "📈 صعوبة متدرجة", sub: "تصاعدي من النموذج (أ) للأصعب" },
];

const DIFFICULTY_OPTIONS: readonly {
  readonly id: ExamFormsDifficultyProfile;
  readonly label: string;
}[] = [
  { id: "foundational_gradual", label: "تأسيسي متدرج" },
  { id: "standard_balanced", label: "متوازن وزاري" },
  { id: "comprehensive_rigorous", label: "شامل دقيق" },
  { id: "olympiad_challenge", label: "مستويات عليا" },
];

export default function StudioExamFormsDifficultyAndProgressionSelector({
  formsCount,
  difficulty,
  progressionMode,
  onChangeDifficulty,
  onChangeProgressionMode,
}: StudioExamFormsDifficultyAndProgressionSelectorProps) {
  return (
    <div className="space-y-2">
      {formsCount > 1 && (
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900">
          {PROGRESSION_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChangeProgressionMode(opt.id)}
              className={`min-h-[44px] px-2 py-1 rounded-xl text-center cursor-pointer transition-all ${
                progressionMode === opt.id
                  ? "bg-white dark:bg-slate-800 text-indigo-900 dark:text-teal-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <div className="text-xs font-black leading-tight">{opt.label}</div>
              <div className="text-[10px] font-bold opacity-80 leading-tight">{opt.sub}</div>
            </button>
          ))}
        </div>
      )}

      <div className="space-y-1">
        <span className="text-[11px] font-black text-slate-600 dark:text-slate-300">
          {progressionMode === "progressive_escalating" && formsCount > 1
            ? "🎯 سقف مستوى التدرج المطلوب:"
            : "🎯 مستوى الصعوبة الموحد للنماذج:"}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900">
          {DIFFICULTY_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => onChangeDifficulty(o.id)}
              className={`min-h-[44px] px-2 rounded-xl text-[11px] font-black cursor-pointer transition-all ${
                difficulty === o.id
                  ? "bg-white dark:bg-slate-800 text-indigo-900 dark:text-teal-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
