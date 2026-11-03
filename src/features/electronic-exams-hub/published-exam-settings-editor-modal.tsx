"use client";

/**
 * @file published-exam-settings-editor-modal.tsx
 * @description نافذة تعديل الاختبار المنشور أو المؤرشف: تعديل العنوان، زيادة/إنقاص زمن الامتحان بالدقائق،
 * زيادة/إنقاص مدة العرض بالأيام، وتعديل نصوص الأسئلة والبدائل والإجابة الصحيحة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 230 سطراً).
 */

import { useState } from "react";
import {
  loadLocalExamAnswerKeySSOT,
  saveLocalExamAnswerKeySSOT,
  updateOnlineExamSettingsSSOT,
  type PublishedExamQuestionItem,
  type PublishedOnlineExam,
} from "./published-online-exams-store";

export const MODULE_ID_PUBLISHED_EXAM_SETTINGS_EDITOR_MODAL =
  "published_exam_settings_editor_modal" as const;

const CHOICE_LETTERS = ["أ", "ب", "جـ", "د"] as const;

export interface PublishedExamSettingsEditorModalProps {
  readonly exam: PublishedOnlineExam;
  readonly onClose: () => void;
  readonly onSaved: () => void;
}

export default function PublishedExamSettingsEditorModal({
  exam,
  onClose,
  onSaved,
}: PublishedExamSettingsEditorModalProps) {
  const [titleAr, setTitleAr] = useState(exam.titleAr);
  const [durationMinutes, setDurationMinutes] = useState(exam.durationMinutes || 30);
  const [availabilityDays, setAvailabilityDays] = useState(exam.availabilityDays || 7);
  const [status, setStatus] = useState<"active" | "archived">(exam.status);
  const [questions, setQuestions] = useState<readonly PublishedExamQuestionItem[]>(exam.questions);
  const [answerKey, setAnswerKey] = useState(() => loadLocalExamAnswerKeySSOT(exam.examId) ?? []);
  const [openQIdx, setOpenQIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const updateQuestionItem = (idx: number, patch: Partial<PublishedExamQuestionItem>) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };

  const updateCorrectChoice = (questionId: string, choiceIdx: 0 | 1 | 2 | 3) => {
    setAnswerKey((prev) => {
      if (prev.some((k) => k.questionId === questionId)) {
        return prev.map((k) => (k.questionId === questionId ? { ...k, correctMcqChoiceIndex: choiceIdx } : k));
      }
      return [
        ...prev,
        {
          questionId, answerMode: "mcq" as const, allocatedMarks: 1, correctMcqChoiceIndex: choiceIdx,
          acceptedAnswers: [], modelSolutionStepsArabic: [], finalAnswerArabic: CHOICE_LETTERS[choiceIdx],
        },
      ];
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (answerKey.length > 0) saveLocalExamAnswerKeySSOT(exam.examId, answerKey);
      const updated = updateOnlineExamSettingsSSOT({
        examId: exam.examId, titleAr, durationMinutes, availabilityDays, status,
      });
      if (updated && typeof window !== "undefined") {
        const raw = window.localStorage.getItem("math_platform_published_exams_v2");
        if (raw) {
          const list = JSON.parse(raw) as PublishedOnlineExam[];
          const withQs = list.map((e) => (e.examId === exam.examId ? { ...e, questions } : e));
          window.localStorage.setItem("math_platform_published_exams_v2", JSON.stringify(withQs));
        }
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir="rtl" className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-black">⚙️ تعديل إعدادات وأسئلة الاختبار</h3>
            <p className="text-[11px] font-bold text-slate-500">{exam.gradeNameArabic}</p>
          </div>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black cursor-pointer">✕</button>
        </div>

        <div className="space-y-3 text-xs">
          <label className="block space-y-1">
            <span className="font-black text-slate-700 dark:text-slate-300">🏷️ عنوان الاختبار:</span>
            <input type="text" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} className="w-full min-h-[42px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-black" />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-black text-slate-700 dark:text-slate-300 block">⏱️ زمن إجابة الطالب (دقيقة):</span>
              <div className="flex items-center justify-between gap-2">
                <button type="button" onClick={() => setDurationMinutes((m) => Math.max(5, m - 5))} className="min-w-[42px] min-h-[40px] rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-black cursor-pointer">-5</button>
                <input type="number" min={5} max={180} value={durationMinutes} onChange={(e) => setDurationMinutes(Math.max(5, Math.min(180, Number(e.target.value) || 30)))} className="w-20 min-h-[40px] text-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-black text-sm" />
                <button type="button" onClick={() => setDurationMinutes((m) => Math.min(180, m + 5))} className="min-w-[42px] min-h-[40px] rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-black cursor-pointer">+5</button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-black text-slate-700 dark:text-slate-300 block">⏳ مدة عرض الاختبار (أيام من الآن):</span>
              <div className="flex items-center justify-between gap-2">
                <button type="button" onClick={() => setAvailabilityDays((d) => Math.max(1, d - 1))} className="min-w-[42px] min-h-[40px] rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-black cursor-pointer">-1</button>
                <input type="number" min={1} max={365} value={availabilityDays} onChange={(e) => setAvailabilityDays(Math.max(1, Math.min(365, Number(e.target.value) || 7)))} className="w-20 min-h-[40px] text-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-black text-sm" />
                <button type="button" onClick={() => setAvailabilityDays((d) => Math.min(365, d + 1))} className="min-w-[42px] min-h-[40px] rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-black cursor-pointer">+1</button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="font-black">حالة الاختبار:</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setStatus("active")} className={`px-3 py-1.5 rounded-xl font-black cursor-pointer ${status === "active" ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-800"}`}>🟢 نشط ومتاح للطلاب</button>
              <button type="button" onClick={() => setStatus("archived")} className={`px-3 py-1.5 rounded-xl font-black cursor-pointer ${status === "archived" ? "bg-rose-600 text-white" : "bg-slate-200 dark:bg-slate-800"}`}>🗄️ في الأرشيف (مغلق)</button>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="font-black text-slate-700 dark:text-slate-300">📝 مراجعة وتعديل الأسئلة ({questions.length} سؤال):</div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const isOpen = openQIdx === idx;
                const keyItem = answerKey.find((k) => k.questionId === q.questionId);
                return (
                  <div key={q.questionId} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black truncate">س{idx + 1}: {q.promptArabic}</span>
                      <button type="button" onClick={() => setOpenQIdx(isOpen ? null : idx)} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-black shrink-0 cursor-pointer">
                        {isOpen ? "إغلاق" : "✏️ تعديل"}
                      </button>
                    </div>
                    {isOpen && (
                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <textarea rows={2} value={q.promptArabic} onChange={(e) => updateQuestionItem(idx, { promptArabic: e.target.value })} className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold" />
                        {q.mcqChoicesArabic && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {([0, 1, 2, 3] as const).map((cIdx) => {
                              const isCorrect = keyItem?.correctMcqChoiceIndex === cIdx;
                              return (
                                <div key={cIdx} className="flex items-center gap-1">
                                  <button type="button" onClick={() => updateCorrectChoice(q.questionId, cIdx)} className={`px-2 py-1 rounded font-black ${isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-800"}`}>{CHOICE_LETTERS[cIdx]}</button>
                                  <input
                                    type="text" value={q.mcqChoicesArabic?.[cIdx] || ""}
                                    onChange={(e) => {
                                      const next = [...(q.mcqChoicesArabic || ["", "", "", ""])];
                                      next[cIdx] = e.target.value;
                                      updateQuestionItem(idx, { mcqChoicesArabic: next });
                                    }}
                                    className="flex-1 p-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" onClick={onClose} className="min-h-[44px] px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black cursor-pointer">إلغاء</button>
          <button type="button" disabled={saving} onClick={() => void handleSave()} className="min-h-[44px] px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer">
            {saving ? "جارٍ الحفظ..." : "💾 حفظ التعديلات وتحديث الاختبار"}
          </button>
        </div>
      </div>
    </div>
  );
}
