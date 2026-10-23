"use client";

/**
 * @file honor-roll-podium.tsx
 * @description منصة التتويج الموحدة لقاعة المتميزين (أول ٣ طلاب في صف واحد) تُستخدم في لوحة المعلم وبوابة الطالب.
 * تعرض دائماً ثلاثة أماكن واضحة: الطالب المتأهل (≥ ٧٠٪) أو مكان فارغ بانتظار متأهل جديد.
 */

import type { HonorStudentEntry } from "./grade-honor-roll-ssot";

export interface HonorRollPodiumProps {
  readonly gradeNameAr: string;
  readonly entries: readonly HonorStudentEntry[];
  readonly hasActiveExam: boolean;
  readonly activeExamTitleAr: string;
  readonly minPercentage: number;
  readonly showStudentCodes?: boolean;
}

const MEDALS = ["🥇", "🥈", "🥉"] as const;
const RANK_LABELS = ["المركز الأول", "المركز الثاني", "المركز الثالث"] as const;
const SLOT_TONES = [
  "from-amber-100/80 to-white border-amber-300",
  "from-slate-100 to-white border-slate-300",
  "from-orange-100/70 to-white border-orange-300",
] as const;

export default function HonorRollPodium({
  gradeNameAr,
  entries,
  hasActiveExam,
  activeExamTitleAr,
  minPercentage,
  showStudentCodes = false,
}: HonorRollPodiumProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-slate-500">
        {hasActiveExam
          ? `${gradeNameAr} — ${activeExamTitleAr} • تتحدث تلقائياً بعد كل تسليم (من ${minPercentage}٪ فأكثر)`
          : `${gradeNameAr} — لا يوجد اختبار نشط؛ ستظهر القاعة فور نشر اختبار جديد`}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[0, 1, 2].map((slot) => {
          const entry = hasActiveExam ? entries[slot] : undefined;
          if (!entry) {
            return (
              <div
                key={slot}
                className="p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1 bg-slate-50/60 dark:bg-slate-900/40"
              >
                <div className="text-2xl opacity-40">{MEDALS[slot]}</div>
                <div className="text-xs font-black text-slate-400">{RANK_LABELS[slot]}</div>
                <div className="text-[11px] font-bold text-slate-400">في انتظار طالب متأهل</div>
              </div>
            );
          }
          return (
            <div
              key={slot}
              className={`p-5 rounded-2xl border-2 bg-gradient-to-b text-center space-y-1.5 shadow-xs ${SLOT_TONES[slot]}`}
            >
              <div className="text-3xl">{MEDALS[slot]}</div>
              <div className="text-[11px] font-black text-slate-500">{RANK_LABELS[slot]}</div>
              <div className="text-sm font-black text-slate-900 leading-snug">
                {entry.studentNameAr}
              </div>
              {showStudentCodes && (
                <div className="text-[10px] font-mono font-bold text-slate-400">
                  كود: {entry.studentCode}
                </div>
              )}
              <div className="inline-block px-3 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-black">
                {entry.averagePercentage}٪
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
