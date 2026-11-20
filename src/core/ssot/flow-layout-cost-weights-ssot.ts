/**
 * @file flow-layout-cost-weights-ssot.ts
 * @description المصدر الوحيد لأوزان دالة تكلفة فاصل الصفحات. النظام حر في اختيار أي توزيع (كسر بين الكائنات،
 * أو قطع حل مثال، أو قطع زوج أمثلة معاً) ويختار الأقل تكلفة. لتغيير سلوك التنسيق يُعدَّل رقم هنا فقط، لا منطق.
 */

export const MODULE_ID_FLOW_LAYOUT_COST_WEIGHTS_SSOT = "flow_layout_cost_weights_ssot" as const;

export const FLOW_LAYOUT_COST_WEIGHTS = {
  /** عقوبة قيد صلب ناعم (يتيم الكبسولة/البانر/الفاصل): تُقارَن قبل عدد الصفحات. */
  orphanPenalty: 1e5,
  /** كائن أطول من الصفحة نفسها (يُبلَّغ عنه ولا يُخفى). */
  oversizedPenalty: 1e7,
  /** خاتمة الاعتماد منفردة في صفحة. */
  loneFooterPenalty: 30,
  /** كبسولة الفكرة في أسفل الصفحة (مسموح لكن غير مفضل). */
  capsuleAtPageBottomCost: 35,
  /** وزن الفراغ المهدور بالمساحة (فراغ سفلي + أعمدة فارغة) للصفحات غير الأخيرة. */
  areaWasteWeight: 22,
  /** وزن تفاوت العمودين (جمالي) لكل الصفحات. */
  columnImbalanceWeight: 8,
  /** تكلفة كل قطع لحل مثال بين صفحتين (تفضيل لطيف للأمثلة الكاملة عند تساوي الفراغ). */
  solutionCutCost: 1.5,
  /** تكلفة إضافية إن بقيت خطوة واحدة فقط في الذيل (أرملة). */
  singleStepTailCost: 2,
} as const;
