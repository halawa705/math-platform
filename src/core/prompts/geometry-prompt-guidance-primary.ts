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
  notationLanguage: MathNotationLanguage = "english"
): string {
  if (notationLanguage === "arabic") {
    return "📐 توجيه الرسوم والنماذج للابتدائي: للرسم فقط اكتب `[نموذج بصري: ...]` أو `[رسم هندسي: ...]` كحقائق بـ `;` بلا كود: الأبعاد (`الطول = 6 سم ؛ العرض = 4 سم`) أو الربع الأول (`الربع الأول ; أ(3، 5)`) أو الأعمدة المزدوجة أو الدائرة بنصف قطرها/قطرها، وسطر إلزامي: `المطلوب: ...`. المسائل اللفظية المجردة بلا وسم.";
  }
  return "📐 توجيه الرسوم والنماذج للابتدائي: للرسم فقط اكتب `[نموذج بصري: ...]` أو `[رسم هندسي: ...]` كحقائق بـ `;` بلا كود: الأبعاد (`length = 6 سم ; width = 4 سم`) أو الربع الأول (`الربع الأول ; A(3, 5)`) أو الأعمدة المزدوجة أو الدائرة بنصف قطرها/قطرها، وسطر إلزامي: `المطلوب: ...`. المسائل اللفظية المجردة بلا وسم.";
}
