"use client";

/**
 * @file use-exam-session.ts
 * @description خطاف إدارة جلسة الاختبار الإلكتروني للطالب:
 * يستدعي `/api/exams/start` لحساب الوقت المتبقي من وقت الخادم الفعلي (لا يعيد الضبط عند التحديث)،
 * ويحفظ مسودة الإجابات في `sessionStorage` فقط، ويرسل التسليم لـ `/api/exams/submit`.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 195 سطراً).
 */

import { useEffect, useState, useCallback, useRef } from "react";
import type { OnlineQuestionResult, StudentAnswerInput } from "@/core/exam-grading/online-exam-grader";
import type { PublishedOnlineExam } from "@/features/electronic-exams-hub/published-online-exams-store";
import {
  findStudentSubmissionForExamSSOT,
  recordStudentOnlineExamSubmissionSSOT,
} from "@/features/teacher-home-dashboard/grade-honor-roll-ssot";

export const MODULE_ID_USE_EXAM_SESSION = "use_exam_session" as const;

export interface ExamQuestionReviewInfo {
  readonly questionId: string;
  readonly correctMcqChoiceIndex?: number;
  readonly finalAnswerArabic: string;
  readonly modelSolutionStepsArabic: readonly string[];
}

export function useExamSession(params: {
  readonly exam: PublishedOnlineExam | null;
  readonly studentCode?: string;
  readonly studentNameAr: string;
  readonly isTeacherPreview: boolean;
  readonly onExamSubmitted?: () => void;
}) {
  const { exam, studentCode, studentNameAr, isTeacherPreview, onExamSubmitted } = params;
  const [answers, setAnswers] = useState<Record<string, StudentAnswerInput>>({});
  const [flaggedIds, setFlaggedIds] = useState<Record<string, boolean>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number>((exam?.durationMinutes || 30) * 60);
  const [startedAtIso, setStartedAtIso] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultPct, setResultPct] = useState<number | null>(null);
  const [resultItems, setResultItems] = useState<readonly OnlineQuestionResult[]>([]);
  const [reviewList, setReviewList] = useState<readonly ExamQuestionReviewInfo[] | null>(null);
  const deadlineMsRef = useRef<number | null>(null);

  const draftKey = exam && studentCode ? `exam_draft_${exam.examId}_${studentCode}` : "";

  useEffect(() => {
    setErrorMsg(null);
    setResultPct(null);
    setResultItems([]);
    setReviewList(null);
    setFlaggedIds({});
    if (!exam) return;

    const initialSec = (exam.durationMinutes || 30) * 60;
    setRemainingSeconds(initialSec);

    if (draftKey && typeof window !== "undefined") {
      try {
        const raw = window.sessionStorage.getItem(draftKey);
        setAnswers(raw ? (JSON.parse(raw) as Record<string, StudentAnswerInput>) : {});
      } catch {
        setAnswers({});
      }
    } else {
      setAnswers({});
    }

    if (studentCode) {
      const prev = findStudentSubmissionForExamSSOT(exam.examId, studentCode);
      if (prev) {
        setResultPct(prev.percentageScore);
        if (prev.resultJson?.items) setResultItems(prev.resultJson.items);
        if (prev.answersJson) setAnswers(prev.answersJson as Record<string, StudentAnswerInput>);
        return;
      }
    }

    if (isTeacherPreview || !studentCode) return;

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/exams/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ examCode: exam.examId }),
        });
        const data = (await res.json()) as {
          success: boolean; alreadySubmitted?: boolean; percentage?: number;
          startedAtIso?: string; serverNowIso?: string; durationMinutes?: number;
        };
        if (cancelled) return;
        if (res.status === 409 && data.alreadySubmitted && data.percentage !== undefined) {
          setResultPct(data.percentage);
          return;
        }
        if (res.ok && data.startedAtIso && data.serverNowIso) {
          setStartedAtIso(data.startedAtIso);
          const elapsedMs = Math.max(0, Date.parse(data.serverNowIso) - Date.parse(data.startedAtIso));
          const totalMs = (data.durationMinutes || exam.durationMinutes || 30) * 60_000;
          const leftMs = Math.max(0, totalMs - elapsedMs);
          deadlineMsRef.current = Date.now() + leftMs;
          setRemainingSeconds(Math.ceil(leftMs / 1000));
        } else {
          deadlineMsRef.current = Date.now() + initialSec * 1000;
        }
      } catch {
        deadlineMsRef.current = Date.now() + initialSec * 1000;
      }
    })();

    return () => { cancelled = true; };
  }, [exam, studentCode, isTeacherPreview, draftKey]);

  const updateAnswer = useCallback(
    (questionId: string, patch: StudentAnswerInput) => {
      setAnswers((prev) => {
        const next = { ...prev, [questionId]: { ...prev[questionId], ...patch } };
        if (draftKey && typeof window !== "undefined") {
          try { window.sessionStorage.setItem(draftKey, JSON.stringify(next)); } catch { /* ignore */ }
        }
        return next;
      });
    },
    [draftKey]
  );

  const toggleFlag = useCallback((questionId: string) => {
    setFlaggedIds((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  }, []);

  const submitExam = useCallback(async () => {
    if (!exam || !studentCode || isTeacherPreview || submitting || resultPct !== null) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/exams/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examCode: exam.examId, studentNameAr, answers }),
      });
      const data = (await res.json()) as {
        success: boolean; percentage?: number; totalEarnedMarks?: number; totalAllocatedMarks?: number;
        items?: readonly OnlineQuestionResult[]; review?: readonly ExamQuestionReviewInfo[] | null; error?: string;
      };
      if (!res.ok && res.status !== 409) {
        setErrorMsg(data.error || "تعذر تسليم الاختبار.");
        setSubmitting(false);
        return;
      }
      const pct = data.percentage ?? 0;
      const items = data.items ?? [];
      setResultPct(pct);
      setResultItems(items);
      setReviewList(data.review ?? null);
      recordStudentOnlineExamSubmissionSSOT({
        exam, studentCode, studentNameAr, percentageScore: pct,
        startedAtIso: startedAtIso || new Date().toISOString(),
        answersJson: answers,
        resultJson: {
          items, totalEarnedMarks: data.totalEarnedMarks ?? 0, totalAllocatedMarks: data.totalAllocatedMarks ?? 0, percentage: pct,
        },
      });
      if (draftKey && typeof window !== "undefined") window.sessionStorage.removeItem(draftKey);
      onExamSubmitted?.();
    } catch {
      setErrorMsg("تعذر الاتصال بالخادم لتسليم الاختبار.");
    } finally {
      setSubmitting(false);
    }
  }, [exam, studentCode, studentNameAr, isTeacherPreview, submitting, resultPct, answers, startedAtIso, draftKey, onExamSubmitted]);

  useEffect(() => {
    if (!exam || isTeacherPreview || resultPct !== null) return;
    const timer = window.setInterval(() => {
      if (!deadlineMsRef.current) return;
      const leftSec = Math.max(0, Math.ceil((deadlineMsRef.current - Date.now()) / 1000));
      setRemainingSeconds(leftSec);
      if (leftSec <= 0) {
        window.clearInterval(timer);
        void submitExam();
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [exam, isTeacherPreview, resultPct, submitExam]);

  return {
    answers, flaggedIds, remainingSeconds, submitting, errorMsg, resultPct, resultItems, reviewList,
    updateAnswer, toggleFlag, submitExam,
  };
}
