/**
 * @file geo-facts-recomposer.ts
 * @description تجميع قائمة الحقائق الهندسية المعدّلة من المعلم في جملة وصفية متماسكة (المهمة 7.1):
 * يربط الحقائق بفاصلة منقوطة عربية « ؛ » نظيفة لإعادة مطابقة الشكل الهندسي فورياً دون إعادة التوليد من الذكاء الاصطناعي.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 60 سطراً).
 */

export const MODULE_ID_GEO_FACTS_RECOMPOSER = "geo_facts_recomposer" as const;

/**
 * يجمع مصفوفة من الحقائق الهندسية بعد التعديل في وصف هندسي موحد.
 */
export function recomposeFactsToGeometricDescription(
  facts: readonly string[]
): string {
  return facts
    .map((f) => f.trim())
    .filter((f) => f.length > 0)
    .join(" ؛ ");
}
