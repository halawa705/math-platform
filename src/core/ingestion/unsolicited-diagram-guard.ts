/**
 * @file unsolicited-diagram-guard.ts
 * @description حارس وسياسة الرسوم الهندسية للمنهج المصري (Unsolicited Diagram Guard & Curriculum Policy):
 * - المرحلة الابتدائية والإعدادية: رسم توضيحي للمسائل اللفظية في دروس الهندسة الصريحة حتى بدون «في الشكل المقابل»،
 *   ما لم يُطلب من الطالب الرسم بنفسه («ارسم الشكل»، «ارسم المثلث»...) أو تكن المسألة نظرية بحتة.
 * - المرحلة الثانوية: لا يُرسم شكل تلقائياً إلا مع وسم صريح أو «في الشكل المقابل».
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import type { MathBranchId } from "../ssot/math-branches-ssot";

export const MODULE_ID_UNSOLICITED_DIAGRAM_GUARD =
  "unsolicited_diagram_guard" as const;

export type CurriculumStageKind = "primary" | "preparatory" | "secondary";

export function resolveCurriculumStageFromGradeId(
  gradeId?: string,
  explicitStage?: CurriculumStageKind
): CurriculumStageKind {
  if (explicitStage) return explicitStage;
  if (!gradeId) return "preparatory";
  if (gradeId.startsWith("prim")) return "primary";
  if (gradeId.startsWith("sec")) return "secondary";
  return "preparatory";
}

const GEOMETRY_BRANCHES: ReadonlySet<MathBranchId> = new Set([
  "plane_geometry",
  "solid_geometry",
  "trigonometry",
  "analytic_geometry",
  "statics",
]);

const EXPLICIT_VISUAL_CUES_REGEX =
  /(في\s+الشكل\s+المقابل|من\s+الشكل|بالشكل\s+المرسوم|مستعيناً\s+بالشكل|مستعينا\s+بالشكل|مثل\s+بياني|الشبكة\s+التربيعية|المنحنى\s+المقابل|الدائرة\s+(?:م|مـ)(?![أ-ي])|(?:في\s+(?:أي\s+)?)?(?:المثلث|مثلث|Δ|\\Delta)\s+(?:(?:[أابجدهـوسصع]\s+){2}[أابجدهـوسصع](?![أ-ي])|[A-Za-z]{3}\b)|\b[A-Za-z]{3}\s+مثلث\s+(?:قائم|متساوي)|(?:في\s+)?(?:المربع|المستطيل|المعين|شبه\s+المنحرف)(?:\s+المتساوي\s+الساقين)?\s+[A-Za-z]{4}\b|\b[A-Za-z]{4}\s+شبه\s+منحرف|مربعات\s+متطابقة[\s\S]{0,60}المستطيل\s+[A-Za-z]{4}|طائرة\s+ورقية[\s\S]{0,40}خيط|سلم\s+طوله[\s\S]{0,50}(?:يستند|حائط|أرض)|عمود\s+إنارة\s+ارتفاعه|حبل\s+مشدود\s+من\s+قمة\s+برج)/i;

/** أسئلة تطلب من الطالب نفسه رسم الشكل بيده فلا يجب إظهار رسم جاهز لها. */
const STUDENT_MUST_DRAW_REGEX =
  /(?:^|[\s،.:؛\-])(?:ارسم|أنشئ|انشئ|ارسمي)\s+(?:ال)?(?:شكل|مثلث|مربع|مستطيل|معين|شبه|دائرة|زاوية|قطعة|محور|منصف)/i;

