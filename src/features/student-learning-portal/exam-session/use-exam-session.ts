"use client";

/**
 * @file use-exam-session.ts
 * @description خطاف إدارة جلسة الاختبار الإلكتروني للطالب (اختيار الوضع، الحفظ السحابي كل 30 ثانية ضد الانقطاع،
 * قفل وضع التدريب باتجاه واحد، المحاولة الرسمية الأولى فقط، والتدريب المؤقت بلا تخزين) + محاكاة المعلم.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 295 سطراً).
 */

import { useEffect, useState, useCallback, useRef } from "react";
import type { LockedTrainingQuestionFeedback, OnlineExamSessionMode } from "@/core/auth/exam-attempt-state-server-store";
import type { OnlineQuestionResult, StudentAnswerInput } from "@/core/exam-grading/online-exam-grader";
import type { PublishedOnlineExam } from "@/features/electronic-exams-hub/published-online-exams-store";
import { findStudentSubmissionForExamSSOT } from "@/features/teacher-home-dashboard/grade-honor-roll-ssot";
import { buildExamDraftStorageKey, loadPersistentExamDraft, savePersistentExamDraft } from "./exam-draft-persistent-storage";
import { checkTrainingQuestionApi, saveExamDraftApi, startExamSessionApi } from "./exam-session-api-client";
import { executeExamSubmitAction } from "./exam-session-submit-helper";

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
  const [remainingSeconds, setRemainingSeconds] = useState<number>((exam?.durationMinutes || 60) * 60);
  const [startedAtIso, setStartedAtIso] = useState<string>("");
  const [needsModeSelection, setNeedsModeSelection] = useState(false);
  const [startingMode, setStartingMode] = useState<OnlineExamSessionMode | null>(null);
  const [lockedMode, setLockedMode] = useState<OnlineExamSessionMode | null>(null);
  const [lockedQuestionIds, setLockedQuestionIds] = useState<readonly string[]>([]);
  const [lockedFeedbackByQuestion, setLockedFeedbackByQuestion] = useState<Record<string, LockedTrainingQuestionFeedback>>({});
  const [checkingQuestionId, setCheckingQuestionId] = useState<string | null>(null);
  const [isEphemeralPracticeMode, setIsEphemeralPracticeMode] = useState(false);
  const [officialResultPct, setOfficialResultPct] = useState<number | null>(null);
  const [autoSubmittedFromDraftNotice, setAutoSubmittedFromDraftNotice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultPct, setResultPct] = useState<number | null>(null);
  const [resultItems, setResultItems] = useState<readonly OnlineQuestionResult[]>([]);
  const [reviewList, setReviewList] = useState<readonly ExamQuestionReviewInfo[] | null>(null);
  const [lastDraftSavedAtIso, setLastDraftSavedAtIso] = useState<string | null>(null);
  const deadlineMsRef = useRef<number | null>(null);
  const answersRef = useRef<Record<string, StudentAnswerInput>>({});
  answersRef.current = answers;
  const draftKey = exam ? buildExamDraftStorageKey(exam.examId, studentCode) : "";

  const resetSimulation = useCallback(() => {
    setErrorMsg(null); setResultPct(null); setResultItems([]); setReviewList(null);
    setFlaggedIds({}); setAnswers({}); setLockedMode("exam");
    if (exam) {
      const initialSec = (exam.durationMinutes || 60) * 60;
      setRemainingSeconds(initialSec);
      deadlineMsRef.current = Date.now() + initialSec * 1000;
    }
  }, [exam]);

  useEffect(() => {
    setErrorMsg(null); setResultPct(null); setOfficialResultPct(null); setResultItems([]);
    setReviewList(null); setFlaggedIds({}); setNeedsModeSelection(false); setStartingMode(null);
    setLockedMode(isTeacherPreview ? "exam" : null); setLockedQuestionIds([]); setLockedFeedbackByQuestion({});
    setCheckingQuestionId(null); setIsEphemeralPracticeMode(false); setAutoSubmittedFromDraftNotice(false);
    if (!exam) return;

    const initialSec = (exam.durationMinutes || 60) * 60;
    setRemainingSeconds(initialSec);
    deadlineMsRef.current = isTeacherPreview ? Date.now() + initialSec * 1000 : null;
    const restoredLocal = draftKey ? loadPersistentExamDraft(draftKey) : null;
    setAnswers(restoredLocal ? { ...restoredLocal.answers } : {});
    setLastDraftSavedAtIso(restoredLocal?.savedAtIso ?? null);
    if (isTeacherPreview || !studentCode) return;

    const prevLocalSub = findStudentSubmissionForExamSSOT(exam.examId, studentCode);
    if (prevLocalSub) {
      setResultPct(prevLocalSub.percentageScore);
      setOfficialResultPct(prevLocalSub.percentageScore);
      if (prevLocalSub.resultJson?.items) setResultItems(prevLocalSub.resultJson.items);
      if (prevLocalSub.answersJson) setAnswers(prevLocalSub.answersJson as Record<string, StudentAnswerInput>);
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await startExamSessionApi(exam.examId);
        if (cancelled) return;
        if (res.status === 409 && res.alreadySubmitted && res.percentage !== undefined) {
          setResultPct(res.percentage); setOfficialResultPct(res.percentage);
          if (res.result?.items) setResultItems(res.result.items);
          if (res.answersJson) setAnswers(res.answersJson as Record<string, StudentAnswerInput>);
          if (res.review !== undefined) setReviewList(res.review);
          return;
        }
        if (res.needsModeSelection) { setNeedsModeSelection(true); return; }
        if (res.ok && res.startedAtIso && res.serverNowIso) {
          setStartedAtIso(res.startedAtIso);
          setLockedMode(res.lockedMode ?? "exam");
          setLockedQuestionIds(res.lockedQuestionIds ?? []);
          setLockedFeedbackByQuestion(res.lockedFeedbackByQuestion ?? {});
          if (res.savedDraftAnswers) {
            const lockedSet = new Set(res.lockedQuestionIds ?? []);
            const merged: Record<string, StudentAnswerInput> = { ...(restoredLocal?.answers ?? {}) };
            for (const [k, v] of Object.entries(res.savedDraftAnswers)) {
              if (v && (lockedSet.has(k) || !merged[k])) merged[k] = v;
            }
            setAnswers(merged);
          }
          const elapsedMs = Math.max(0, Date.parse(res.serverNowIso) - Date.parse(res.startedAtIso));
          const totalMs = (res.durationMinutes || exam.durationMinutes || 60) * 60_000;
          const leftMs = Math.max(0, totalMs - elapsedMs);
          deadlineMsRef.current = Date.now() + leftMs;
          setRemainingSeconds(Math.ceil(leftMs / 1000));
        }
      } catch { setNeedsModeSelection(true); }
    })();
    return () => { cancelled = true; };
  }, [exam, studentCode, isTeacherPreview, draftKey]);

  const startExamWithMode = useCallback(async (mode: OnlineExamSessionMode) => {
    if (!exam || !studentCode || startingMode) return;
    setStartingMode(mode); setErrorMsg(null);
    try {
      const res = await startExamSessionApi(exam.examId, mode);
      if (res.status === 409 && res.alreadySubmitted && res.percentage !== undefined) {
        setNeedsModeSelection(false); setResultPct(res.percentage); setOfficialResultPct(res.percentage);
        if (res.result?.items) setResultItems(res.result.items);
        if (res.review !== undefined) setReviewList(res.review);
        return;
      }
      if (!res.ok || !res.startedAtIso || !res.serverNowIso) {
        setErrorMsg(res.error || "تعذر بدء جلسة الاختبار."); return;
      }
      setNeedsModeSelection(false); setLockedMode(res.lockedMode ?? mode);
      setStartedAtIso(res.startedAtIso); setLockedQuestionIds(res.lockedQuestionIds ?? []);
      setLockedFeedbackByQuestion(res.lockedFeedbackByQuestion ?? {});
      const elapsedMs = Math.max(0, Date.parse(res.serverNowIso) - Date.parse(res.startedAtIso));
      const leftMs = Math.max(0, (res.durationMinutes || exam.durationMinutes || 60) * 60_000 - elapsedMs);
      deadlineMsRef.current = Date.now() + leftMs;
      setRemainingSeconds(Math.ceil(leftMs / 1000));
    } catch { setErrorMsg("تعذر الاتصال بالخادم لبدء الاختبار."); }
    finally { setStartingMode(null); }
  }, [exam, studentCode, startingMode]);

  const updateAnswer = useCallback((questionId: string, patch: StudentAnswerInput) => {
    if (lockedMode === "training" && lockedQuestionIds.includes(questionId)) return;
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: { ...prev[questionId], ...patch } };
      if (draftKey && !isEphemeralPracticeMode) setLastDraftSavedAtIso(savePersistentExamDraft(draftKey, next));
      return next;
    });
  }, [draftKey, lockedMode, lockedQuestionIds, isEphemeralPracticeMode]);

  const toggleFlag = useCallback((questionId: string) => {
    setFlaggedIds((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  }, []);

  const confirmTrainingQuestion = useCallback(async (questionId: string): Promise<boolean> => {
    if (!exam || lockedMode !== "training" || lockedQuestionIds.includes(questionId) || checkingQuestionId) return false;
    setCheckingQuestionId(questionId); setErrorMsg(null);
    try {
      const res = await checkTrainingQuestionApi({ examCode: exam.examId, questionId, answer: answersRef.current[questionId] ?? {} });
      if ((res.ok || res.alreadyLocked) && res.feedback) {
        setLockedQuestionIds((prev) => (prev.includes(questionId) ? prev : [...prev, questionId]));
        setLockedFeedbackByQuestion((prev) => ({ ...prev, [questionId]: res.feedback! }));
        return true;
      }
      setErrorMsg(res.error || "تعذر تأكيد إجابة السؤال."); return false;
    } catch { setErrorMsg("تعذر الاتصال بالخادم للتحقق من السؤال."); return false; }
    finally { setCheckingQuestionId(null); }
  }, [exam, lockedMode, lockedQuestionIds, checkingQuestionId]);

  const submitExam = useCallback(async () => {
    if (!exam || submitting || resultPct !== null || (!isTeacherPreview && !studentCode)) return;
    setSubmitting(true); setErrorMsg(null);
    const out = await executeExamSubmitAction({
      exam, studentCode, studentNameAr, isTeacherPreview, isEphemeralPracticeMode,
      answers: answersRef.current, startedAtIso, draftKey,
    });
    if (!out.ok) {
      setErrorMsg(out.error || "تعذر تسليم الاختبار.");
      setSubmitting(false);
      return;
    }
    if (out.autoSubmittedFromDraft) setAutoSubmittedFromDraftNotice(true);
    if (out.answersUsed) setAnswers(out.answersUsed as Record<string, StudentAnswerInput>);
    setResultPct(out.percentage ?? 0);
    if (out.isOfficialSaved) setOfficialResultPct(out.percentage ?? 0);
    setResultItems(out.items ?? []);
    if (out.review !== undefined) setReviewList(out.review);
    if (out.isOfficialSaved) onExamSubmitted?.();
    setSubmitting(false);
  }, [exam, studentCode, studentNameAr, isTeacherPreview, isEphemeralPracticeMode, submitting, resultPct, startedAtIso, draftKey, onExamSubmitted]);

  const startEphemeralPracticeRetry = useCallback(() => {
    setErrorMsg(null); setResultPct(null); setResultItems([]); setReviewList(null); setFlaggedIds({});
    setAnswers({}); setLockedQuestionIds([]); setLockedFeedbackByQuestion({});
    setNeedsModeSelection(false); setLockedMode("exam"); setIsEphemeralPracticeMode(true);
  }, []);

  const exitEphemeralPracticeRetry = useCallback(async () => {
    if (!exam || !studentCode) return;
    setIsEphemeralPracticeMode(false); setErrorMsg(null);
    const prev = findStudentSubmissionForExamSSOT(exam.examId, studentCode);
    if (prev) {
      setResultPct(prev.percentageScore); setOfficialResultPct(prev.percentageScore);
      if (prev.resultJson?.items) setResultItems(prev.resultJson.items);
      if (prev.answersJson) setAnswers(prev.answersJson as Record<string, StudentAnswerInput>);
    }
    try {
      const res = await startExamSessionApi(exam.examId);
      if (res.review !== undefined) setReviewList(res.review);
    } catch { /* ignore */ }
  }, [exam, studentCode]);

  useEffect(() => {
    if (!exam || isTeacherPreview || isEphemeralPracticeMode || !studentCode || resultPct !== null || !lockedMode) return;
    const syncDraft = (keepalive = false) => {
      void saveExamDraftApi(exam.examId, answersRef.current, keepalive).then((r) => {
        if (r.savedAtIso && !keepalive) setLastDraftSavedAtIso(r.savedAtIso);
      });
    };
    const interval = window.setInterval(() => syncDraft(false), 30_000);
    const onHide = () => { if (document.visibilityState === "hidden") syncDraft(true); };
    document.addEventListener("visibilitychange", onHide);
    return () => { window.clearInterval(interval); document.removeEventListener("visibilitychange", onHide); };
  }, [exam, studentCode, isTeacherPreview, isEphemeralPracticeMode, resultPct, lockedMode]);

  useEffect(() => {
    if (!exam || resultPct !== null || needsModeSelection || isEphemeralPracticeMode) return;
    const timer = window.setInterval(() => {
      if (!deadlineMsRef.current) return;
      const leftSec = Math.max(0, Math.ceil((deadlineMsRef.current - Date.now()) / 1000));
      setRemainingSeconds(leftSec);
      if (leftSec <= 0) { window.clearInterval(timer); void submitExam(); }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [exam, resultPct, needsModeSelection, isEphemeralPracticeMode, submitExam]);

  return {
    answers, flaggedIds, remainingSeconds, submitting, errorMsg, resultPct, officialResultPct,
    resultItems, reviewList, lastDraftSavedAtIso, needsModeSelection, startingMode, lockedMode,
    lockedQuestionIds, lockedFeedbackByQuestion, checkingQuestionId, isEphemeralPracticeMode,
    autoSubmittedFromDraftNotice, startExamWithMode, confirmTrainingQuestion, updateAnswer,
    toggleFlag, submitExam, resetSimulation, startEphemeralPracticeRetry, exitEphemeralPracticeRetry,
  };
}
