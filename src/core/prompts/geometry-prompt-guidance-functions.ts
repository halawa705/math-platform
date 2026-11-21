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
    return "📈 توجيه الرسوم البيانية للدوال والنظم: اكتب `[رسم بياني: ...]` بـ `;` بلا كود: للخطية/التربيعية (`ص = ٢س + ١ ; ص = س² - ٤ ; المدى س من -٣ إلى ٣`)، لنظام معادلتين (`س + ص = ٥ ; س - ص = ١`)، للمتباينات والبرمجة الخطية (`٢س + ص ≤ ٦ ; س ≥ ٠ ; ص ≥ ٠`)، وللنقاط (`(٢ ، ٥) ; (-١ ، ٣)`). الجبر المجرد بلا وسم.";
  }
  return "📈 توجيه الرسوم البيانية للدوال والنظم: اكتب `[رسم بياني: ...]` بـ `;` بلا كود: للخطية/التربيعية (`y = 2x + 1 ; y = x^2 - 4 ; المدى x من -3 إلى 3`)، لنظام معادلتين (`x + y = 5 ; x - y = 1`)، للمتباينات (`2x + y <= 6 ; x >= 0 ; y >= 0`)، وللنقاط (`(2 , 5) ; (-1 , 3)`). الجبر المجرد بلا وسم.";
}
