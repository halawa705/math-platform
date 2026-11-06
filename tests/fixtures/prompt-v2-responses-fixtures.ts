/**
 * @file prompt-v2-responses-fixtures.ts
 * @description بنك عينات اختبار استجابات البرومبت 2 لـ NotebookLM (المهمة 1.6):
 * عينات استجابات سليمة ومشوهة ونظرية بحتة لاختبار صلابة المحللات.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 300 سطر).
 */

import type { MathBranchId } from "../../src/core/ssot/math-branches-ssot";

export interface MockNotebookLMResponseSample {
  readonly id: string;
  readonly stage: "primary" | "preparatory";
  readonly branchId: MathBranchId;
  readonly kind: "well_formed" | "malformed" | "pure_theoretical";
  readonly rawText: string;
  readonly expectedTagPresence: boolean;
  readonly expectedFigureOrGraph: boolean;
  readonly expectedDecision?: "green" | "yellow" | "red";
  readonly notes: string;
}

export const PROMPT_V2_WELL_FORMED_SAMPLES: readonly MockNotebookLMResponseSample[] = [
  {
    id: "wf-primary-rectangle",
    stage: "primary",
    branchId: "plane_geometry",
    kind: "well_formed",
    rawText: `
السؤال 1:
في الشكل المقابل: [رسم هندسي: مستطيل أ ب جـ د ؛ أ ب = 6 سم ؛ ب جـ = 4 سم ؛ المطلوب: محيط المستطيل]
أوجد محيط المستطيل أ ب جـ د.
خطوات الحل:
المحيط = (الطول + العرض) × 2
المحيط = (6 + 4) × 2 = 20 سم
`,
    expectedTagPresence: true,
    expectedFigureOrGraph: true,
    expectedDecision: "green",
    notes: "مستطيل ابتدائي بأبعاد ومطلوب محيط",
  },
  {
    id: "wf-prep-pythagoras",
    stage: "preparatory",
    branchId: "plane_geometry",
    kind: "well_formed",
    rawText: `
السؤال 1:
في الشكل المقابل: [رسم هندسي: مثلث أ ب جـ قائم في ب ؛ أ ب = 6 سم ؛ ب جـ = 8 سم ؛ المطلوب: طول أ جـ]
أوجد طول أ جـ بالبرهان.
خطوات الحل:
بما أن المثلث أ ب جـ قائم في ب
إذن (أ جـ)² = (أ ب)² + (ب جـ)²
(أ جـ)² = 36 + 64 = 100 ⇐ أ جـ = 10 سم
`,
    expectedTagPresence: true,
    expectedFigureOrGraph: true,
    expectedDecision: "green",
    notes: "مثلث قائم فيثاغورس إعدادي مع مطلوب صريح",
  },
  {
    id: "wf-prep-circle-chord",
    stage: "preparatory",
    branchId: "plane_geometry",
    kind: "well_formed",
    rawText: `
السؤال 1:
في الشكل المقابل: [رسم هندسي: دائرة مركزها م ; نق = 5 ; أ ب وتر ; م د ⊥ أ ب]
أثبت أن د منتصف أ ب.
خطوات الحل:
بما أن م د يمر بالمركز م وعمودي على الوتر أ ب
إذن د منتصف أ ب.
`,
    expectedTagPresence: true,
    expectedFigureOrGraph: true,
    expectedDecision: "green",
    notes: "دائرة ووتر وعمود من المركز إعدادي",
  },
  {
    id: "wf-prep-function-parabola",
    stage: "preparatory",
    branchId: "functions",
    kind: "well_formed",
    rawText: `
السؤال 1:
ارسم منحنى الدالة التالية مستعيناً بالرسم البياني: [رسم بياني: ص = س² - 4 ؛ المدى س من -3 إلى 3]
ثم أوجد من الرسم نقطة رأس المنحنى.
خطوات الحل:
نكون جدول القيم للدالة في الفترة المعطاة.
رأس المنحنى هو (0 ، -4).
`,
    expectedTagPresence: true,
    expectedFigureOrGraph: true,
    notes: "رسم بياني كارتيزي لدالة تربيعية",
  },
  {
    id: "wf-primary-stat-boxplot",
    stage: "primary",
    branchId: "statistics_probability",
    kind: "well_formed",
    rawText: `
السؤال 1:
مستعيناً بالشكل الإحصائي المقابل: [رسم إحصائي: نوع=مخطط صندوق ; أدنى=10 ; ربيع1=18 ; وسيط=25 ; ربيع3=32 ; أقصى=40]
أوجد الوسيط والمدى الربيعي لمجموعة البيانات.
خطوات الحل:
الوسيط = 25
المدى الربيعي = ربيع3 - ربيع1 = 32 - 18 = 14
`,
    expectedTagPresence: true,
    expectedFigureOrGraph: true,
    notes: "رسم إحصائي لمخطط الصندوق",
  },
];

