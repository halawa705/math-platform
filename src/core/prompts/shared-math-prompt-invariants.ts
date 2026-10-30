/**
 * @file shared-math-prompt-invariants.ts
 * @description القواعد الحاكمة المكثفة لجميع برومبتات الرياضيات الموجهة إلى NotebookLM (< 1000 حرف شاملة الهندسة).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 90 سطراً).
 */

import type { MathBranchId } from "../ssot/math-branches-ssot";
import { MATH_BRANCHES_SSOT } from "../ssot/math-branches-ssot";
import type { MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";
import { buildSmartGeometryPromptGuidance } from "./smart-geometry-prompt-director";

export const MODULE_ID_SHARED_MATH_PROMPT_INVARIANTS =
  "shared_math_prompt_invariants" as const;

export const SOURCE_PRIORITY_HIERARCHY_RULE_AR =
  "📚 ترتيب المصادر الإلزامي: (١) كتاب التقييمات الوزارية ← (٢) كتاب المدرسة ← (٣) الكتب الخارجية (بأولوية امتحانات الإدارات والمحافظات) ← (٤) كآخر حل عند انعدام الفكرة بالمصادر: توليد مباشر من NotebookLM مطابق للفكرة.";

const COMPACT_MATH_PROMPT_INVARIANTS: readonly string[] = [
  "1. منع التكرار: يُمنع تكرار أي سؤال أو شبيه له؛ كل سؤال يختبر فكرة رياضية مستقلة ومختلفة (وليس نفس الفكرة بأرقام أخرى).",
  "2. دقة الاختيار (MCQ): ٤ بدائل (أ، ب، جـ، د) بإجابة واحدة فقط صحيحة رياضياً (وليس شكلياً) + ٣ مشتتات ذكية ومعقولة رياضياً.",
  "3. الصياغة المصرية: المعادلات بـ `$...$` فقط، الفترات `$]أ, ب[$`، فرق المجموعات `-` (`$ح - \\{3\\}$`)، الوحدات بالعربية بعد العدد (`$5$ سم`)، والبرهان بـ ($\\because$ / $\\therefore$).",
  "4. النزاهة: بلا أرقام اقتباس `[1]` أو `【...】`، وبلا اختلاق محافظات، وبلا رسم لمسألة جبرية/لفظية لا تتطلبه.",
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
      ? "لاتينية (x, y, A, B, C)"
      : "عربية (س، ص، أ، ب، جـ، ح، جا، جتا، ظا)";

  const geometryDirective = buildSmartGeometryPromptGuidance({
    branchId: params.branchId,
    lessonTitleArabic: params.lessonTitleArabic,
    unitTitleArabic: params.unitTitleArabic,
  });

  return [
    SOURCE_PRIORITY_HIERARCHY_RULE_AR,
    `📌 الفرع (${branchSpec.nameArabic}) | الرموز: ${notationRule}.`,
    ...(geometryDirective ? [geometryDirective] : []),
    ...COMPACT_MATH_PROMPT_INVARIANTS,
  ].join("\n");
}
