"use client";

/**
 * @file student-assigned-exams-tab.tsx
 * @description تبويب الاختبار الإلكتروني الحي للطالب: يجمع المؤقت الزمني، الشكل الهندسي المتجهي،
 * لوحة الرموز الرياضية الافتراضية للهاتف، المقيم الفوري، وشهادة التفوق.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import { useState } from "react";
import SafeKaTeXBiDiMathRenderer from "@/components/global-ui/safe-katex-bidi-math-renderer";
import StudentVirtualMathKeypad from "@/features/electronic-exams-hub/student-virtual-math-keypad";
import LiveExamCountdownTimer from "@/features/electronic-exams-hub/live-exam-countdown-timer";
import { evaluateStudentLiveExamSubmission } from "@/features/electronic-exams-hub/live-exam-instant-evaluator";
import StudentHonorCertificateGenerator from "@/features/electronic-exams-hub/student-honor-certificate-generator";
import StudentMistakeAnalyticsBreakdown from "@/features/electronic-exams-hub/student-mistake-analytics-breakdown";
import { buildTriangleMidsegmentFigure } from "@/core/geometry-engine/triangle-family/triangle-midsegment-branch";
import { projectGeometryFigureToSVGMarkup } from "@/core/geometry-engine/vector-svg-figure-projector";

export const MODULE_ID_STUDENT_ASSIGNED_EXAMS_TAB =
  "student_assigned_exams_tab" as const;

export default function StudentAssignedExamsTab() {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(0);
  const [studentProofInput, setStudentProofInput] = useState<string>(
    "بما أن د منتصف أ ب، هـ منتصف أ جـ إذن د هـ يوازي ب جـ ويساوي ٦ سم"
  );
  const [submitted, setSubmitted] = useState<boolean>(false);

  const geometryFigure = buildTriangleMidsegmentFigure({
    figureId: "student_exam_fig",
    thirdSideLengthCm: 12,
    notationLanguage: "arabic",
  });

  const svgMarkup = projectGeometryFigureToSVGMarkup(geometryFigure, {
    widthPx: 250,
    heightPx: 165,
    strokeColorHex: "#1E1B4B",
    accentColorHex: "#0D9488",
    numeralMode: "eastern",
  });

  const evaluation = evaluateStudentLiveExamSubmission([
    {
      questionId: "q_geom_1",
      allocatedMarks: 4,
      expectedChoiceIndex: 0,
      selectedChoiceIndex: selectedChoice,
      expectedKeywordsInProof: ["منتصف", "6"],
      studentWrittenProof: studentProofInput,
    },
  ]);

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-900 text-white text-xs font-black">
            السؤال الأول • هندسة مستوية (٤ درجات)
          </span>
          <LiveExamCountdownTimer initialDurationSeconds={1800} isPaused={submitted} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-7 text-sm font-bold leading-relaxed">
            <SafeKaTeXBiDiMathRenderer text="في الشكل المقابل: $د$ منتصف $أ ب$، $هـ$ منتصف $أ جـ$، وطول $ب جـ = 12$ سم. فإن طول القطعة المستقيمة $د هـ$ يساوي:" />
          </div>
          <div
            className="sm:col-span-5 p-2 rounded-xl bg-white border border-slate-200 flex justify-center"
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {["٦ سم", "٨ سم", "١٢ سم", "٢٤ سم"].map((choice, idx) => {
            const isPicked = selectedChoice === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedChoice(idx)}
                className={`min-h-[48px] px-3 py-2 rounded-xl border text-xs sm:text-sm font-black transition cursor-pointer ${
                  isPicked
                    ? "border-teal-600 bg-teal-600 text-white shadow-md"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                }`}
              >
                {choice}
              </button>
            );
          })}
        </div>

        <div className="pt-2 space-y-2">
          <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-300">
            ✍️ اكتب خطوات البرهان الاستدلالي (بما أن ∵ ... إذن ∴ ...):
          </label>
          <textarea
            rows={2}
            value={studentProofInput}
            onChange={(e) => setStudentProofInput(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-bold"
          />
          <StudentVirtualMathKeypad
            onInsertSymbol={(sym) => setStudentProofInput((prev) => prev + sym)}
            onClear={() => setStudentProofInput("")}
          />
        </div>

        <button
          type="button"
          onClick={() => setSubmitted(true)}
          className="w-full min-h-[48px] py-3 rounded-2xl bg-gradient-to-l from-indigo-900 to-teal-700 text-white text-sm font-black shadow-lg cursor-pointer"
        >
          تسليم الإجابة وتصحيح البرهان فوراً ✓
        </button>
      </div>

      {submitted && (
        <div className="space-y-3">
          <StudentHonorCertificateGenerator
            studentNameArabic="طالب منصة الخوارزمي"
            examTitleArabic="اختبار الهندسة المستوية — نظريات المثلث"
            percentageScore={evaluation.percentageScore}
          />
          <StudentMistakeAnalyticsBreakdown />
        </div>
      )}
    </div>
  );
}