/** أسئلة نظرية بحتة / خصائص مجردة / سؤال هل يمكن رسم مثلث بدون وسم صريح. */
const CONCEPTUAL_OR_IMPOSSIBILITY_NO_DIAGRAM_REGEX =
  /(?:^|\s|،)(?:مجموع\s+قياسات\s+زوايا|قياس\s+(?:أي\s+)?(?:ال)?زاوية\s+(?:ال)?خارجة\s+(?:عن\s+(?:ال)?مثلث|للمثلث)\s+(?:ال)?متساوي\s+الأضلاع|اختبر\s+(?:أي\s*مما\s*يلي\s*يصلح|إمكانية\s+رسم)|[وف]?هل\s+يمكن\s+(?:رسم\s+مثلث|أن\s+[يت]?كون|تشكيل\s+مثلث)|لا\s+يمكن\s+رسم\s+مثلث|أي\s+من\s+مجموع(?:تي|ات)\s+الأطوال|أيهما\s+يصلح\s+أن\s+يكون\s+أطوال\s+أضلاع\s+مثلث|الزاوية\s+الحادة\s+في\s+المثلث\s+القائم|أصغر\s+عدد\s+من\s+الزوايا\s+الحادة)/i;

const EXPLICIT_GEOMETRY_CONCRETE_VERBAL_REGEX =
  /(?:مثلث|مربع|مستطيل|معين|شبه\s*منحرف|متوازي\s*أضلاع|دائرة|وتر|مماس|زاوية\s+خارجة|الزوايا\s+الداخلة|نصف\s*قطر|فيثاغورس|توازي|متوازيان|متعامد|متقاطع|حظيرة\s+مثلثة|سلم\s+طوله|عمود\s+إنارة|ظل\s+(?:شجرة|برج|عمود)|طائرة\s+ورقية)/i;

const EXPLICIT_GEOMETRY_LESSON_HINT_REGEX =
  /(?:مثلث|هندسة|توازي|فيثاغورس|تشابه|تطابق|دائرة|زوايا|رباعي|متوازي|مضلع|مساحة|محيط|إحداثي|مثلثات|إقليدس|طاليس|متوسط)/i;

/**
 * يكشف ما إذا كان نص السؤال يصف صراحةً مضلعاً هندسياً أو مثلثاً قائماً/متساوي الساقين أو تطبيقاً مثلثياً مرسوماً.
 */
export function hasExplicitGeometricOrTrigShapeInPrompt(promptArabic: string): boolean {
  if (!promptArabic) return false;
  const cleanPrompt = promptArabic.replace(/[\$*]/g, " ").replace(/\s+/g, " ");
  return EXPLICIT_VISUAL_CUES_REGEX.test(cleanPrompt);
}

/** يحدد هل تنطبق سياسة المنهج المصري بالرسم التلقائي للمسائل اللفظية الهندسية. */
export function shouldTriggerGeometryDiagramForPrompt(params: {
  readonly promptArabic: string;
  readonly hasExplicitTag?: boolean;
  readonly branchId: MathBranchId;
  readonly gradeId?: string;
  readonly stage?: CurriculumStageKind;
  readonly lessonTitleArabic?: string;
}): boolean {
  const cleanPrompt = (params.promptArabic || "").replace(/[\$*]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleanPrompt) return false;

  const hasShapePictureCue =
    /(?:في|من|بـ)?\s*الشكل\s*(?:المقابل|المجاور|المرسوم|الموضح|التالي)|مستعيناً\s*بالشكل|مستعينا\s*بالشكل/i.test(
      cleanPrompt
    );

  // إذا طُلب من الطالب نفسه رسم الشكل أو كان سؤالاً نظرياً/اختبار قابلية رسم بلا وسم، لا نرسم له
  if (!params.hasExplicitTag && !hasShapePictureCue) {
    if (STUDENT_MUST_DRAW_REGEX.test(cleanPrompt)) return false;
    if (CONCEPTUAL_OR_IMPOSSIBILITY_NO_DIAGRAM_REGEX.test(cleanPrompt)) return false;
  }

  if (params.hasExplicitTag || hasShapePictureCue || EXPLICIT_VISUAL_CUES_REGEX.test(cleanPrompt)) {
    return true;
  }

  const stage = resolveCurriculumStageFromGradeId(params.gradeId, params.stage);
  if (stage === "secondary") {
    return false;
  }

  // الابتدائي والإعدادي في دروس الهندسة الصريحة: كل مسألة لفظية هندسية بها معطيات تأخذ شكلاً توضيحياً
  const isGeoDomain =
    GEOMETRY_BRANCHES.has(params.branchId) ||
    Boolean(params.lessonTitleArabic && EXPLICIT_GEOMETRY_LESSON_HINT_REGEX.test(params.lessonTitleArabic));

  if (!isGeoDomain) return false;

  const hasQuantitativeOrVertexData =
    /[0-9٠-٩]+|[A-Z]{2,3}|[xyzسص]|متساوي\s*(?:الساقين|الأضلاع)|قائم\s*(?:الزاوية|في)|نسبة|النسبة/.test(cleanPrompt);

  return EXPLICIT_GEOMETRY_CONCRETE_VERBAL_REGEX.test(cleanPrompt) && hasQuantitativeOrVertexData;
}

