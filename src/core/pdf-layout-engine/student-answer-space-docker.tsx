"use client";

/**
 * @file student-answer-space-docker.tsx
 * @description مصير مساحات إجابة الطالب (الأسطر المنقطة أو المسطرة) لتدريبات حاول بنفسك وتمارين الواجب.
 * يضمن بقاء أسطر الإجابة مدمجة ورشيقة وبارتفاع محدد دون تمدد رأسي يلتهم مساحة الورقة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 70 سطراً).
 */

import type { AnswerSpaceStyleMode } from "../ssot/pdf-print-settings-ssot";

export const MODULE_ID_STUDENT_ANSWER_SPACE_DOCKER = "student_answer_space_docker" as const;

export interface StudentAnswerSpaceDockerProps {
  readonly isBookletDrill: boolean;
  readonly isBookletHomework: boolean;
  readonly primaryHex: string;
  readonly answerSpaceStyle: AnswerSpaceStyleMode;
  readonly isMcq?: boolean;
  readonly lineCount?: number;
}

export function StudentAnswerSpaceDocker({
  isBookletDrill,
  isBookletHomework,
  primaryHex,
  answerSpaceStyle,
  isMcq = false,
  lineCount = 2,
}: StudentAnswerSpaceDockerProps) {
  if (answerSpaceStyle === "hidden" || isMcq || !lineCount || lineCount <= 0) return null;

  const labelColor = isBookletDrill ? "#4338CA" : isBookletHomework ? "#9D174D" : primaryHex;
  const labelText = isBookletDrill
    ? "إجابة تدريب حاول بنفسك:"
    : isBookletHomework
      ? "إجابة الواجب المنزلي:"
      : "مساحة الحل:";

  const lineStyleClass =
    answerSpaceStyle === "dotted"
      ? "border-b border-dotted border-slate-400"
      : answerSpaceStyle === "lined"
        ? "border-b border-solid border-slate-400"
        : "bg-white border border-slate-200";

  const gapClass = lineCount <= 4 ? "gap-1.5" : lineCount <= 7 ? "gap-1" : "gap-0.5";
  const itemHeightClass = lineCount <= 4 ? "h-3" : lineCount <= 7 ? "h-2.5" : "h-2";

  return (
    <div className="mt-auto px-2 pb-1.5 pt-1 bg-white border-t border-dashed border-slate-300 flex flex-col gap-1">
      <div style={{ color: labelColor }} className="text-[0.74em] font-black text-left select-none">
        {labelText}
      </div>
      <div className={`flex flex-col ${gapClass}`}>
        {Array.from({ length: lineCount }, (_, i) => i + 1).map((lineIdx) => (
          <div key={lineIdx} className={`${itemHeightClass} w-full ${lineStyleClass}`} />
        ))}
      </div>
    </div>
  );
}
