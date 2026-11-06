/**
 * @file figure-inventory-prompt-builder.ts
 * @description منشئ برومبت جرد الأشكال المنهجية الموجه لـ NotebookLM (المرحلة 0.3):
 * يطلب من النموذج فحص كتب ومصادر المعلم واستخراج جدول الأشكال والرسوم البيانية والإحصائية
 * المطروحة في المنهج بصيغة قياسية دقيقة لتغذية السجل المركزي (SSOT) وتأكيد تغطية كل درس.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 120 سطراً).
 */

export const MODULE_ID_FIGURE_INVENTORY_PROMPT_BUILDER =
  "figure_inventory_prompt_builder" as const;

export interface FigureInventoryPromptOptions {
  readonly gradeNameArabic: string;
  readonly gradeId: string;
  readonly unitNameArabic?: string;
  readonly branchNameArabic?: string;
}

export function buildFigureInventoryPromptForNotebookLM(
  options: FigureInventoryPromptOptions
): string {
  const { gradeNameArabic, gradeId, unitNameArabic, branchNameArabic } = options;

  return [
    `🎯 المهمة المنهجية: جرد وحصر جميع الأشكال الهندسية والرسوم البيانية والإحصائية والنماذج البصرية المقررة في المنهج (${gradeNameArabic}) [رمز الصف: ${gradeId}].`,
    unitNameArabic ? `📌 الوحدة المستهدفة: ${unitNameArabic}` : "",
    branchNameArabic ? `📌 الفرع المستهدف: ${branchNameArabic}` : "",
    "",
    "📋 التعليمات الصارمة للإخراج:",
    "1. افحص كتاب المدرسة وكتاب التقييمات والكتب الخارجية المرفقة لكل درس في هذا الصف/الوحدة.",
    "2. احصر كل مسألة أو تمرين يتضمن رسماً هندسياً أو بيانياً أو نموذجاً بصرياً (مثلثات، توازي، أشكال رباعية، دوائر، مجسمات، مدرجات، قطاعات، مخطط صندوق، خط أعداد، نماذج أشرطة).",
    "3. اكتب لكل شكل سطراً قياسياً مستقلاً يبدأ بـ `=== [ARCHETYPE] ===` متبوعاً بالحقول التالية مفصولة بـ `|`:",
    "   - GRADE: رمز الصف (مثل primary-4 أو prep-2)",
    "   - UNIT: اسم الوحدة بالعربية",
    "   - LESSON: اسم الدرس بالعربية",
    "   - KIND: أحد الأنواع (plane_geometry | cartesian_function | statistics_chart | primary_visual_model | solid_geometry)",
    "   - NAME: الاسم الدقيق للشكل (مثل: مروحة الزوايا المتجمعة أو طاليس المتداخل)",
    "   - TAG: وسم الرسم العربي كحقائق بـ `;` بلا كود: [رسم هندسي: ...] أو [رسم بياني: ...] أو [رسم إحصائي: ...]",
    "   - GIVENS: ملخص المعطيات والأرقام الظاهرة على الشكل",
    "   - UNKNOWN: نوع المطلوب (length | angle | area | perimeter | volume | ratio | none)",
    "",
    "مثال دقيق للصيغة الإلزامية:",
    "=== [ARCHETYPE] === | GRADE: prep-3 | UNIT: التشابه | LESSON: نظرية إقليدس | KIND: plane_geometry | NAME: مثلث قائم بعمود على الوتر | TAG: [رسم هندسي: مثلث أ ب جـ قائم في أ ; أ د ⊥ ب جـ ; ب د = 9 سم ; د جـ = 16 سم] | GIVENS: أ د عمودي، ب د=9، د جـ=16 | UNKNOWN: length",
    "",
    "⚠️ ممنوع كتابة أي مقدمات أو خاتمات كلامية؛ ابدأ فوراً بسطور `=== [ARCHETYPE] ===` فقط.",
  ]
    .filter(Boolean)
    .join("\n");
}
