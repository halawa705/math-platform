/**
 * @file figure-tag-grammar-ssot.ts
 * @description السجل المركزي الموحد لقواعد وصيغ وسوم الأشكال والرسوم البيانية والإحصائية والنماذج البصرية (المرحلة 1.1):
 * يحدد الوسوم الأربعة المعتمدة:
 * 1. `[رسم هندسي: ...]` للأشكال المستوية والفراغية.
 * 2. `[رسم بياني: ...]` للدوال والمستوى الإحداثي.
 * 3. `[رسم إحصائي: ...]` للمدرجات والقطاعات ومخططات الصندوق والنقاط.
 * 4. `[نموذج بصري: ...]` للنماذج الشريطية وساعات العقارب ونماذج الكسور الابتدائية.
 * كما يوفر دوال استخراج موحدة تحل محل الـ Regex المكررة في أنحاء المحللات.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 220 سطراً).
 */

export const MODULE_ID_FIGURE_TAG_GRAMMAR_SSOT =
  "figure_tag_grammar_ssot" as const;

export type FigureTagGrammarKind =
  | "geometry"
  | "graph"
  | "statistics"
  | "visual_model";

export interface ParsedFigureTagPayload {
  readonly kind: FigureTagGrammarKind;
  /** النص الكامل للوسم مع الأقواس */
  readonly fullMatch: string;
  /** المحتوى الداخلي للوسم بعد النقطتين `:` وبدون الأقواس */
  readonly content: string;
  /** المطلوب الصريح المستخرج من الوسم (إن وُجد سطر أو بند `المطلوب: ...`) */
  readonly askedClause?: string;
}

/**
 * التعبير النمطي الموحد لكشف أي وسم رسم معتمد بجميع تنويعاته
 */
export const UNIFIED_FIGURE_TAG_REGEX =
  /\[?\s*رسم\s*(هندسي|بياني|إحصائي|احصائي|توضيحي|نموذج\s*بصري)?\s*:\s*([^\]\n]+(?:\]|\n|$))/i;

export const GLOBAL_FIGURE_TAG_CLEANUP_REGEX =
  /\[?\s*(?:رسم\s*(?:هندسي|بياني|إحصائي|احصائي|توضيحي)?|نموذج\s*بصري)\s*:\s*[^\]\n]+\]?/gi;

/**
 * الكلمات الدلالية الصريحة التي تؤكد وجود شكل مرسوم في المسألة
 */
export const EXPLICIT_DIAGRAM_TEXT_CUES_REGEX =
  /(?:في|من|بـ)?\s*الشكل\s*(?:المقابل|المجاور|المرسوم|الموضح|التالي)|مستعيناً\s*بالشكل|بالشكل\s*المقابل|الشبكة\s*التربيعية|المنحنى\s*المقابل|الدائرة\s*[مO]|المثلث\s*[أابجدهـABC]+/i;

/**
 * يحلل نوع الوسم بدقة
 */
export function classifyFigureTagKind(tagHeader: string): FigureTagGrammarKind {
  const h = tagHeader.trim().toLowerCase();
  if (h.includes("بياني")) return "graph";
  if (h.includes("إحصائي") || h.includes("احصائي")) return "statistics";
  if (h.includes("نموذج") || h.includes("بصري")) return "visual_model";
  return "geometry";
}

/**
 * يستخرج بند `المطلوب:` الصريح من داخل وسم الرسم (المهمة 1.2)
 */
export function extractAskedClauseFromTagContent(content: string): string | undefined {
  const m = content.match(/(?:^|[;؛\n])\s*(?:المطلوب|أوجد|احسب|المجهول)\s*[:=]\s*([^;؛\n\]]+)/i);
  return m ? m[1].trim() : undefined;
}

/**
 * يستخرج أول وسم رسم معتمد من النص مع تصنيفه واستخراج المطلوب
 */
export function extractFirstFigureTagPayload(rawText: string): ParsedFigureTagPayload | null {
  if (!rawText || !rawText.trim()) return null;

  // فحص الوسوم الصريحة المحددة مع دعم استرداد الوسم غير المغلق بنهاية السطر
  const match = rawText.match(
    /\[?\s*(رسم\s*(?:هندسي|بياني|إحصائي|احصائي|توضيحي)?|نموذج\s*بصري)\s*:\s*([^\]\n]+)(?:\]|$)/im
  );

  if (!match) return null;

  const fullMatch = match[0];
  const tagHeader = match[1] || "";
  const rawContent = match[2] || "";
  const cleanContent = rawContent.replace(/\]$/, "").trim();
  const kind = classifyFigureTagKind(tagHeader);
  const askedClause = extractAskedClauseFromTagContent(cleanContent);

  return {
    kind,
    fullMatch,
    content: cleanContent,
    askedClause,
  };
}

/**
 * ينظف نص السؤال من وسوم الرسم المضمنة تمهيداً لعرضه كمتن سؤال ناصع
 */
export function stripFigureTagsFromPromptText(promptText: string): string {
  if (!promptText) return "";
  return promptText
    .replace(GLOBAL_FIGURE_TAG_CLEANUP_REGEX, "")
    .replace(/(?:^|\n)\s*(?:الرسم|رسم|الشكل)(?:\s*(?:المقابل|الهندسي|البياني|التوضيحي|التخطيطي|الإحصائي))?\s*:[^\n]*/gi, "")
    .replace(/(?:^|\n)\s*(?:الرسم|رسم|الشكل)\s*$/gim, "")
    .replace(/(?:^|\n)\s*(?:لا يوجد رسم|بدون رسم|لا رسم)[^\n]*/gi, "")
    .trim();
}

/**
 * يتحقق مما إذا كان نص السؤال يحتوي على إشارة بصرية صريحة ("في الشكل المقابل"، إلخ)
 */
export function hasExplicitVisualCueInText(text: string): boolean {
  return EXPLICIT_DIAGRAM_TEXT_CUES_REGEX.test(text);
}
