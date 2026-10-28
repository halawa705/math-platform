/**
 * @file smart-geometry-prompt-director.ts
 * @description الموجه الذكي الموحد لبرومبتات الهندسة لـ NotebookLM:
 * - يكتشف تلقائياً اختيار وحدة الهندسة أو أي درس هندسي في المرحلة الابتدائية أو الإعدادية أو الثانوية (مثل تشابه المضلعات).
 * - يوجه النموذج بدقة متناهية لتفصيل الأشكال الهندسية (أسماء الرؤوس، أطوال الأضلاع بالجذور والكسور، قياسات الزوايا والعلامات).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import type { MathBranchId } from "../ssot/math-branches-ssot";

export const MODULE_ID_SMART_GEOMETRY_PROMPT_DIRECTOR =
  "smart_geometry_prompt_director" as const;

export interface GeometryPromptDetectionParams {
  readonly branchId?: MathBranchId;
  readonly lessonTitleArabic?: string;
  readonly unitTitleArabic?: string;
}

/**
 * يفحص هل السياق الحالي يخص وحدة هندسية أو درساً هندسياً
 */
export function isGeometryContext(params: GeometryPromptDetectionParams): boolean {
  if (
    params.branchId === "plane_geometry" ||
    params.branchId === "solid_geometry" ||
    params.branchId === "analytic_geometry"
  ) {
    return true;
  }

  const combined = `${params.unitTitleArabic || ""} ${params.lessonTitleArabic || ""}`.trim();
  if (!combined) return false;

  return /هندسة|تشابه|مضلع|مثلث|دائرة|شبه\s*منحرف|متوازي|معين|مستطيل|مربع|طائرة\s*ورقية|دالتون|أوتار|مماس|قاطع|إقليدس|فيثاغورس|طاليس|منصف|إحداثي|حجوم|مساحات/i.test(
    combined
  );
}

/**
 * يبني التوجيه الذكي التخصصي للأشكال الهندسية لـ NotebookLM
 */
export function buildSmartGeometryPromptGuidance(
  params: GeometryPromptDetectionParams
): string {
  if (!isGeometryContext(params)) {
    return "";
  }

  const lessonName = params.lessonTitleArabic || "الهندسة";

  return [
    `📐 توجيه الإخراج الهندسي الذكي المتخصص لدرس (${lessonName}):`,
    "عند صياغة أي مسألة أو تمرين يتطلب شكلاً هندسياً (مثل مسائل تشابه المضلعات، متوازي الأضلاع، أشباه المنحرف، والمثلثات):",
    "يجب عليك كتابة تفاصيل الشكل الهندسي بدقة متناهية داخل وسم `[رسم هندسي: ...]` بالعربية، متضمناً العناصر الأربعة التالية:",
    "1. نوع وتناظر الشكل: (مثل: مضلعان رباعيان متشابهان ABCD ~ EFGH / مضلعان خماسيان متشابهان / متوازيا أضلاع / شبه منحرف قائم / معينان / طائرة ورقية دالتون / مضلعان بقاعدة مشتركة يتقاطعان في O).",
    "2. أسماء الرؤوس بالترتيب المتناظر: (مثل ABCD و EFGH أو أ ب جـ د و س ص ع ل).",
    "3. أطوال الأضلاع مع قيمها ووحداتها والتعبيرات الجبرية: اذكر كل ضلع صراحة بقيمته، بما فيها الجذور والكسور والمجاهيل (مثل: AB = 6.5 سم، DA = 1.5√3 سم، EF = (y - 1/3) سم، FG = z سم، HE = √3 سم، X - 3 سم).",
    "4. قياسات الزوايا الدقيقة والعلامات: حدد قياس كل زاوية مميزة صراحة (مثل: الزاوية A قائمة 90°، الزاوية C = 60°، الزاوية B = x°، الزاوية E قائمة 90°، الزاوية H = 150°، الزاوية G = 45°، أو زوايا 110° أو 92°، وعلامات التطابق مثل زاوية أ بها علامة × وزاوية جـ بها علامة •).",
    "",
    "💡 مثال صياغة نموذجي حتمي تلتزم بنمطه:",
    "`[رسم هندسي: مضلعان رباعيان متشابهان ABCD ~ EFGH ، في المضلع الأول: AB = 6.5 سم، BC = 8 سم، CD = 5 سم، DA = 1.5√3 سم ، والزاوية A قائمة 90° والزاوية C = 60° والزاوية B = x° ، وفي المضلع الثاني: EF = (y - 1/3) سم، FG = z سم، HE = √3 سم ، والزاوية E قائمة 90° والزاوية H = 150°]`",
    "",
  ].join("\n");
}
