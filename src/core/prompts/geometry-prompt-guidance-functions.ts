/**
 * @file geometry-prompt-guidance-functions.ts
 * @description التوجيه الذكي المضغوط للرسوم البيانية الكارتيزية والدوال لـ NotebookLM (المهمة 1.3):
 * يغطي الدوال الخطية والتربيعية ودوال المقياس والمستوى الإحداثي (Zero-DSL) (< 450 حرف).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 65 سطراً).
 */

import type { MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_GEOMETRY_PROMPT_GUIDANCE_FUNCTIONS =
  "geometry_prompt_guidance_functions" as const;

export function buildCartesianFunctionsPromptGuidance(
  notationLanguage: MathNotationLanguage = "english"
): string {
  if (notationLanguage === "arabic") {
    return "📈 توجيه الرسوم البيانية للدوال: للدوال والمستوى الإحداثي اكتب `[رسم بياني: ...]` كمعادلات ونقاط بـ `;` بلا كود: للدالة: `ص = ٢س + ١ ; المدى س من -٣ إلى ٣` ؛ للتربيعية: `ص = س² - ٤ ; المدى س من -٣ إلى ٣` ؛ وللنقاط على الشبكة: `(٢ ، ٥) ; (-١ ، ٣)`. الأسئلة الجبرية المجردة بلا وسم رسم.";
  }
  return "📈 توجيه الرسوم البيانية للدوال: للدوال والمستوى الإحداثي اكتب `[رسم بياني: ...]` كمعادلات ونقاط بـ `;` بلا كود: للدالة: `y = 2x + 1 ; المدى س من -3 إلى 3` ؛ للتربيعية: `y = x^2 - 4 ; المدى س من -3 إلى 3` ؛ وللنقاط على الشبكة: `(2 , 5) ; (-1 , 3)`. الأسئلة الجبرية المجردة بلا وسم رسم.";
}
