/**
 * @file similarity-context-detector.ts
 * @description كاشف سياق التشابه والتطابق الموحد (المرحلة 2.2):
 * يجمع ويكتشف دلالات التشابه ونظرية إقليدس وظلال الأجسام ونسب التشابه في دالة موحدة واحدة،
 * قاضياً على الازدواج والتناقض بين المركب الهندسي ومحلل الأوصاف الطبيعية.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 100 سطر).
 */

export const MODULE_ID_SIMILARITY_CONTEXT_DETECTOR =
  "similarity_context_detector" as const;

const ANALYTIC_COORDINATE_REGEX =
  /محور|إحداثي|احداثي|معادلة|ميل|\(\s*-?\d+\s*[,،]\s*-?\d+\s*\)/i;

const EXPLICIT_SIMILARITY_KEYWORDS_REGEX =
  /[~∼]|\\sim|تشابه|متشابه|متطابقا\s*الزوايا|متطابقة\s*الزوايا|زوايا\s*متطابقة|نسبة\s*التشابه|معامل\s*التشابه|ظل|عمود\s*إنارة|سارية|رجل\s*طوله|إقليدس|اقليدس/i;

const ANGLE_SIMILARITY_MATCH_REGEX =
  /(?:ق|m)?\s*\(?\s*∠\s*AED\s*\)?\s*=\s*(?:ق|m)?\s*\(?\s*∠\s*B\s*\)?|(?:ق|m)?\s*\(?\s*∠\s*ADE\s*\)?\s*=\s*(?:ق|m)?\s*\(?\s*∠\s*C\s*\)?/i;

const INTERSECTING_SEGMENTS_SIMILARITY_REGEX =
  /[A-Z]{2}\s*∩\s*[A-Z]{2}\s*=\s*\{?\s*[A-Z]\s*\}?/i;

/**
 * يفحص ما إذا كان الوصف الهندسي يمثل مسألة تشابه أو تطابق أو تطبيقاتها (إقليدس، طاليس، فراشة)
 */
export function isSimilarityGeometryContext(description: string): boolean {
  if (!description || !description.trim()) return false;

  // 1. استبعاد مسائل الهندسة التحليلية والمستوى الإحداثي
  if (ANALYTIC_COORDINATE_REGEX.test(description)) {
    return false;
  }

  // 2. فحص الكلمات والرموز الصريحة للتشابه وإقليدس
  if (EXPLICIT_SIMILARITY_KEYWORDS_REGEX.test(description)) {
    return true;
  }

  // 3. فحص زوايا التشابه التبادلية
  if (ANGLE_SIMILARITY_MATCH_REGEX.test(description)) {
    return true;
  }

  // 4. تقاطع قطعتين مع توازي أو تشابه (هيئة الفراشة / الساعة الرملية)
  const hasIntersection = description.includes("∩");
  if (
    hasIntersection &&
    !description.includes("∠") &&
    !description.includes("°") &&
    (/يوازي|\/\/|تشابه|~/.test(description) || INTERSECTING_SEGMENTS_SIMILARITY_REGEX.test(description))
  ) {
    return true;
  }

  // 5. مثلث قائم مع عمود على الوتر (هيئة نظرية إقليدس)
  const isRightTriangle =
    description.includes("قائم") ||
    /ق\s*\(\s*∠\s*[A-Zأ-ي]\s*\)\s*=\s*90/i.test(description);

  if (
    isRightTriangle &&
    (description.includes("مثلث") || description.includes("Δ")) &&
    description.includes("⊥") &&
    !description.includes("مربع") &&
    !description.includes("مستطيل") &&
    !description.includes("متساوي الساقين") &&
    !description.includes("متوسط")
  ) {
    return true;
  }

  // 6. توازي على أضلاع المثلث (طاليس والقطع المتناسبة - لا يُفعّل لمسائل زوايا أولى إعدادي ذات الدرجات)
  if (
    description.includes("∈") &&
    description.includes("//") &&
    (description.includes("مثلث") || description.includes("Δ")) &&
    !description.includes("متوسط") &&
    !description.includes("°")
  ) {
    return true;
  }

  return false;
}
