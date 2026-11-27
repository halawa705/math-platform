/**
 * @file area-model-decomposer-ssot.ts
 * @description المنسق المركزي ومصدر الحقيقة (SSOT) لمسائل نموذج مساحة المستطيل (Area Model)
 * لعمليات ضرب وقسمة الأعداد والكسور العشرية وفق مناهج الرياضيات المعتمدة.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 110 سطراً).
 */

import {
  decomposeNumberToExpandedForm,
  isSymbolicAreaModelUnknown,
  normalizeDigitsToWestern,
  parseMultiplicationAreaModelClauses,
  type AreaModelMultiplicationSpec,
} from "./multiplication-area-model-clause-parser";
import {
  parseDivisionAreaModelClauses,
  type AreaModelDivisionSpec,
  type DivisionAreaColumnStep,
} from "./division-area-model-clause-parser";

export const MODULE_ID_AREA_MODEL_DECOMPOSER_SSOT =
  "area_model_decomposer_ssot" as const;

export {
  decomposeNumberToExpandedForm,
  isSymbolicAreaModelUnknown,
  normalizeDigitsToWestern,
  parseMultiplicationAreaModelClauses,
  type AreaModelMultiplicationSpec,
  parseDivisionAreaModelClauses,
  type AreaModelDivisionSpec,
  type DivisionAreaColumnStep,
};

export type AreaModelSpec = AreaModelMultiplicationSpec | AreaModelDivisionSpec;

const AREA_MODEL_DETECTION_RE =
  /نموذج\s*مساحة\s*المستطيل|نموذج\s*المستطيل|مستطيل\s*(?:القسمة|الضرب|مقسم\s*إلى\s*(?:خانات|أجزاء|عمودين|صفين))|المستطيل\s*مقسم\s*(?:إلى\s*(?:عمودين|صفين|خانات|أجزاء)|[0-9٠-٩]+\s*[×x*]\s*[0-9٠-٩]+)/i;

/**
 * يتحقق مما إذا كانت المسألة تطلب من الطالب نفسه إنشاء نموذج مساحة المستطيل أو مسألة لفظية/رمزية
 * بدون وسم رسم صريح (لمنع تسريب الحل أو توليد رسوم غير مطلوبة).
 */
export function isStudentAskedToConstructAreaModel(
  promptArabic: string,
  hasExplicitTag: boolean
): boolean {
  if (hasExplicitTag) return false;
  const clean = (promptArabic || "").trim();
  if (!clean) return false;
  if (
    /(?:استخدم|ارسم|استعمل|أوجد\s+باستخدام|احسب\s+باستخدام)\s+(?:استراتيجية\s+)?نموذج\s+(?:مساحة\s+)?المستطيل/i.test(
      clean
    )
  ) {
    return true;
  }
  const hasVisualReference =
    /(?:المقابل|المقابلة|المجاور|المرسوم|الموضح|مكون\s+من\s+(?:صفين|عمودين)|الأعداد\s+المكتوبة\s+أعلى\s+المستطيل)/i.test(
      clean
    );
  return AREA_MODEL_DETECTION_RE.test(clean) && !hasVisualReference;
}

/**
 * يحلل النص العربي لمسألة أو رسم نموذج مساحة المستطيل ويستخرج المواصفة الهندسية الحتمية.
 */
export function parseAreaModelSpecFromText(text: string): AreaModelSpec | null {
  if (!text || !AREA_MODEL_DETECTION_RE.test(text)) {
    return null;
  }

  const headBeforeTag = text.split(/\[\s*رسم|رسم\s*هندسي/i)[0] || "";
  const isDivision =
    /(?:\\div|÷)\s*[0-9٠-٩]+|قسمة|المقسوم|خارج\s*القسمة|العرض\s*الأيسر/i.test(text) &&
    !/حاصل\s*ضرب|لعملية\s*الضرب/i.test(headBeforeTag);

  if (isDivision) {
    return parseDivisionAreaModelClauses(text);
  }

  return parseMultiplicationAreaModelClauses(text);
}
