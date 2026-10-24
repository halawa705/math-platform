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
import { syncCurriculumUnitsToSupabaseCloud } from "../supabase/supabase-cloud-sync-ssot";

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
    void syncCurriculumUnitsToSupabaseCloud(merged);
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

const ARABIC_ORDINALS_TO_NUMBER: Readonly<Record<string, number>> = {
  الأول: 1,
  الاول: 1,
  الأولى: 1,
  الاولى: 1,
  الثاني: 2,
  الثانية: 2,
  الثالث: 3,
  الثالثة: 3,
  الرابع: 4,
  الرابعة: 4,
  الخامس: 5,
  الخامسة: 5,
  السادس: 6,
  السادسة: 6,
  السابع: 7,
  السابعة: 7,
  الثامن: 8,
  الثامنة: 8,
  التاسع: 9,
  التاسعة: 9,
  العاشر: 10,
  العاشرة: 10,
};

function inferLessonNumberFromText(text: string): number | null {
  if (!text) return null;
  const parenMatch = text.match(/\(?(\d{1,2})\)?\s*[-–—:]/);
  if (parenMatch?.[1]) {
    const n = parseInt(parenMatch[1], 10);
    if (n > 0 && n <= 40) return n;
  }
  const digitMatch = text.match(/(?:الدرس|درس|رقم|^)\s*\(?(\d{1,2})\)?/i);
  if (digitMatch?.[1]) {
    const n = parseInt(digitMatch[1], 10);
    if (n > 0 && n <= 40) return n;
  }
  for (const [word, num] of Object.entries(ARABIC_ORDINALS_TO_NUMBER)) {
    if (new RegExp(`(?:الدرس\\s+)?${word}\\b`).test(text)) {
      return num;
    }
  }
  return null;
}

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
 * مثال: "5 - 1ع - الوحدة الثانية - المعادلات الخطية"
 * وإن لم يوجد مستكشف المنهج، يشتق الرقم والوحدة واسم الدرس من مدخلات البحث والبرومبت والردود.
 */
export function buildStandardDocumentTitleSSOT(params: {
  readonly gradeId: string;
  readonly unitTitleInput?: string;
  readonly lessonTitleInput?: string;
  readonly promptText?: string;
  readonly rawReplyText?: string;
}): string {
  const gradeCode = resolveGradeShortCode(params.gradeId);
  const units = loadActiveCurriculumUnitsSSOT(params.gradeId);

  let resolvedLessonOrder = 1;
  let resolvedUnitTitle = (params.unitTitleInput || "").trim();
  let resolvedLessonTitle = (params.lessonTitleInput || "").trim();

  // 1. البحث في مستكشف المنهج إن وُجد
  if (units.length > 0) {
    const matchedUnit =
      units.find((u) => u.titleArabic === resolvedUnitTitle) ||
      units.find((u) =>
        u.lessons.some((l) => l.titleArabic === resolvedLessonTitle)
      ) ||
      units[0];

    if (matchedUnit) {
      if (!resolvedUnitTitle) {
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
        resolvedLessonTitle = matchedLesson.titleArabic
          .replace(/^(?:الدرس\s+\S+\s*[:\-–—]\s*|\d+\s*[.\-–]\s*)/, "")
          .trim() || matchedLesson.titleArabic;
      }
    }
  }

  // 2. إن لم يوجد في مستكشف المنهج، نشتق من المدخلات أو البرومبت أو الرد
  const combinedSource = `${resolvedLessonTitle}\n${resolvedUnitTitle}\n${params.promptText || ""}\n${(params.rawReplyText || "").slice(0, 600)}`;

  const inferredNum =
    inferLessonNumberFromText(resolvedLessonTitle) ||
    inferLessonNumberFromText(params.promptText || "") ||
    inferLessonNumberFromText((params.rawReplyText || "").slice(0, 400));
  if (inferredNum && resolvedLessonOrder === 1) {
    resolvedLessonOrder = inferredNum;
  }

  if (!resolvedUnitTitle || resolvedUnitTitle === "الوحدة") {
    const unitFromPrompt = combinedSource.match(
      /(?:الوحدة\s+(?:الأولى|الاولى|الثانية|الثالثة|الرابعة|الخامسة|السادسة|\d+)(?:\s*[:\-–—]\s*[^\n|•]+)?)/
    )?.[0];
    resolvedUnitTitle = unitFromPrompt ? unitFromPrompt.trim() : "الوحدة الأولى";
  }

  if (!resolvedLessonTitle || /^الدرس\s+(?:الأول|الاول|الثاني|الثالث|الرابع|الخامس|\d+)$/.test(resolvedLessonTitle)) {
    const lessonFromReply = combinedSource.match(
      /(?:درس|الدرس|الموضوع|عنوان الدرس)\s*[:\-–—]\s*([^\n|•*]+)/
    )?.[1];
    const ideaFromReply = (params.rawReplyText || "").match(
      /الفكرة\s+(?:الأولى|\(1\)|1)\s*:\s*([^\n\-|]+)/
    )?.[1];
    if (lessonFromReply && lessonFromReply.trim().length > 2) {
      resolvedLessonTitle = lessonFromReply.trim();
    } else if (ideaFromReply && ideaFromReply.trim().length > 2) {
      resolvedLessonTitle = ideaFromReply.trim();
    }
  }

  const cleanLessonName =
    resolvedLessonTitle
      .replace(/^(?:الدرس\s+(?:الأول|الاول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع|العاشر|\d+)\s*[:\-–—]?\s*)/, "")
      .trim() ||
    resolvedLessonTitle ||
    "الدرس الأول";

  return `${resolvedLessonOrder} - ${gradeCode} - ${resolvedUnitTitle} - ${cleanLessonName}`;
}
