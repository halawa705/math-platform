"use client";

/**
 * @file student-answer-space-docker.tsx
 * @description مصير مساحات إجابة الطالب (الأسطر المنقطة أو المصمتة) لتدريبات حاول بنفسك وتمارين الواجب.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 70 سطراً).
 */

import type { AnswerSpaceStyleMode } from "../ssot/pdf-print-settings-ssot";

export interface StudentAnswerSpaceDockerProps {
  readonly isBookletDrill: boolean;
  readonly isBookletHomework: boolean;
  readonly primaryHex: string;
  readonly answerSpaceStyle: AnswerSpaceStyleMode;
  readonly isMcq?: boolean;
  readonly lineCount?: 1 | 2 | 3;
}

export function StudentAnswerSpaceDocker({
  isBookletDrill,
  isBookletHomework,
  primaryHex,
  answerSpaceStyle,
  isMcq = false,
  lineCount = 2,
}: StudentAnswerSpaceDockerProps) {
  if (answerSpaceStyle === "hidden" || isMcq) return null;

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

  return (
    <div className="px-2.5 pb-2.5 pt-1.5 bg-slate-50/70 border-t border-dashed border-slate-300 space-y-1.5">
      <div style={{ color: labelColor }} className="text-[0.8em] font-black text-left">
        {labelText}
      </div>
      {Array.from({ length: lineCount }, (_, i) => i + 1).map((lineIdx) => (
        <div key={lineIdx} className={`h-3.5 w-full ${lineStyleClass}`} />
      ))}
    </div>
  );
}
