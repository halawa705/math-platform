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
    return "📐 توجيه الرسوم والنماذج للابتدائي: للرسم فقط اكتب `[نموذج بصري: ...]` أو `[رسم هندسي: ...]` كحقائق بـ `;` بلا كود: الأبعاد مع وحداتها (الطول = 6 سم ؛ العرض = 4 سم) ؛ أجزاء الكسر أو الساعة أو أضلاع شكل L المتعامد ؛ وسطر إلزامي للمطلوب: `المطلوب: محيط المستطيل` أو الضلع المجهول `س = ؟`. الأسئلة الحسابية اللفظية بلا وسم.";
  }
  return "📐 توجيه الرسوم والنماذج للابتدائي: للرسم فقط اكتب `[نموذج بصري: ...]` أو `[رسم هندسي: ...]` كحقائق بـ `;` بلا كود: الأبعاد مع وحداتها (length = 6 سم ; width = 4 سم) ؛ أجزاء الكسر أو الساعة أو أضلاع شكل L المتعامد ؛ وسطر إلزامي للمطلوب: `المطلوب: محيط المستطيل` أو الضلع المجهول `x = ؟`. الأسئلة الحسابية اللفظية بلا وسم.";
}
