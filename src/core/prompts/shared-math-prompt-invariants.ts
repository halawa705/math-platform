/**
 * @file shared-math-prompt-invariants.ts
 * @description القواعد العشر الثابتة لجميع برومبتات الرياضيات الموجهة إلى NotebookLM:
 * (Zero-DSL، المعادلات داخل `$...$`، وحدات القياس العربية بعد العدد، منع الهوامش `[1]`، ومنع اختلاق المحافظات).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import type { MathBranchId } from "../ssot/math-branches-ssot";
import { MATH_BRANCHES_SSOT } from "../ssot/math-branches-ssot";
import type { MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";

export const MODULE_ID_SHARED_MATH_PROMPT_INVARIANTS =
  "shared_math_prompt_invariants" as const;

export const TEN_GOLDEN_MATH_PROMPT_INVARIANTS: readonly string[] = [
  "1. إحاطة جميع الرموز والمعادلات والكسور والأسس والجذور بمحددات LaTeX القياسية `$...$` (مثل `$\\frac{3}{5}$`، `$\\sqrt{25}$`، `$س^2 - 5س + 6 = 0$`).",
  "2. كتابة وحدات القياس باللغة العربية دائماً بعد العدد مباشرة وليس قبله (مثل: `8 سم`، `24 سم²`، `120 درجة`، `15 نيوتن`).",
  "3. حظر استخدام رمز فرق المجموعات اللاتيني `\\setminus` نهائياً؛ ويُكتب فرق المجموعات والفترات بعلامة الناقص القياسية `-` (مثل `$ح - \\{3\\}$`).",
  "4. قاعدة الصفر كود (Zero-DSL Principle): يُمنع منعاً باتاً كتابة أي كود SVG أو TikZ أو إحداثيات برمجية؛ وتوصف الأشكال الهندسية أو البيانية باللغة العربية الطبيعية داخل القالب `[رسم هندسي: ...]` فقط عندما يتطلب السؤال شكلاً.",
  "5. منع الرسوم غير المطلوبة (Unsolicited Diagram Ban): لا ترفق أي وسم `[رسم هندسي: ...]` في المسائل الجبرية أو الحسابية اللفظية التي لا تنص على وجود شكل مقابل.",
  "6. الالتزام الصارم بالمصادر المرفوعة في الدفتر (Strict Source Grounding): يُمنع اختلاق أسماء محافظات أو إدارات تعليمية أو سنوات امتحانات غير مذكورة نصاً في المصدر المرفوع.",
  "7. حظر أرقام مراجع الاقتباس مثل `[1]` أو `[2, 3]` داخل نصوص الأسئلة أو المعادلات أو خطوات البرهان.",
  "8. في أسئلة الاختيار من متعدد (MCQ): يجب توفير 4 بدائل دقيقة لكل سؤال مرقمة (أ، ب، جـ، د) مع تحديد البديل الصحيح رياضياً بدقة.",
  "9. في مسائل البرهان الاستدلالي (الهندسة المستوية والمثلثات): يُكتب الحل النموذجي بخطوات منطقية متسلسلة باستخدام (بما أن ∵ ... إذن ∴ ...) مع ذكر النظرية أو النتيجة الهندسية المعتمدة.",
  "10. الحيادية التربوية الكاملة: يُقدم المحتوى بصفته مادة علمية وتقييمية رسمية مطابقة للمنهج الدراسي دون أي مقدمات حوارية أو عبارات خارجة عن المتن العلمي.",
] as const;

export function buildSharedMathInvariantsPromptBlock(params: {
  readonly branchId: MathBranchId;
  readonly notationLanguage?: MathNotationLanguage;
}): string {
  const branchSpec = MATH_BRANCHES_SSOT[params.branchId];
  const notationRule =
    params.notationLanguage === "english"
      ? "استخدم الرموز الرياضية اللاتينية (x, y, z, A, B, C, sin, cos, tan) في المعادلات والرؤوس الهندسية."
      : "استخدم الرموز الرياضية العربية المعتمدة (س، ص، ع، أ، ب، جـ، جا، جتا، ظا) في المعادلات والرؤوس الهندسية.";

  return [
    `📌 التوجيه التخصصي لفرع (${branchSpec.nameArabic}):`,
    `- ${branchSpec.defaultPromptGuidance}`,
    `- نظام الرموز المعتمد: ${notationRule}`,
    "",
    "⛔ القواعد العشر الصارمة للإخراج الرياضي (إلزامية بالكامل):",
    ...TEN_GOLDEN_MATH_PROMPT_INVARIANTS,
  ].join("\n");
}
