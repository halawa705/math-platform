/**
 * @file curriculum-hierarchy-ssot.ts
 * @description المصدر الوحيد للحقيقة (SSOT) لمستكشف المنهج الرياضي وتقسيمه إلى وحدات ودروس.
 * يضم:
 * 1. قائمة الصفوف الدراسية الكاملة (من الصف الثالث الابتدائي حتى الثالث الثانوي) مع فلترة الصفوف التي يفعّلها المعلم في الإعدادات.
 * 2. برومبت تقسيم المنهج الموجه لـ NotebookLM لاستخراج الفروع والوحدات والدروس الحقيقية من الكتب المرفوعة.
 * 3. المحلل الحتمي لاستقبال رد NotebookLM وحفظ الوحدات والدروس الحقيقية فقط (بدون أي وحدات أو دروس مثبتة وهمية).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (<= 200 سطر).
 */

import type { MathBranchId, SchoolStageId } from "./math-branches-ssot";
import { MATH_BRANCHES_SSOT } from "./math-branches-ssot";
import {
  syncCurriculumUnitsToSupabaseCloud,
  deleteCurriculumUnitsFromSupabaseCloud,
  wipeCurriculumUnitsFromSupabaseCloud,
} from "../supabase/supabase-cloud-sync-ssot";

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

export function buildCurriculumSplitterPrompt(params: {
  gradeName: string;
  termNumber: 1 | 2;
  gradeId?: string;
  branchId?: MathBranchId;
}): string {
  const termText = params.termNumber === 1 ? "الفصل الدراسي الأول" : "الفصل الدراسي الثاني";
  const resolvedGradeId = params.gradeId || detectGradeIdFromArabic(params.gradeName) || "prim-6";

  return [
    `المهمة الحصرية: استخراج الفهرس الكامل والدقيق لوحدات ودروس الرياضيات لـ (${params.gradeName}) [كود المنهج: ${resolvedGradeId}] (${termText}) فقط.`,
    "📚 أولوية المصادر: (١) كتاب التقييمات الوزارية ← (٢) كتاب المدرسة ← (٣) الكتب الخارجية المرفوعة.",
    "⛔ ضوابط الإخراج (للاستيراد الآلي الدقيق دون اختلاق أو خلط مناهج):",
    `1. التزم حصراً بأسماء وترتيب الوحدات والدروس الخاصة بـ (${params.gradeName}) ولا تخلط بينه وبين أي صف دراسي آخر.`,
    `2. أخرج الهيكل بالصيغة القياسية التالية فقط لكل وحدة (مع تثبيت كود الصف [GRADE: ${resolvedGradeId}] في كل وحدة):`,
    `=== [GRADE: ${resolvedGradeId}] | [UNIT: رقم الوحدة] | الفرع: [اسم الفرع] | العنوان: [اسم الوحدة كاملاً] ===`,
    "- [LESSON: 1] [اسم الدرس الأول] | المفاهيم: [مفهوم 1، مفهوم 2]",
    "- [LESSON: 2] [اسم الدرس الثاني] | المفاهيم: [مفهوم 1، مفهوم 2]",
  ].join("\n");
}

export function detectGradeIdFromArabic(text: string): string | undefined {
  if (/(?:الصف\s+)?السادس\s+الابتدائي|سادس\s+ابتدائي|6\s*ب(?:\s|$|[^\w\u0600-\u06FF])|prim-6/i.test(text)) return "prim-6";
  if (/(?:الصف\s+)?الخامس\s+الابتدائي|خامس\s+ابتدائي|5\s*ب(?:\s|$|[^\w\u0600-\u06FF])|prim-5/i.test(text)) return "prim-5";
  if (/(?:الصف\s+)?الرابع\s+الابتدائي|رابع\s+ابتدائي|4\s*ب(?:\s|$|[^\w\u0600-\u06FF])|prim-4/i.test(text)) return "prim-4";
  if (/(?:الصف\s+)?الثالث\s+الابتدائي|ثالث\s+ابتدائي|3\s*ب(?:\s|$|[^\w\u0600-\u06FF])|prim-3/i.test(text)) return "prim-3";
  if (/(?:الصف\s+)?الأول\s+الإعدادي|أولى\s+إعدادي|1\s*ع(?:\s|$|[^\w\u0600-\u06FF])|prep-1/i.test(text)) return "prep-1";
  if (/(?:الصف\s+)?الثاني\s+الإعدادي|تانية\s+إعدادي|2\s*ع(?:\s|$|[^\w\u0600-\u06FF])|prep-2/i.test(text)) return "prep-2";
  if (/(?:الصف\s+)?الثالث\s+الإعدادي|تالتة\s+إعدادي|3\s*ع(?:\s|$|[^\w\u0600-\u06FF])|prep-3/i.test(text)) return "prep-3";
  if (/(?:الصف\s+)?الأول\s+الثانوي|أولى\s+ثانوي|1\s*ث(?:\s|$|[^\w\u0600-\u06FF])|sec-1/i.test(text)) return "sec-1";
  if (/(?:الصف\s+)?الثاني\s+الثانوي|تانية\s+ثانوي|2\s*ث(?:\s|$|[^\w\u0600-\u06FF])|sec-2/i.test(text)) return "sec-2";
  if (/(?:الصف\s+)?الثالث\s+الثانوي|تالتة\s+ثانوي|3\s*ث(?:\s|$|[^\w\u0600-\u06FF])|sec-3/i.test(text)) return "sec-3";
  return undefined;
}

