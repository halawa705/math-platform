/**
 * @file remedial-worksheet-studio-launcher.ts
 * @description جسر الترحيل التآزري من تشخيص نقاط الضعف إلى استوديو توليد ورقة العمل العلاجية (`/studio`).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 70 سطراً).
 */

import type { MathBranchId } from "@/core/ssot/math-branches-ssot";
import type { PsychometricQuestionDiagnostic } from "@/core/exam-grading/exam-diagnostic-metrics-calculator";
import {
  saveStudioGlobalContextSSOT,
  saveStudioWorksheetSettingsSSOT,
} from "@/core/ssot/studio-state-persistence-ssot";

export const MODULE_ID_REMEDIAL_WORKSHEET_STUDIO_LAUNCHER =
  "remedial_worksheet_studio_launcher" as const;

export function buildRemedialWorksheetDirectives(params: {
  readonly weakestQuestions: readonly PsychometricQuestionDiagnostic[];
}): {
  readonly branchId: MathBranchId;
  readonly lessonTitle: string;
  readonly customDirectives: string;
} {
  const weak = params.weakestQuestions
    .filter((q) => q.errorPct >= 30 || q.isFlaggedAmbiguous)
    .sort((a, b) => b.errorPct - a.errorPct)
    .slice(0, 3);
  const top = weak[0] ?? params.weakestQuestions[0];
  const branchId: MathBranchId = top?.branchId ?? "algebra";
  const lessons = Array.from(new Set(weak.map((q) => q.lessonTitleAr).filter(Boolean)));
  const lessonTitle =
    lessons.length > 0
      ? `شيت علاجي — ${lessons.slice(0, 2).join(" و ")}`
      : "شيت واجب علاجي للمفاهيم المتعثرة";

  const distractorNotes = weak
    .filter((q) => q.distractorBreakdown.length > 0)
    .map(
      (q) =>
        `سؤال ${q.displayOrderNumber} (${q.lessonTitleAr}): تجنّب فخ ${q.distractorBreakdown[0].choiceLetterAr} (${q.distractorBreakdown[0].shareOfErrorsPct}٪ من الأخطاء)`
    );

  const customDirectives = [
    lessons.length > 0 ? `التركيز العلاجي على دروس: ${lessons.join("، ")}.` : "",
    distractorNotes.length > 0 ? `الأخطاء الشائعة المستهدفة: ${distractorNotes.join(" | ")}.` : "",
    "تدرّج من التمهيد المبسط إلى التطبيق المباشر مع تنبيه قصير على الخطأ الشائع.",
  ]
    .filter(Boolean)
    .join(" ");

  return { branchId, lessonTitle, customDirectives };
}

export function prepareRemedialWorksheetInStudio(params: {
  readonly gradeId: string;
  readonly weakestQuestions: readonly PsychometricQuestionDiagnostic[];
}): void {
  const built = buildRemedialWorksheetDirectives({
    weakestQuestions: params.weakestQuestions,
  });
  saveStudioGlobalContextSSOT({
    activeTabId: "worksheet",
    gradeId: params.gradeId,
    branchId: built.branchId,
    lessonTitle: built.lessonTitle,
    targetedScopeText: built.lessonTitle,
    sheetTitle: built.lessonTitle,
  });
  saveStudioWorksheetSettingsSSOT({
    mcqCount: 8,
    mcqEnabled: true,
    essayCount: 4,
    essayEnabled: true,
    targetedUnitsOrLessons: built.lessonTitle,
    customDirectives: built.customDirectives,
  });
}
