/**
 * @file curriculum-hierarchy-ssot.ts
 * @description المصدر الوحيد للحقيقة (SSOT) لمستكشف المنهج الرياضي وتقسيمه إلى وحدات ودروس.
 * يضم:
 * 1. قائمة الصفوف الدراسية الكاملة (من الصف الثالث الابتدائي حتى الثالث الثانوي) مع فلترة الصفوف التي يفعّلها المعلم في الإعدادات.
 * 2. برومبت تقسيم المنهج الموجه لـ NotebookLM لاستخراج الفروع والوحدات والدروس الحقيقية من الكتب المرفوعة.
 * 3. المحلل الحتمي لاستقبال رد NotebookLM وحفظ الوحدات والدروس الحقيقية فقط (بدون أي وحدات أو دروس مثبتة وهمية).
 */

import type { MathBranchId, SchoolStageId } from "./math-branches-ssot";
import { MATH_BRANCHES_SSOT } from "./math-branches-ssot";

export interface CurriculumLessonNode {
  readonly id: string;
  readonly unitId: string;
  readonly orderIndex: number;
  readonly titleArabic: string;
  readonly coreConcepts: readonly string[];
}

export interface CurriculumUnitNode {
  readonly id: string;
  readonly gradeId: string;
  readonly termNumber: 1 | 2;
  readonly branchId: MathBranchId;
  readonly branchNameArabic?: string;
  readonly orderIndex: number;
  readonly titleArabic: string;
  readonly lessons: readonly CurriculumLessonNode[];
}

export interface CurriculumGradeNode {
  readonly id: string;
  readonly stage: SchoolStageId;
  readonly orderIndex: number;
  readonly nameArabic: string;
  readonly notebookLmUrl?: string;
}

export const EGYPTIAN_MATH_GRADES_SSOT: readonly CurriculumGradeNode[] = [
  { id: "prim-3", stage: "primary", orderIndex: 3, nameArabic: "الصف الثالث الابتدائي" },
  { id: "prim-4", stage: "primary", orderIndex: 4, nameArabic: "الصف الرابع الابتدائي" },
  { id: "prim-5", stage: "primary", orderIndex: 5, nameArabic: "الصف الخامس الابتدائي" },
  { id: "prim-6", stage: "primary", orderIndex: 6, nameArabic: "الصف السادس الابتدائي" },
  { id: "prep-1", stage: "preparatory", orderIndex: 7, nameArabic: "الصف الأول الإعدادي" },
  { id: "prep-2", stage: "preparatory", orderIndex: 8, nameArabic: "الصف الثاني الإعدادي" },
  { id: "prep-3", stage: "preparatory", orderIndex: 9, nameArabic: "الصف الثالث الإعدادي" },
  { id: "sec-1", stage: "secondary", orderIndex: 10, nameArabic: "الصف الأول الثانوي" },
  { id: "sec-2", stage: "secondary", orderIndex: 11, nameArabic: "الصف الثاني الثانوي" },
  { id: "sec-3", stage: "secondary", orderIndex: 12, nameArabic: "الصف الثالث الثانوي" },
];

/**
 * 1. يبني البرومبت الصارم الذي يُنسخ إلى NotebookLM لتقسيم المنهج المرفوع إلى فروع ووحدات ودروس حقيقية.
 */
export function buildCurriculumSplitterPrompt(params: {
  gradeName: string;
  termNumber: 1 | 2;
  branchId?: MathBranchId;
}): string {
  const termText = params.termNumber === 1 ? "الفصل الدراسي الأول" : "الفصل الدراسي الثاني";

  return `بصفتك خبيراً أول في تخطيط مناهج الرياضيات بوزارة التربية والتعليم:
المهمة: استخراج الفهرس الكامل والدقيق لوحدات ودروس المنهج من الكتب والمصادر المرفوعة فقط:
- الصف الدراسي: ${params.gradeName}
- الفصل الدراسي: ${termText}

⛔ ضوابط صارمة للإخراج (للاستيراد الآلي في النظام):
1. التزم حصراً بأسماء وترتيب الوحدات والدروس الواردة نصاً في المصادر المرفوعة دون حذف أو دمج أو اختلاق.
2. حدد أمام كل وحدة الفرع الرياضي الخاص بها كما يرد في المنهج (مثال في الإعدادي: الأعداد والجبر / الهندسة والقياس / حساب المثلثات / الإحصاء والاحتمالات — وفي الابتدائي حسب محور أو وحدة الكتاب المدرسي).
3. لا تكتب أي مقدمات أو شروحات؛ أخرج الهيكل بالصيغة القياسية التالية فقط:

=== [UNIT: رقم الوحدة] | الفرع: [اسم الفرع في المنهج] | العنوان: [اسم الوحدة كاملاً] ===
- [LESSON: 1] [اسم الدرس الأول كاملاً] | المفاهيم: [مفهوم 1، مفهوم 2]
- [LESSON: 2] [اسم الدرس الثاني كاملاً] | المفاهيم: [مفهوم 1، مفهوم 2]
`;
}

/**
 * 2. يحلل رد NotebookLM ويحوله إلى وحدات ودروس حقيقية تصبح المصدر الوحيد للحقيقة في المنصة.
 */
