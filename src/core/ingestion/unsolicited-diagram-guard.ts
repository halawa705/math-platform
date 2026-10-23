/**
 * @file unsolicited-diagram-guard.ts
 * @description حارس منع الرسوم الهندسية غير المطلوبة (Unsolicited Diagram Guard):
 * يضمن عدم إرفاق أي شكل هندسي في المسائل الحسابية أو الجبرية اللفظية التي لا تنص
 * صراحةً على وجود شكل مقابل ("في الشكل المقابل"، "ارسم"، "من الرسم البياني") أو لا تنتمي لفرع هندسي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import type { MathBranchId } from "../ssot/math-branches-ssot";

export const MODULE_ID_UNSOLICITED_DIAGRAM_GUARD =
  "unsolicited_diagram_guard" as const;

const EXPLICIT_VISUAL_CUES_REGEX =
  /(في\s+الشكل\s+المقابل|من\s+الشكل|بالشكل\s+المرسوم|ارسم|مثل\s+بياني|الشبكة\s+التربيعية|المنحنى\s+المقابل|الدائرة\s+م|المثلث\s+[أابجدهـ]+)/i;

const PURE_ALGEBRAIC_NO_DIAGRAM_CUES_REGEX =
  /(مجموعة\s+حل\s+المعادلة|اختصر\s+لأبسط\s+صورة|أوجد\s+قيمة\s+ك|حلل\s+المقدار|إذا\s+كان\s+س\s*=|أوجد\s+المشتقة\s+الأولى|أوجد\s+نهاية)/i;

/**
 * يتحقق مما إذا كان وصف الرسم الهندسي مسموحاً ومطلوباً فعلياً في هذا السؤال.
 */
export function isDiagramJustifiedForQuestion(params: {
  readonly promptArabic: string;
  readonly rawDiagramTagText?: string;
  readonly branchId: MathBranchId;
}): boolean {
  const { promptArabic, rawDiagramTagText, branchId } = params;

  if (!rawDiagramTagText || !rawDiagramTagText.trim()) {
    return false;
  }

  // إذا كان السؤال ينص صراحة على "في الشكل المقابل" أو "ارسم" فالرسم مبرر دائماً
  if (EXPLICIT_VISUAL_CUES_REGEX.test(promptArabic)) {
    return true;
  }

  // إذا كان السؤال جبرياً أو حسابياً لفظياً خالصاً ولا يذكر شكلاً، يُحجب الرسم غير المطلوب فوراً
  if (
    (branchId === "numbers" || branchId === "algebra" || branchId === "calculus") &&
    PURE_ALGEBRAIC_NO_DIAGRAM_CUES_REGEX.test(promptArabic)
  ) {
    return false;
  }

  // الفروع الهندسية الصريحة تسمح بالرسم متى وُجد وصف هندسي صحيح
  return (
    branchId === "plane_geometry" ||
    branchId === "solid_geometry" ||
    branchId === "trigonometry" ||
    branchId === "analytic_geometry" ||
    branchId === "statics"
  );
}
