"use client";

/**
 * @file exam-result-screen.tsx
 * @description شاشة نتيجة الاختبار المتحركة للطالب: حلقة SVG دائرية متحركة، عدّاد متدرج، قصاصات الاحتفال، وشهادة التقدير.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

import { useEffect, useState } from "react";
import { MIN_HONOR_ROLL_PERCENTAGE_SSOT } from "@/features/teacher-home-dashboard/grade-honor-roll-ssot";
import StudentHonorCertificateGenerator from "@/features/electronic-exams-hub/student-honor-certificate-generator";
import ExamConfettiBurst from "./exam-confetti-burst";

export const MODULE_ID_EXAM_RESULT_SCREEN = "exam_result_screen" as const;

export interface ExamResultScreenProps {
  readonly studentNameAr: string;
  readonly examTitleAr: string;
  readonly percentageScore: number;
}

export default function ExamResultScreen({
  studentNameAr,
  examTitleAr,
  percentageScore,
}: ExamResultScreenProps) {
  const [animatedPct, setAnimatedPct] = useState(0);
  const isHonor = percentageScore >= MIN_HONOR_ROLL_PERCENTAGE_SSOT;

  useEffect(() => {
    let frame = 0;
    const totalFrames = 36;
    const interval = window.setInterval(() => {
      frame += 1;
      if (frame >= totalFrames) {
        setAnimatedPct(percentageScore);
        window.clearInterval(interval);
      } else {
        setAnimatedPct(Math.round((percentageScore * frame) / totalFrames));
      }
    }, 32);
    return () => window.clearInterval(interval);
  }, [percentageScore]);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentageScore / 100) * circumference;

  return (
    <div className="relative p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4 overflow-hidden">
      {isHonor && <ExamConfettiBurst />}

      <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-slate-100 dark:text-slate-800"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={isHonor ? "#10B981" : "#F59E0B"}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={
              {
                "--ring-total": `${circumference}`,
                "--ring-offset": `${offset}`,
                strokeDashoffset: offset,
              } as React.CSSProperties
            }
            className="exam-ring"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {animatedPct}٪
          </span>
          <span className="text-[10px] font-extrabold text-slate-400">
            النتيجة
          </span>
        </div>
      </div>

      <div
        className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-black ${
          isHonor
            ? "bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200"
            : "bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200"
        }`}
      >
        {isHonor
          ? `🎉 أحسنت يا ${studentNameAr || "بطل"}! درجتك ${percentageScore}٪ — دخلت قاعة المتميزين!`
          : `درجتك ${percentageScore}٪ — قاعة المتميزين تبدأ من ${MIN_HONOR_ROLL_PERCENTAGE_SSOT}٪، راجع الحلول بالأسفل وحاول في الاختبار القادم.`}
      </div>

      {isHonor && (
        <StudentHonorCertificateGenerator
          studentNameArabic={studentNameAr}
          examTitleArabic={examTitleAr}
          percentageScore={percentageScore}
        />
      )}
    </div>
  );
}
