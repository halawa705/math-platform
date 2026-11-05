/**
 * @file golden-corpus-case-types-ssot.ts
 * @description عقد حالة المجموعة الذهبية (المرحلة 0 من خطة دقة الأشكال): مسألة حقيقية من كتاب + الحكم الصحيح لشكلها.
 */

export const MODULE_ID_GOLDEN_CORPUS_CASE_TYPES = "golden_corpus_case_types" as const;

/** الحكم المتوقع: هل للمسألة شكل صحيح يجب أن يُرسم أم لا شكل (نظرية/ناقصة)؟ */
export type GoldenExpectedOutcome = "figure" | "no_figure";

/** حكم المراجعة البشرية على ما يُنتجه النظام الحالي (مصدر الحقيقة الوحيد لمقياس الدقة). */
export type GoldenHumanVerdict = "correct" | "wrong" | "unreviewed";

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
}
