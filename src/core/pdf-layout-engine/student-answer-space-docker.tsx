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

  const gapClass = lineCount <= 4 ? "gap-1.5" : lineCount <= 7 ? "gap-1" : "gap-0.5";
  const itemHeightClass = lineCount <= 4 ? "h-3" : lineCount <= 7 ? "h-2.5" : "h-2";

  const renderLine = (lineIdx: number) =>
    answerSpaceStyle === "dotted" ? (
      <div className="flex-1 min-w-0 h-full flex items-end">
        <svg className="w-full h-[2px] block overflow-visible" aria-hidden="true">
          <line x1="0" y1="1" x2="100%" y2="1" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 3.5" />
        </svg>
      </div>
    ) : (
      <div
        key={lineIdx}
        className={`flex-1 min-w-0 h-full ${
          answerSpaceStyle === "lined" ? "border-b border-solid border-slate-300" : "bg-white border border-slate-200"
        }`}
      />
    );

  /* التسمية تشغل نفس صف السطر الأول (توفير صف كامل لكل بطاقة دون تقليل أسطر الكتابة). */
  return (
    <div className={`mt-auto px-2 pb-1.5 pt-1 bg-white border-t border-slate-200 flex flex-col ${gapClass}`}>
      {Array.from({ length: lineCount }, (_, i) => i + 1).map((lineIdx) => (
        <div key={lineIdx} className={`${itemHeightClass} w-full flex items-end gap-2`} style={lineIdx === 1 ? { minHeight: "1.1em" } : undefined}>
          {lineIdx === 1 && (
            <span style={{ color: labelColor }} className="text-[0.74em] font-black leading-none shrink-0 select-none self-center">
              {labelText}
            </span>
          )}
          {renderLine(lineIdx)}
        </div>
      ))}
    </div>
  );
}