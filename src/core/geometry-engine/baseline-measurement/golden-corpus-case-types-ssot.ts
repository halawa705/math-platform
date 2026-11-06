/**
 * @file golden-corpus-case-types-ssot.ts
 * @description عقد حالة المجموعة الذهبية (المرحلة 0 من خطة دقة الأشكال): مسألة حقيقية من كتاب + الحكم الصحيح لشكلها مع مواصفة الشكل المتوقعة (expectedFigureSpec).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 70 سطراً).
 */

export const MODULE_ID_GOLDEN_CORPUS_CASE_TYPES = "golden_corpus_case_types" as const;

/** الحكم المتوقع: هل للمسألة شكل صحيح يجب أن يُرسم أم لا شكل (نظرية/ناقصة)؟ */
export type GoldenExpectedOutcome = "figure" | "no_figure";

/** حكم المراجعة البشرية على ما يُنتجه النظام الحالي (مصدر الحقيقة الوحيد لمقياس الدقة). */
export type GoldenHumanVerdict = "correct" | "wrong" | "unreviewed";

/**
 * مواصفة الشكل الهندسي المرجعي المتوقع (المرحلة 0.1):
 * تتيح المقارنة الآلية الدقيقة بين ما أنتجه المحرك وما يجب أن يظهر على الورقة دون الاعتماد الحصري على المراجعة البشرية.
 */
export interface GoldenExpectedFigureSpec {
  /** الرؤوس المتوقعة (مثل ["أ", "ب", "جـ"] أو ["A", "B", "C"]) */
  readonly vertices?: readonly string[];
  /** الأطوال الرقمية أو التعبيرات الجبرية المتوقع ظهورها كبطاقات على الأضلاع */
  readonly displayedLengths?: readonly string[];
  /** قياسات الزوايا المتوقع ظهورها على الشكل (درجات رقمية مثل "90" أو "60" أو "قائمة") */
  readonly displayedAngles?: readonly string[];
  /** المجهول المطلوب الموسوم بعلامة استفهام "؟" على ضلع أو زاوية (مثل "AC" أو "ب جـ" أو "س") */
  readonly questionMarkTarget?: string;
  /** معرف عائلة الشكل المتوقعة (مثل triangle_family, circle_family, quadrilateral_family, primary_visual_models_family) */
  readonly expectedFamilyId?: string;
  /** معرف فرع الشكل المتوقع (مثل triangle_right_pythagoras, triangle_thales_parallel_line) */
  readonly expectedBranchId?: string;
}

export interface GoldenCorpusCase {
  readonly id: string;
  /** الصف الدراسي بالصيغة: primary-4 .. primary-6 | prep-1 .. prep-3 | sec-1 .. sec-3 */
  readonly gradeId: string;
  /** أحد الفروع الـ 11 من math-branches-ssot (مثل plane_geometry). */
  readonly branchId: string;
  /** نص المسألة كما في الكتاب (يتضمن المعطيات والمطلوب). */
  readonly problemText: string;
  /** وسم الرسم كما يكتبه NotebookLM (بدون الأقواس)، أو فارغ إن غاب الوسم. */
  readonly geometryRaw: string;
  readonly expectedOutcome: GoldenExpectedOutcome;
  /** الأرقام الهندسية التي يجب أن تظهر على الشكل (أطوال/زوايا معطاة). فارغة إن لم تُحدَّد. */
  readonly expectedGivenNumbers: readonly string[];
  /** اسم الكتاب/الصفحة لتتبع المصدر. */
  readonly source: string;
  readonly humanVerdict: GoldenHumanVerdict;
  /** مواصفة الشكل المتوقعة آلياً للمقارنة المرجعية (المهمة 0.1). */
  readonly expectedFigureSpec?: GoldenExpectedFigureSpec;
}
