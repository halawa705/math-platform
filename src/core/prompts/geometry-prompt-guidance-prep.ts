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
    return "📐 توجيه الإخراج الهندسي للإعدادي: للشكل فقط اكتب `[رسم هندسي: ...]` كحقائق بـ `;` بلا كود: الرؤوس (مثلث أ ب جـ قائم في ب|أ ب جـ د متوازي أضلاع) ؛ أطوال الأضلاع ووحداتها (أ ب = 6 سم) ؛ الزوايا (ق(∠ب) = 60° ؛ د هـ // ب جـ ؛ أ د ⊥ ب جـ) ؛ وسطر إلزامي للمطلوب: `المطلوب: طول أ جـ` أو `المطلوب: ق(∠جـ)`. ممنوع وسم عائم بلا رؤوس؛ والأسئلة النظرية البحتة بلا وسم.";
  }
  return "📐 توجيه الإخراج الهندسي للإعدادي: للشكل فقط اكتب `[رسم هندسي: ...]` كحقائق بـ `;` بلا كود: الرؤوس (مثلث ABC قائم في B|ABCD ~ EFGH) ؛ أطوال الأضلاع ووحداتها (AB = 6 سم) ؛ الزوايا (m(∠B) = 60° ; DE // BC ; AD ⊥ BC) ؛ وسطر إلزامي للمطلوب: `المطلوب: طول AC` أو `المطلوب: m(∠C)`. ممنوع وسم عائم بلا رؤوس؛ والأسئلة النظرية البحتة بلا وسم.";
}
