/**
 * @file geometry-rejection-advice-formatter.ts
 * @description منسق رسائل الرفض والتوجيه التربوي الذكي للمعلم (المهمة 7.2):
 * يحول التحذيرات التقنية وأسباب الرفض (القرار الأحمر/الأصفر) إلى رسائل تربوية لطيفة باللغة العربية
 * خالية تماماً من أي مصطلحات برمجية، ويقترح صياغة محسنة لـ NotebookLM خالية من وسوم الـ DSL أو الكود.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 160 سطراً).
 */

export const MODULE_ID_GEOMETRY_REJECTION_ADVICE_FORMATTER =
  "geometry_rejection_advice_formatter" as const;

export interface GeometryRejectionAdviceParams {
  readonly rawPrompt: string;
  readonly reasons: readonly string[];
}

export interface GeometryRejectionAdviceResult {
  readonly friendlySummaryAr: string;
  readonly detailedStepsAr: readonly string[];
  readonly isTheoretical: boolean;
  readonly suggestedPromptPromptAr: string;
  readonly notebookLMSuggestionText: string;
}

/**
 * يصيغ النصيحة التربوية للمعلم بناءً على أسباب عدم رسم الشكل.
 */
export function formatGeometryRejectionAdviceArabic(
  params: GeometryRejectionAdviceParams
): GeometryRejectionAdviceResult {
  const combinedReasons = params.reasons.join(" | ");
  const isTheoretical = /نظرية\s*لفظية|لا\s*تتطلب\s*شكلاً/i.test(combinedReasons);

  let friendlySummaryAr = "يتعذر رسم الشكل بدقة بناءً على المعطيات المكتوبة حالياً.";
  const detailedStepsAr: string[] = [];

  if (isTheoretical) {
    friendlySummaryAr = "هذه مسألة نظرية عامة أو قاعدة مجردة لا تتطلب رسماً توضيحياً، ويفضل أن يحلها الطالب ذهنياً أو بالخطوات الجبرية.";
    detailedStepsAr.push("لا داعي لإضافة وسم رسم هندسي لهذه المسألة.");
  } else if (/رؤوس\s*دخيلة|حروف\s*غير\s*مذكورة/i.test(combinedReasons)) {
    friendlySummaryAr = "يحتوي الشكل المقترح على رؤوس أو حروف غير مذكورة في نص السؤال؛ يرجى توحيد أسماء النقاط لتطابق معطيات مسألتك.";
    detailedStepsAr.push("تأكد أن أسماء الأضلاع والزوايا في السؤال هي نفسها المستخدمة في وصف الرسم.");
  } else if (/أرقام\s*دخيلة|أرقام\s*مسرّبة/i.test(combinedReasons)) {
    friendlySummaryAr = "يحتوي الرسم على أرقام أو أطوال تمثل ناتج الحل ولم تُذكر في معطيات السؤال، مما قد يكشف الإجابة للطالب.";
    detailedStepsAr.push("احرص على كتابة المعطيات الأساسية فقط، واستبدل القياس المطلوب إيجاده بعلامة استفهام (؟).");
  } else if (/معطيات\s*ناقصة|أبعاد\s*مفقودة/i.test(combinedReasons)) {
    friendlySummaryAr = "المعطيات الهندسية المكتوبة غير كافية لإنشاء الشكل بأبعاد دقيقة.";
    detailedStepsAr.push("أضف قياس زاوية إضافية أو طول ضلع ناقص حتى تكتمل محددات الشكل هندسياً.");
  } else {
    friendlySummaryAr = "الوصف الحالي يحتاج إلى مزيد من الدقة والتفصيل لتحديد هيئة الشكل الهندسي بوضوح.";
    detailedStepsAr.push("وضّح نوع الشكل (مثلاً: مثلث قائم، متوازي أضلاع، دائرة بمركز م) مع ذكر أطوال الأضلاع وزواياها باللغة العربية.");
  }

  // تنظيف النص المقترح ليكون صياغة واضحة خالية من أي تشويش
  const cleanPrompt = params.rawPrompt
    .replace(/\[\s*رسم\s*(?:هندسي|توضيحي|بياني)\s*:[^\]]+\]/gi, "")
    .replace(/^في\s*الشكل\s*المقابل\s*[:.-]?\s*/i, "")
    .trim();

  const suggestedPromptPromptAr = cleanPrompt || "مثلث أ ب جـ قائم في ب، أ ب = 6 سم، ب جـ = 8 سم";

  const notebookLMSuggestionText = `في الشكل المقابل: ${suggestedPromptPromptAr}.\n[رسم هندسي: ${suggestedPromptPromptAr}]`;

  return {
    friendlySummaryAr,
    detailedStepsAr,
    isTheoretical,
    suggestedPromptPromptAr,
    notebookLMSuggestionText,
  };
}
