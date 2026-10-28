/**
 * @file shared-math-prompt-invariants.ts
 * @description القواعد العشر الذهبية لجميع برومبتات الرياضيات الموجهة إلى NotebookLM وفق الاصطلاح الرسمي لوزارة التربية والتعليم المصرية:
 * (الفترات المصرية `]أ، ب[`، المجال `ح - {...}`، عزل المعادلات داخل `$...$` بدون حبس الجمل العربية في `\text`،
 * وحدات القياس العربية بعد العدد، Zero-DSL، منع الهوامش `[1]` و`【...】`، ومنع اختلاق المحافظات).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 180 سطراً).
 */

import type { MathBranchId } from "../ssot/math-branches-ssot";
import { MATH_BRANCHES_SSOT } from "../ssot/math-branches-ssot";
import type { MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";
import { buildSmartGeometryPromptGuidance } from "./smart-geometry-prompt-director";

export const MODULE_ID_SHARED_MATH_PROMPT_INVARIANTS =
  "shared_math_prompt_invariants" as const;

export const TEN_GOLDEN_MATH_PROMPT_INVARIANTS: readonly string[] = [
  "1. إحاطة جميع الرموز والمعادلات والكسور والأسس والجذور بمحددات LaTeX القياسية `$...$` فقط (مثل `$\\frac{3}{5}$`، `$\\sqrt{25}$`، `$س^2 - 5س + 6 = 0$`)، مع حظر وضع الجمل العربية الطويلة داخل `\\text{...}`.",
  "2. الاصطلاح المصري للفترات والمجموعات: تُكتب الفترة المفتوحة بالمعكوفات المقلوبة `$]أ, ب[$` ونصف المفتوحة `$[أ, ب[$` أو `$]أ, ب]$`، وتُخصص الأقواس الدائرية `$(س, ص)$` للأزواج المرتبة وإحداثيات النقاط فقط.",
  "3. مجال الدوال وفرق المجموعات: يُحظر استخدام الرمز `\\setminus` نهائياً؛ ويُكتب فرق المجموعات ومجال الدالة الكسرية بعلامة الطرح الوزارية `-` (مثل: `$ح - \\{3\\}$`، والمجموعة الخالية `$\\phi$`).",
  "4. وحدات القياس العربية: تُكتب باللغة العربية خارج علامات `$` وبعد العدد مباشرة وليس قبله (مثل: `$8$ سم`، `$24$ سم²`، `$120$ درجة`، `$15$ نيوتن`، `$5$ م/ث²`).",
  "5. قاعدة الصفر كود (Zero-DSL Principle): يُمنع منعاً باتاً كتابة أي كود SVG أو TikZ أو إحداثيات برمجية؛ وتوصف الأشكال الهندسية أو البيانية باللغة العربية الطبيعية داخل القالب `[رسم هندسي: ...]` فقط عندما يتطلب السؤال شكلاً.",
  "6. منع الرسوم غير المطلوبة (Unsolicited Diagram Ban): لا ترفق أي وسم `[رسم هندسي: ...]` في المسائل الجبرية أو الحسابية اللفظية التي لا تنص على وجود شكل مقابل.",
  "7. الالتزام الصارم بالمصادر المرفوعة (Strict Source Grounding): يُمنع اختلاق أسماء محافظات أو إدارات تعليمية أو سنوات امتحانات غير مذكورة نصاً في المصدر المرفوع.",
  "8. حظر أرقام مراجع الاقتباس مثل `[1]` أو `[2, 3]` أو `【1:2†source】` داخل نصوص الأسئلة أو المعادلات أو خطوات البرهان.",
  "9. في أسئلة الاختيار من متعدد (MCQ): يجب توفير 4 بدائل دقيقة لكل سؤال مفصولة بعلامة `|` مع تحديد نص البديل الصحيح رياضياً بدقة.",
  "10. في مسائل البرهان الاستدلالي والخطوات: يُكتب الحل النموذجي بخطوات منطقية مرقمة ومتسلسلة باستخدام (بما أن $\\because$ ... إذن $\\therefore$ ...) مع ذكر النظرية أو النتيجة الهندسية المعتمدة.",
] as const;

export function buildSharedMathInvariantsPromptBlock(params: {
  readonly branchId: MathBranchId;
  readonly notationLanguage?: MathNotationLanguage;
  readonly lessonTitleArabic?: string;
  readonly unitTitleArabic?: string;
}): string {
  const branchSpec = MATH_BRANCHES_SSOT[params.branchId];
  const notationRule =
    params.notationLanguage === "english"
      ? "استخدم الرموز الرياضية اللاتينية (x, y, z, A, B, C, \\mathbb{R}, \\sin, \\cos, \\tan) في المعادلات والرؤوس الهندسية."
      : "استخدم الرموز الرياضية العربية المصرية المعتمدة (س، ص، ع، أ، ب، جـ، ح، ص، ط، ن، جا، جتا، ظا) في المعادلات والرؤوس الهندسية.";

  const geometryDirective = buildSmartGeometryPromptGuidance({
    branchId: params.branchId,
    lessonTitleArabic: params.lessonTitleArabic,
    unitTitleArabic: params.unitTitleArabic,
  });

  return [
    `📌 التوجيه التخصصي لفرع (${branchSpec.nameArabic}):`,
    `- ${branchSpec.defaultPromptGuidance}`,
    `- نظام الرموز المعتمد: ${notationRule}`,
    "",
    ...(geometryDirective ? [geometryDirective, ""] : []),
    "⛔ القواعد العشر الصارمة للإخراج الرياضي المصري (إلزامية بالكامل):",
    ...TEN_GOLDEN_MATH_PROMPT_INVARIANTS,
  ].join("\n");
}
