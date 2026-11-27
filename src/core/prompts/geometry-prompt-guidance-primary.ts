/**
 * @file geometry-prompt-guidance-primary.ts
 * @description التوجيه الذكي المضغوط لرسوم ونماذج المرحلة الابتدائية (3–6) لـ NotebookLM (المهمة 1.3):
 * يغطي النماذج البصرية (الأشرطة، الساعات، الكسور) والأشكال الهندسية ومحيط ومساحة المستطيل والمثلث ومتوازي الأضلاع،
 * ويلزم بكتابة `المطلوب: ...` (Zero-DSL) (< 500 حرف).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 70 سطراً).
 */

import type { MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_GEOMETRY_PROMPT_GUIDANCE_PRIMARY =
  "geometry_prompt_guidance_primary" as const;

export function buildPrimaryStageFigurePromptGuidance(
  _notationLanguage: MathNotationLanguage = "english"
): string {
  return "📐 توجيه الرسوم والنماذج للابتدائي: لا ترفق وسم رسم للمسائل التي تُحل بالقانون مباشرة. اكتب `[نموذج بصري: ...]` أو `[رسم هندسي: ...]` فقط في مسائل النماذج والأشكال المركبة (حرف L أو مستطيلين متلاصقين بتحديد الضلع الرأسي/الأفقي أو الأول/الثاني) مع `المطلوب: ...`، وبلا كود أو علامات `.";
}