export function parseCurriculumSplitterResponse(
  rawResponse: string,
  targetGradeId: string,
  termNumber: 1 | 2,
  defaultBranchId: MathBranchId = "algebra"
): CurriculumUnitNode[] {
  const units: CurriculumUnitNode[] = [];
  if (!rawResponse || !rawResponse.trim()) return units;

  const lines = rawResponse.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let currentUnit: {
    id: string;
    gradeId: string;
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

  let activeGradeId = targetGradeId;
  for (const line of lines) {
    // رصد العناوين الترويسية للصفوف في حال وجود أكثر من صف (مثل: # منهج الصف الأول الإعدادي)
    if (line.startsWith("#") || (line.startsWith("===") && line.includes("GRADE"))) {
      const detected = detectGradeIdFromArabic(line);
      if (detected) {
        activeGradeId = detected;
      }
    }

    const unitMatch = line.match(
      /(?:\[GRADE:\s*([^|\]]+)\]\s*\|\s*)?\[UNIT:\s*(\d+)\]\s*\|\s*الفرع:\s*([^|]+)\|\s*العنوان:\s*(.+?)(?:===|$)/i
    );
    if (unitMatch) {
      if (unitMatch[1]) {
        const explicitGradeRaw = unitMatch[1].trim();
        activeGradeId = detectGradeIdFromArabic(explicitGradeRaw) || explicitGradeRaw;
      }
      const unitGradeId = activeGradeId;

      const orderIdx = parseInt(unitMatch[2], 10) || units.length + 1;
      const branchRaw = unitMatch[3].trim();
      const titleRaw = unitMatch[4].replace(/===/g, "").trim();
      const unitId = `${unitGradeId}-t${termNumber}-u${orderIdx}`;
      const resolvedBranchId = inferBranchFromArabic(branchRaw + " " + titleRaw);
      currentUnit = {
        id: unitId,
        gradeId: unitGradeId,
        branchId: resolvedBranchId,
        branchNameArabic: branchRaw || MATH_BRANCHES_SSOT[resolvedBranchId].nameArabic,
        orderIndex: orderIdx,
        titleArabic: titleRaw,
        lessons: [],
      };
      units.push({
        id: currentUnit.id,
        gradeId: unitGradeId,
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
export const CURRICULUM_UNITS_UPDATED_EVENT = "math_platform_curriculum_units_updated" as const;

const inMemoryFallback = new Map<string, string>();
const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export function loadActiveCurriculumUnitsSSOT(
  gradeId?: string
): readonly CurriculumUnitNode[] {
  try {
    const raw = isBrowser()
      ? window.localStorage.getItem(CURRICULUM_STORAGE_KEY)
      : inMemoryFallback.get(CURRICULUM_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CurriculumUnitNode[];
      if (Array.isArray(parsed)) {
        return gradeId ? parsed.filter((u) => u.gradeId === gradeId) : parsed;
      }
    }
  } catch {
    // ignore storage read error
  }
  return [];
}

export function saveImportedCurriculumUnitsSSOT(
  newUnits: readonly CurriculumUnitNode[]
): void {
  if (newUnits.length === 0) return;
  try {
    const existing = loadActiveCurriculumUnitsSSOT();
    const incomingGradeIds = new Set(newUnits.map((u) => u.gradeId));
    const merged = [
      ...existing.filter((u) => !incomingGradeIds.has(u.gradeId)),
      ...newUnits,
    ];
    const s = JSON.stringify(merged);
    if (isBrowser()) {
      window.localStorage.setItem(CURRICULUM_STORAGE_KEY, s);
      window.dispatchEvent(new Event(CURRICULUM_UNITS_UPDATED_EVENT));
    }
    inMemoryFallback.set(CURRICULUM_STORAGE_KEY, s);
    void syncCurriculumUnitsToSupabaseCloud(merged);
  } catch {
    // ignore storage write error
  }
}

export function deleteCurriculumUnitsForGradeSSOT(gradeId: string): void {
  if (!gradeId) return;
  try {
    const existing = loadActiveCurriculumUnitsSSOT();
    const filtered = existing.filter((u) => u.gradeId !== gradeId);
    const s = JSON.stringify(filtered);
    if (isBrowser()) {
      window.localStorage.setItem(CURRICULUM_STORAGE_KEY, s);
      window.dispatchEvent(new Event(CURRICULUM_UNITS_UPDATED_EVENT));
    }
    inMemoryFallback.set(CURRICULUM_STORAGE_KEY, s);
    void deleteCurriculumUnitsFromSupabaseCloud(gradeId);
  } catch {
    // ignore storage write error
  }
}

export function deleteAllCurriculumUnitsSSOT(): void {
  try {
    if (isBrowser()) {
      window.localStorage.removeItem(CURRICULUM_STORAGE_KEY);
      window.dispatchEvent(new Event(CURRICULUM_UNITS_UPDATED_EVENT));
    }
    inMemoryFallback.delete(CURRICULUM_STORAGE_KEY);
    void wipeCurriculumUnitsFromSupabaseCloud();
  } catch {
    // ignore storage write error
  }
}

export { buildStandardDocumentTitleSSOT } from "./curriculum-document-title-builder";
