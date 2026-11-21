"use client";

/**
 * @file exam-session-footer-controls.tsx
 * @description أزرار التنقل السفلية ومربع تأكيد تسليم الاختبار الإلكتروني للطالب.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 85 سطراً).
 */

export const MODULE_ID_EXAM_SESSION_FOOTER_CONTROLS =
  "exam_session_footer_controls" as const;

export interface ExamSessionFooterControlsProps {
  readonly safeIdx: number;
  readonly totalQ: number;
  readonly answeredCount: number;
  readonly isSubmitted: boolean;
  readonly isTraining: boolean;
  readonly isCurrentLocked: boolean;
  readonly isEphemeralPracticeMode: boolean;
  readonly isTeacherPreview: boolean;
  readonly confirmOpen: boolean;
  readonly submitting: boolean;
  readonly onPrev: () => void;
  readonly onNext: () => void;
  readonly onOpenConfirm: () => void;
  readonly onCloseConfirm: () => void;
  readonly onConfirmSubmit: () => void;
}

export default function ExamSessionFooterControls({
  safeIdx,
  totalQ,
  answeredCount,
  isSubmitted,
  isTraining,
  isCurrentLocked,
  isEphemeralPracticeMode,
  isTeacherPreview,
  confirmOpen,
  submitting,
  onPrev,
  onNext,
  onOpenConfirm,
  onCloseConfirm,
  onConfirmSubmit,
}: ExamSessionFooterControlsProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <button
          type="button"
          disabled={safeIdx === 0}
          onClick={onPrev}
          className="min-h-[46px] px-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-black disabled:opacity-40 cursor-pointer"
        >
          ➡ السؤال السابق
        </button>

        <div className="flex items-center gap-2">
          {!isSubmitted && safeIdx < totalQ - 1 && answeredCount > 0 && !isTraining && (
            <button
              type="button"
              onClick={onOpenConfirm}
              className="min-h-[46px] px-4 rounded-2xl bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 border border-emerald-400/50 text-xs font-black cursor-pointer"
            >
              إنهاء وتسليم ({answeredCount}/{totalQ}) ✓
            </button>
          )}
          {safeIdx < totalQ - 1 ? (
            <button
              type="button"
              disabled={!isSubmitted && isTraining && !isCurrentLocked}
              onClick={onNext}
              className="min-h-[46px] px-5 rounded-2xl bg-indigo-900 dark:bg-teal-600 text-white text-xs font-black disabled:opacity-45 cursor-pointer"
            >
              {!isSubmitted && isTraining && !isCurrentLocked
                ? "أكّد الإجابة للانتقال ⬅"
                : "السؤال التالي ⬅"}
            </button>
          ) : (
            !isSubmitted && (
              <button
                type="button"
                disabled={isTraining && !isCurrentLocked && answeredCount > 0}
                onClick={onOpenConfirm}
                className="min-h-[46px] px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isEphemeralPracticeMode
                  ? "إنهاء التدريب وعرض نتيجتي ✓"
                  : isTeacherPreview
                    ? "تسليم وتجربة التصحيح الآن ✓"
                    : "تسليم الاختبار الآن ✓"}
              </button>
            )
          )}
        </div>
      </div>

      {confirmOpen && !isSubmitted && (
        <div className="p-4 rounded-3xl bg-indigo-950 text-white space-y-3 text-center">
          <p className="text-xs sm:text-sm font-black">
            أجبت على {answeredCount} من {totalQ} أسئلة — هل أنت متأكد من إنهاء وتصحيح هذا الاختبار؟
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                onCloseConfirm();
                onConfirmSubmit();
              }}
              className="min-h-[44px] px-6 rounded-2xl bg-emerald-500 text-slate-950 text-xs font-black cursor-pointer"
            >
              {submitting ? "جارٍ التصحيح..." : "نعم، سلّم وصحّح الآن"}
            </button>
            <button
              type="button"
              onClick={onCloseConfirm}
              className="min-h-[44px] px-5 rounded-2xl bg-white/10 text-white text-xs font-black cursor-pointer"
            >
              مراجعة
            </button>
          </div>
        </div>
      )}
    </>
  );
}
