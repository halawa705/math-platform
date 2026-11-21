/**
 * @file geometry-prompt-guidance-statistics.ts
 * @description التوجيه الذكي المضغوط للرسوم الإحصائية لـ NotebookLM (المهمة 1.3):
 * يغطي مخطط الصندوق، المدرج التكراري، الأعمدة البيانية، مخطط النقاط، والقطاعات الدائرية (Zero-DSL) (< 450 حرف).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 65 سطراً).
 */

export const MODULE_ID_GEOMETRY_PROMPT_GUIDANCE_STATISTICS =
  "geometry_prompt_guidance_statistics" as const;

export function buildStatisticsFigurePromptGuidance(): string {
  return "📊 توجيه الرسوم الإحصائية: عند الحاجة لرسم إحصائي اكتب `[رسم إحصائي: نوع=... ; ...]` بـ `;` بلا كود: للصندوق (`نوع=مخطط صندوق ; أدنى=10 ; وسيط=25 ; أقصى=40`)، للمدرج (`نوع=مدرج تكراري ; فئات=10-،20- ; تكرار=4،8`)، للأعمدة المفردة أو المزدوجة (`أعمدة مزدوجة: الفئات ... ؛ السلسلة 1 ... ؛ السلسلة 2 ...`)، وللمتجمع الصاعد أو القطاعات.";
}