export function parseCurriculumSplitterResponse(
  rawResponse: string,
  gradeId: string,
  termNumber: 1 | 2,
  defaultBranchId: MathBranchId = "algebra"
): CurriculumUnitNode[] {
  const units: CurriculumUnitNode[] = [];
  if (!rawResponse || !rawResponse.trim()) return units;

  const lines = rawResponse.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let currentUnit: {
    id: string;
    branchId: MathBranchId;
    branchNameArabic: string;
    orderIndex: number;
    titleArabic: string;
    lessons: CurriculumLessonNode[];
  } | null = null;

  const inferBranchFromArabic = (text: string): MathBranchId => {
    if (/هندسة\s*فراغية|مجسم/i.test(text)) return "solid_geometry";
    if (/تحليلية|إحداثي|ميل/i.test(text)) return "analytic_geometry";
    if (/مثلثات|جا|جتا|ظا/i.test(text)) return "trigonometry";
    if (/هندسة|برهان|مثلث|دائرة|رباعي|قياس/i.test(text)) return "plane_geometry";
    if (/إحصاء|احتمال|تكراري|وسط|وسيط|بيانات/i.test(text)) return "statistics_probability";
    if (/تفاضل|تكامل|نهايات|مشتقة/i.test(text)) return "calculus";
    if (/استاتيكا|اتزان|عزوم|قوى/i.test(text)) return "statics";
    if (/ديناميكا|حركة|سرعة|عجلة/i.test(text)) return "dynamics";
    if (/دوال|دالة|منحنى/i.test(text)) return "functions";
    if (/أعداد|كسور|نسبة|عمليات|حساب/i.test(text)) return "numbers";
    return defaultBranchId;
  };

  for (const line of lines) {
    const unitMatch = line.match(/\[UNIT:\s*(\d+)\]\s*\|\s*الفرع:\s*([^|]+)\|\s*العنوان:\s*(.+?)(?:===|$)/i);
    if (unitMatch) {
      const orderIdx = parseInt(unitMatch[1], 10) || units.length + 1;
      const branchRaw = unitMatch[2].trim();
      const titleRaw = unitMatch[3].replace(/===/g, "").trim();
      const unitId = `${gradeId}-t${termNumber}-u${orderIdx}`;
      const resolvedBranchId = inferBranchFromArabic(branchRaw + " " + titleRaw);
      currentUnit = {
        id: unitId,
        branchId: resolvedBranchId,
        branchNameArabic: branchRaw || MATH_BRANCHES_SSOT[resolvedBranchId].nameArabic,
        orderIndex: orderIdx,
        titleArabic: titleRaw,
        lessons: [],
      };
      units.push({
        id: currentUnit.id,
        gradeId,
        termNumber,
        branchId: currentUnit.branchId,
        branchNameArabic: currentUnit.branchNameArabic,
        orderIndex: currentUnit.orderIndex,
        titleArabic: currentUnit.titleArabic,
        lessons: currentUnit.lessons,
      });
      continue;
    }

    const lessonMatch = line.match(/\[LESSON:\s*(\d+)\]\s*([^|]+)(?:\|\s*المفاهيم:\s*(.+))?$/i);
    if (lessonMatch && currentUnit) {
      const lOrder = parseInt(lessonMatch[1], 10) || currentUnit.lessons.length + 1;
      const lTitle = lessonMatch[2].trim();
      const conceptsRaw = lessonMatch[3]
        ? lessonMatch[3].replace(/[\[\]]/g, "").split(/[،,]/).map((c) => c.trim()).filter(Boolean)
        : [];
      currentUnit.lessons.push({
        id: `${currentUnit.id}-l${lOrder}`,
        unitId: currentUnit.id,
        orderIndex: lOrder,
        titleArabic: lTitle,
        coreConcepts: conceptsRaw,
      });
    }
  }

  return units;
}

const CURRICULUM_STORAGE_KEY = "math_platform_real_curriculum_units_ssot_v2" as const;

/**
 * تم استئصال كافة الوحدات والدروس المثبتة (Zero Hardcoded Units):
 * لا يظهر في المنصة إلا ما يقوم المعلم بتقسيمه واستيراده فعلياً من مستكشف المنهج.
 */
export const DEFAULT_SEEDED_CURRICULUM_UNITS_SSOT: readonly CurriculumUnitNode[] = [];

export function loadActiveCurriculumUnitsSSOT(
  gradeId?: string
): readonly CurriculumUnitNode[] {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(CURRICULUM_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CurriculumUnitNode[];
        if (Array.isArray(parsed)) {
          return gradeId ? parsed.filter((u) => u.gradeId === gradeId) : parsed;
        }
      }
    } catch {
      // ignore storage read error
    }
  }
  return [];
}

export function saveImportedCurriculumUnitsSSOT(
  newUnits: readonly CurriculumUnitNode[]
): void {
  if (typeof window === "undefined" || newUnits.length === 0) return;
  try {
    const existing = loadActiveCurriculumUnitsSSOT();
    const gradeToReplace = newUnits[0].gradeId;
    const merged = [
      ...existing.filter((u) => u.gradeId !== gradeToReplace),
      ...newUnits,
    ];
    window.localStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // ignore storage write error
  }
}

export function clearCurriculumUnitsForGradeSSOT(gradeId: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadActiveCurriculumUnitsSSOT();
    const remaining = existing.filter((u) => u.gradeId !== gradeId);
    window.localStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(remaining));
  } catch {
    // ignore
  }
}