const PURE_ALGEBRAIC_NO_DIAGRAM_CUES_REGEX =
  /(مجموعة\s+حل\s+المعادلة|اختصر\s+لأبسط\s+صورة|أوجد\s+قيمة\s+ك|حلل\s+المقدار|إذا\s+كان\s+س\s*=|أوجد\s+المشتقة\s+الأولى|أوجد\s+نهاية)/i;

/**
 * يتحقق مما إذا كان وصف الرسم الهندسي مسموحاً ومطلوباً فعلياً في هذا السؤال.
 */
export function isDiagramJustifiedForQuestion(params: {
  readonly promptArabic: string;
  readonly rawDiagramTagText?: string;
  readonly hasExplicitTag?: boolean;
  readonly branchId: MathBranchId;
  readonly gradeId?: string;
  readonly stage?: CurriculumStageKind;
  readonly lessonTitleArabic?: string;
}): boolean {
  const { promptArabic, rawDiagramTagText, branchId } = params;

  if (!rawDiagramTagText || !rawDiagramTagText.trim()) {
    return false;
  }

  const cleanPrompt = (promptArabic || "").replace(/[\$*]/g, " ").replace(/\s+/g, " ");

  const hasShapePictureCue =
    /(?:في|من|بـ)?\s*الشكل\s*(?:المقابل|المجاور|المرسوم|الموضح|التالي)|مستعيناً\s*بالشكل|مستعينا\s*بالشكل/i.test(
      cleanPrompt
    );

  // منع الرسم إذا طُلب صراحة أن يرسم الطالب بنفسه، أو كان سؤالاً نظرياً مجرداً بلا وسم
  if (!params.hasExplicitTag && !hasShapePictureCue) {
    if (STUDENT_MUST_DRAW_REGEX.test(cleanPrompt)) return false;
    if (CONCEPTUAL_OR_IMPOSSIBILITY_NO_DIAGRAM_REGEX.test(cleanPrompt)) return false;
  }

  if (EXPLICIT_VISUAL_CUES_REGEX.test(cleanPrompt) || params.hasExplicitTag) {
    if (
      (branchId === "numbers" || branchId === "algebra" || branchId === "calculus") &&
      PURE_ALGEBRAIC_NO_DIAGRAM_CUES_REGEX.test(cleanPrompt) &&
      !hasShapePictureCue
    ) {
      return false;
    }
    return true;
  }

  if (
    (branchId === "numbers" || branchId === "algebra" || branchId === "calculus") &&
    PURE_ALGEBRAIC_NO_DIAGRAM_CUES_REGEX.test(cleanPrompt)
  ) {
    return false;
  }

  const stage = resolveCurriculumStageFromGradeId(params.gradeId, params.stage);
  if (stage === "secondary") {
    return false;
  }

  return GEOMETRY_BRANCHES.has(branchId);
}