export const PROMPT_V2_MALFORMED_SAMPLES: readonly MockNotebookLMResponseSample[] = [
  {
    id: "mf-floating-tag-no-vertices",
    stage: "preparatory",
    branchId: "plane_geometry",
    kind: "malformed",
    rawText: `
السؤال 1:
أوجد المساحة [رسم هندسي: شكل جميل ولطيف جداً بدون أي رؤوس أو أطوال]
الحل: 20 سم²
`,
    expectedTagPresence: true,
    expectedFigureOrGraph: false,
    expectedDecision: "red",
    notes: "وسم عائم خالي من الرؤوس والعلاقات الرياضية",
  },
  {
    id: "mf-unclosed-tag-syntax",
    stage: "primary",
    branchId: "plane_geometry",
    kind: "malformed",
    rawText: `
السؤال 1:
احسب المحيط [رسم هندسي: مستطيل أ ب جـ د ؛ أ ب = 5 سم
خطوات الحل: المحيط = 20 سم
`,
    expectedTagPresence: true,
    expectedFigureOrGraph: true, // Should recover up to line end or newline
    notes: "وسم لم يُغلق بقوس ] ولكن ينتهي بنهاية السطر",
  },
  {
    id: "mf-unsolicited-arithmetic-tag",
    stage: "primary",
    branchId: "numbers",
    kind: "malformed",
    rawText: `
السؤال 1:
احسب ناتج ما يلي: 45 × 12 [رسم هندسي: مثلث أ ب جـ قائم في ب]
خطوات الحل:
45 × 12 = 540
`,
    expectedTagPresence: true,
    expectedFigureOrGraph: false, // Guard must reject diagram on arithmetic questions
    notes: "رسم هندسي مسرب في سؤال ضرب حسابي بحت",
  },
  {
    id: "mf-empty-tag",
    stage: "preparatory",
    branchId: "plane_geometry",
    kind: "malformed",
    rawText: `
السؤال 1:
أوجد قياس الزاوية [رسم هندسي:]
الحل: 50°
`,
    expectedTagPresence: true,
    expectedFigureOrGraph: false,
    expectedDecision: "red",
    notes: "وسم رسم فارغ تماماً",
  },
];

export const PROMPT_V2_THEORETICAL_SAMPLES: readonly MockNotebookLMResponseSample[] = [
  {
    id: "th-triangle-angle-sum-proof",
    stage: "preparatory",
    branchId: "plane_geometry",
    kind: "pure_theoretical",
    rawText: `
السؤال 1:
أثبت أن مجموع قياسات الزوايا الداخلة للمثلث تساوي 180° بالبرهان النظري.
خطوات الحل:
العمل: نرسم خطاً مستقيماً يمر برأس المثلث ويوازي القاعدة.
من التبادل والتداخل نجد أن مجموع الزوايا يشكل زاوية مستقيمة = 180°.
`,
    expectedTagPresence: false,
    expectedFigureOrGraph: false,
    notes: "سؤال برهان نظري بحت بدون وسم رسم",
  },
  {
    id: "th-algebraic-quadratic-equation",
    stage: "preparatory",
    branchId: "algebra",
    kind: "pure_theoretical",
    rawText: `
السؤال 1:
أوجد مجموعة حل المعادلة س² - 5س + 6 = 0 في ح.
خطوات الحل:
بالتحليل: (س - 2)(س - 3) = 0
إذن س = 2 أو س = 3
مجموعة الحل = {2 ، 3}
`,
    expectedTagPresence: false,
    expectedFigureOrGraph: false,
    notes: "سؤال جبري بحت خالي من أي رسوم",
  },
];
