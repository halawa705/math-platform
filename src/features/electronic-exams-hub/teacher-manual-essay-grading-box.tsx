"use client";

/**
 * @file teacher-manual-essay-grading-box.tsx
 * @description أداة تصحيح المعلم لصور الحلول المقالية في تسليمات الاختبار، مع حفظ الدرجة ومسح الصورة تلقائياً لتوفير المساحة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 150 سطراً).
 */

import { useState } from "react";
import type { PublishedExamQuestionItem } from "./published-online-exams-store";
import {
  updateSubmissionManualGradesSSOT,
  type OnlineExamSubmissionRecord,
} from "@/features/teacher-home-dashboard/grade-honor-roll-ssot";
import type { ManualQuestionGradeInput } from "@/core/exam-grading/manual-essay-grading-and-wipe";

export const MODULE_ID_TEACHER_MANUAL_ESSAY_GRADING_BOX =
  "teacher_manual_essay_grading_box" as const;

export interface TeacherManualEssayGradingBoxProps {
  readonly examQuestions: readonly PublishedExamQuestionItem[];
  readonly submission: OnlineExamSubmissionRecord;
}

export default function TeacherManualEssayGradingBox({
  examQuestions,
  submission,
}: TeacherManualEssayGradingBoxProps) {
  const manualTargets = examQuestions.filter((q) => {
    const ans = submission.answersJson?.[q.questionId];
    const res = submission.resultJson?.items.find((i) => i.questionId === q.questionId);
    return (
      q.answerMode === "essay_photo" ||
      Boolean(ans?.proofImageDataUrl) ||
      Boolean(res?.pendingTeacherReview)
    );
  });

  const [scores, setScores] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const q of manualTargets) {
      const res = submission.resultJson?.items.find((i) => i.questionId === q.questionId);
      init[q.questionId] = res?.earnedMarks ?? 0;
    }
    return init;
  });
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (manualTargets.length === 0) return null;

  const handleSaveAndWipe = async () => {
    setSaving(true);
    setStatusMsg(null);
    const gradesByQuestionId: Record<string, ManualQuestionGradeInput> = {};
    for (const q of manualTargets) {
      gradesByQuestionId[q.questionId] = {
        earnedMarks: Math.max(0, Math.min(q.allocatedMarks, scores[q.questionId] ?? 0)),
        teacherFeedback: notes[q.questionId]?.trim(),
      };
    }

    updateSubmissionManualGradesSSOT({
      submissionId: submission.submissionId,
      gradesByQuestionId,
    });

    try {
      const res = await fetch("/api/exams/manual-grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: submission.submissionId,
          examCode: submission.examId,
          studentCode: submission.studentCode,
          gradesByQuestionId,
        }),
      });
      if (res.ok) {
        setStatusMsg("✓ تم اعتماد الدرجة وحذف صور الحل تلقائياً لتوفير المساحة.");
      } else {
        setStatusMsg("✓ تم الحفظ محلياً (لم يكتمل التحديث السحابي بعد).");
      }
    } catch {
      setStatusMsg("✓ تم الحفظ محلياً في المتصفح.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800 space-y-2.5 text-xs">
      <div className="font-black text-amber-950 dark:text-amber-200">
        ✍️ مراجعة وتصحيح الأسئلة المقالية / صور الحل ({manualTargets.length})
      </div>

      {manualTargets.map((q) => {
        const ans = submission.answersJson?.[q.questionId];
        const rot = ans?.proofImageRotationDeg ?? 0;
        return (
          <div
            key={q.questionId}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2"
          >
            <div className="font-black text-slate-800 dark:text-slate-100">
              س{q.displayOrderNumber} (الدرجة العظمى: {q.allocatedMarks})
            </div>
            {ans?.text && (
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 font-bold text-slate-700 dark:text-slate-300">
                نص الطالب: {ans.text}
              </div>
            )}
            {ans?.proofImageDataUrl ? (
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ans.proofImageDataUrl}
                  alt={`حل س${q.displayOrderNumber}`}
                  style={{ transform: `rotate(${rot}deg)` }}
                  className="max-h-60 object-contain rounded-lg"
                />
              </div>
            ) : ans?.proofImageDeletedAfterGrading ? (
              <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                🧹 تم تصحيح الصورة وحذفها مسبقاً لتوفير المساحة.
              </div>
            ) : (
              <div className="text-[11px] font-bold text-slate-400">لم يرفع الطالب صورة حل.</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="number"
                min={0}
                max={q.allocatedMarks}
                step={0.5}
                value={scores[q.questionId] ?? 0}
                onChange={(e) =>
                  setScores((prev) => ({
                    ...prev,
                    [q.questionId]: Number(e.target.value),
                  }))
                }
                className="min-h-[40px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-black"
                aria-label={`درجة س${q.displayOrderNumber}`}
              />
              <input
                type="text"
                value={notes[q.questionId] ?? ""}
                onChange={(e) =>
                  setNotes((prev) => ({
                    ...prev,
                    [q.questionId]: e.target.value,
                  }))
                }
                placeholder="ملاحظة للطالب (اختياري)..."
                className="sm:col-span-2 min-h-[40px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
              />
            </div>
          </div>
        );
      })}

      <button
        type="button"
        disabled={saving}
        onClick={() => void handleSaveAndWipe()}
        className="w-full min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black cursor-pointer disabled:opacity-50"
      >
        {saving
          ? "جارٍ الحفظ وتنظيف الصور..."
          : "✓ اعتماد الدرجات ومسح صور الحل تلقائياً لتوفير المساحة"}
      </button>

      {statusMsg && (
        <div className="font-black text-emerald-700 dark:text-emerald-300">{statusMsg}</div>
      )}
    </div>
  );
}
