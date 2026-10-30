/**
 * @file curriculum-document-title-builder.ts
 * @description مشتق الاسم القياسي الرسمي للمذكرات والاختبارات والمراجعات من بيانات الصف والوحدة والدرس.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 150 سطراً).
 */

import { loadActiveCurriculumUnitsSSOT } from "./curriculum-hierarchy-ssot";

export const MODULE_ID_CURRICULUM_DOCUMENT_TITLE_BUILDER =
  "curriculum_document_title_builder" as const;

const GRADE_SHORT_CODES_MAP: Readonly<Record<string, string>> = {
  "prim-3": "3ب",
  "prim-4": "4ب",
  "prim-5": "5ب",
  "prim-6": "6ب",
  "prep-1": "1ع",
  "prep-2": "2ع",
  "prep-3": "3ع",
  "sec-1": "1ث",
  "sec-2": "2ث",
  "sec-3": "3ث",
};

function resolveGradeShortCode(gradeIdOrName: string): string {
  if (GRADE_SHORT_CODES_MAP[gradeIdOrName]) return GRADE_SHORT_CODES_MAP[gradeIdOrName];
  if (/أول.*ثانوي|1ث|sec-1/i.test(gradeIdOrName)) return "1ث";
  if (/ثان.*ثانوي|2ث|sec-2/i.test(gradeIdOrName)) return "2ث";
  if (/ثالث.*ثانوي|3ث|sec-3/i.test(gradeIdOrName)) return "3ث";
  if (/أول.*إعدادي|1ع|prep-1/i.test(gradeIdOrName)) return "1ع";
  if (/ثان.*إعدادي|2ع|prep-2/i.test(gradeIdOrName)) return "2ع";
  if (/ثالث.*إعدادي|3ع|prep-3/i.test(gradeIdOrName)) return "3ع";
  if (/سادس.*ابتدائي|6ب|prim-6/i.test(gradeIdOrName)) return "6ب";
  if (/خامس.*ابتدائي|5ب|prim-5/i.test(gradeIdOrName)) return "5ب";
  if (/رابع.*ابتدائي|4ب|prim-4/i.test(gradeIdOrName)) return "4ب";
  if (/ثالث.*ابتدائي|3ب|prim-3/i.test(gradeIdOrName)) return "3ب";
  return "3ع";
}

/**
 * يشتق الاسم القياسي الرسمي لأي ملف أو مستند يُنتج في المنصة بالصيغة:
 * "(رقم الدرس في الوحدة) - رمز الصف - اسم الوحدة - اسم الدرس"
 */
export function buildStandardDocumentTitleSSOT(params: {
  readonly gradeId: string;
  readonly unitTitleInput?: string;
  readonly lessonTitleInput?: string;
  readonly lessonOrderIndex?: number;
  readonly promptText?: string;
  readonly rawReplyText?: string;
  readonly totalIdeasCount?: number;
}): string {
  const gradeCode = resolveGradeShortCode(params.gradeId);
  const units = loadActiveCurriculumUnitsSSOT(params.gradeId);

  let resolvedLessonOrder =
    params.lessonOrderIndex && params.lessonOrderIndex > 0 ? params.lessonOrderIndex : 1;
  let resolvedUnitTitle = (params.unitTitleInput || "").trim();
  let resolvedLessonTitle = (params.lessonTitleInput || "").trim();

  const numInTitle = resolvedLessonTitle.match(/(?:الدرس\s+|درس\s+|^)(\d{1,2})\b/);
  if (numInTitle?.[1]) {
    resolvedLessonOrder = parseInt(numInTitle[1], 10);
  }

  if (units.length > 0) {
    const matchedUnit =
      units.find((u) => u.titleArabic === resolvedUnitTitle) ||
      units.find((u) => u.lessons.some((l) => l.titleArabic === resolvedLessonTitle)) ||
      units[0];

    if (matchedUnit) {
      if (!resolvedUnitTitle || resolvedUnitTitle === "الوحدة" || resolvedUnitTitle === "الوحدة الأولى") {
        resolvedUnitTitle = matchedUnit.titleArabic;
      }
      const matchedLesson = matchedUnit.lessons.find(
        (l) =>
          l.titleArabic === resolvedLessonTitle ||
          resolvedLessonTitle.includes(l.titleArabic) ||
          l.titleArabic.includes(resolvedLessonTitle)
      );
      if (matchedLesson) {
        resolvedLessonOrder = matchedLesson.orderIndex;
        resolvedLessonTitle = matchedLesson.titleArabic;
      }
    }
  }

  const replyRaw = params.rawReplyText || "";
  const unitFromReply = replyRaw.match(
    /(?:الوحدة\s+(?:الأولى|الاولى|الثانية|الثالثة|الرابعة|الخامسة|السادسة|[0-9٠-٩]+))/i
  )?.[0];
  if (unitFromReply && (!resolvedUnitTitle || resolvedUnitTitle === "الوحدة" || resolvedUnitTitle === "الوحدة الأولى")) {
    resolvedUnitTitle = unitFromReply.trim();
  }

  const isJunkOrGeneric =
    !resolvedLessonTitle ||
    /^الدرس\s+(?:الأول|الاول|\d+)$/i.test(resolvedLessonTitle) ||
    /idea|معرف|نوع|أكمل|اختر|\[/i.test(resolvedLessonTitle);

  if (isJunkOrGeneric) {
    if (/تشابه\s+(?:مضلعين|المضلعات)/i.test(replyRaw)) {
      resolvedLessonTitle = "تشابه المضلعات";
    } else if (/تشابه\s+المثلثات/i.test(replyRaw)) {
      resolvedLessonTitle = "تشابه المثلثات";
    } else if (/نظرية\s+إقليدس/i.test(replyRaw)) {
      resolvedLessonTitle = "نظرية إقليدس";
    } else if (/نظرية\s+فيثاغورس/i.test(replyRaw)) {
      resolvedLessonTitle = "نظرية فيثاغورس";
    } else if (/النسب\s+المثلثية/i.test(replyRaw)) {
      resolvedLessonTitle = "النسب المثلثية الأساسية";
    } else {
      resolvedLessonTitle = "تشابه المضلعات";
    }
  }

  let cleanLesson = resolvedLessonTitle
    .replace(/^(?:الدرس\s+\d+\s*[:\-–—]?|الدرس\s+\S+\s*[:\-–—]?|\d+\s*[.\-–]\s*)/i, "")
    .replace(/^(?:درس|الدرس)\s+/i, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/idea[-_\d]*/gi, "")
    .replace(/[-–—:]+/g, " ")
    .trim();

  if (!cleanLesson || cleanLesson === "الأول" || cleanLesson.length < 2) {
    cleanLesson = "تشابه المضلعات";
  }

  const finalUnit = resolvedUnitTitle || "الوحدة الثالثة";

  return `${resolvedLessonOrder} - ${gradeCode} - ${finalUnit} - ${cleanLesson}`;
}
