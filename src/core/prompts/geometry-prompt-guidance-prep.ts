/**
 * @file geometry-prompt-guidance-prep.ts
 * @description التوجيه الذكي المضغوط لرسوم المرحلة الإعدادية (1–3) لـ NotebookLM (المهمة 1.3):
 * يغطي الزوايا والتوازي والتشابه (طاليس، إقليدس) والدائرة ومتوسطات المثلث،
 * ويلزم بتحديد الرؤوس والأطوال والزوايا وسطر `المطلوب: ...` (Zero-DSL) (< 550 حرف).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 70 سطراً).
 */

import type { MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_GEOMETRY_PROMPT_GUIDANCE_PREP =
  "geometry_prompt_guidance_prep" as const;

export function buildPrepStageFigurePromptGuidance(
  notationLanguage: MathNotationLanguage = "english"
): string {
  if (notationLanguage === "arabic") {
    return "📐 توجيه الإخراج الهندسي للإعدادي وحساب المثلثات: لكل مسألة بها شكل (مثلث/رباعي/دائرة/شبه منحرف/سلم/طائرة ورقية/ظل) اكتب `[رسم هندسي: ...]` كحقائق بـ `;` بلا كود: الرؤوس (مثلث أ ب جـ قائم في ب|أ ب جـ د شبه منحرف) ؛ أطوال الأضلاع ووحداتها (أ ب = 6 سم) ؛ الزوايا والتعامد (ق(∠ب) = 60° ؛ أ د ⊥ ب جـ) ؛ و`المطلوب: طول أ جـ`. والأسئلة النظرية بلا وسم.";
  }
  return "📐 توجيه الإخراج الهندسي للإعدادي وحساب المثلثات: لكل مسألة بها شكل (مثلث/رباعي/دائرة/شبه منحرف/سلم/طائرة ورقية/ظل) اكتب `[رسم هندسي: ...]` كحقائق بـ `;` بلا كود: الرؤوس (مثلث ABC قائم في B|ABCD شبه منحرف|ABCD ~ EFGH) ؛ أطوال الأضلاع ووحداتها (AB = 6 سم) ؛ الزوايا والتعامد (m(∠B) = 60° ; DE // BC ; AD ⊥ BC) ؛ و`المطلوب: طول AC`. والأسئلة النظرية بلا وسم.";
}
