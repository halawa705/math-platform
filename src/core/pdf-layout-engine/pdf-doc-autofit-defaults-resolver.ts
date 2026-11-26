/**
 * @file pdf-doc-autofit-defaults-resolver.ts
 * @description يحدد إعدادات التخطيط التلقائي (القالب، الأعمدة، الحد الأقصى للصفحات) لكل مستند:
 * يضمن تطبيق قالب الامتحان المدرسي الرسمي وهدف الصفحتين (targetMaxPages = 2) على كل من الاختبار الفردي وحزم النماذج.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 80 سطراً).
 */

import type { PDFPrintSettingsStateSSOT } from "../ssot/pdf-print-settings-ssot";
import type { PrintableMathQuestionItem } from "./a4-vector-html-sheet-renderer";
import type { PrintableExamFormGroup } from "./printable-exam-forms-model";

export const MODULE_ID_PDF_DOC_AUTOFIT_DEFAULTS_RESOLVER =
  "pdf_doc_autofit_defaults_resolver" as const;

export function resolveDocAutoFitDefaults(
  customTitle: string | undefined,
  customQuestions: readonly PrintableMathQuestionItem[] | undefined,
  customForms?: readonly PrintableExamFormGroup[]
): {
  readonly isBookletOrReview: boolean;
  readonly isExamDoc: boolean;
} {
  if (customForms && customForms.length > 0) {
    return { isBookletOrReview: false, isExamDoc: true };
  }

  const isBookletOrReview = Boolean(
    customTitle?.includes("مذكرة") ||
      customTitle?.includes("مراجعة") ||
      customQuestions?.some((q) => q.id.startsWith("booklet-s1-") || q.id.startsWith("rev-"))
  );
  const isExamDoc = Boolean(
    !isBookletOrReview &&
      (customTitle?.includes("اختبار") ||
        customQuestions?.some((q) => q.id.startsWith("q-exam-") || q.id.startsWith("q-form-")))
  );
  return { isBookletOrReview, isExamDoc };
}

export function resolveExamAwarePDFSettings(params: {
  readonly persisted: PDFPrintSettingsStateSSOT;
  readonly customTitle: string | undefined;
  readonly customQuestions: readonly PrintableMathQuestionItem[] | undefined;
  readonly customForms?: readonly PrintableExamFormGroup[];
  readonly preserveAutoFit?: boolean;
  readonly prevSettings?: PDFPrintSettingsStateSSOT;
}): PDFPrintSettingsStateSSOT {
  const { persisted, customTitle, customQuestions, customForms, preserveAutoFit, prevSettings } = params;
  const { isBookletOrReview, isExamDoc } = resolveDocAutoFitDefaults(
    customTitle,
    customQuestions,
    customForms
  );

  return {
    ...(prevSettings ?? persisted),
    ...persisted,
    paperTemplateId: isExamDoc
      ? "official_school_exam"
      : isBookletOrReview
        ? "classic_sovereign"
        : (persisted.paperTemplateId ?? "classic_sovereign"),
    columnsCount: isBookletOrReview ? 2 : isExamDoc ? 1 : (persisted.columnsCount ?? 2),
    answerVisibilityMode: isBookletOrReview
      ? "questions_only"
      : isExamDoc
        ? "questions_only"
        : persisted.answerVisibilityMode,
    autoFitMode:
      preserveAutoFit && prevSettings
        ? prevSettings.autoFitMode
        : isExamDoc
          ? "exam_max_pages"
          : (persisted.autoFitMode ?? "booklet_fill"),
    targetMaxPages:
      preserveAutoFit && prevSettings
        ? prevSettings.targetMaxPages
        : isExamDoc
          ? 2
          : isBookletOrReview
            ? undefined
            : persisted.targetMaxPages,
    customDocumentTitle: customTitle || prevSettings?.customDocumentTitle || persisted.customDocumentTitle,
  };
}
