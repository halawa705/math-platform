"use client";

/**
 * @file exam-coordinate-answer-drawer.tsx
 * @description درج قابل للطي يعرض أداة الشبكة الإحداثية التفاعلية للطالب في الاختبار الإلكتروني.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 60 سطراً).
 */

import { useState } from "react";
import InteractiveCoordinatePlaneAnswerPad from "@/features/electronic-exams-hub/interactive-coordinate-plane-answer-pad";
import type { MathNotationLanguage, NumeralDisplayMode } from "@/core/ssot/numeral-and-unit-ssot";

export const MODULE_ID_EXAM_COORDINATE_ANSWER_DRAWER =
  "exam_coordinate_answer_drawer" as const;

export interface ExamCoordinateAnswerDrawerProps {
  readonly quadrantMode?: "first_quadrant" | "four_quadrant";
  readonly notationLanguage?: MathNotationLanguage;
  readonly numeralMode?: NumeralDisplayMode;
  readonly onInsertAnswerText: (formattedCoords: string) => void;
}

export default function ExamCoordinateAnswerDrawer({
  quadrantMode = "four_quadrant",
  notationLanguage = "arabic",
  numeralMode = "western",
  onInsertAnswerText,
}: ExamCoordinateAnswerDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full min-h-[44px] px-3.5 py-2 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 text-xs font-black text-indigo-900 dark:text-indigo-200 cursor-pointer flex items-center justify-between"
      >
        <span>📐 رسم وتحديد نقاط على الشبكة الإحداثية</span>
        <span>{open ? "إخفاء ▲" : "فتح الشبكة ▼"}</span>
      </button>
      {open && (
        <InteractiveCoordinatePlaneAnswerPad
          quadrantMode={quadrantMode}
          notationLanguage={notationLanguage}
          numeralMode={numeralMode}
          onInsertAnswerText={onInsertAnswerText}
        />
      )}
    </div>
  );
}
