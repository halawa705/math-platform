/**
 * @file shared-math-prompt-invariants.ts
 * @description القواعد الحاكمة المكثفة لجميع برومبتات الرياضيات الموجهة إلى NotebookLM شاملة التفكيك الذكي للأفكار وترتيب المصادر.
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 95 سطراً).
 */

import type { MathBranchId } from "../ssot/math-branches-ssot";
import { MATH_BRANCHES_SSOT } from "../ssot/math-branches-ssot";
import type { MathNotationLanguage } from "../ssot/numeral-and-unit-ssot";
import { buildSmartGeometryPromptGuidance } from "./smart-geometry-prompt-director";

export const MODULE_ID_SHARED_MATH_PROMPT_INVARIANTS =
  "shared_math_prompt_invariants" as const;

export const SOURCE_PRIORITY_HIERARCHY_RULE_AR =
  "📚 المصادر: (١) كتاب التقييمات ← (٢) كتاب المدرسة ← (٣) الكتب الخارجية وامتحانات المحافظات ← (٤) كآخر حل لندرة التمارين على فكرة بالدرس: تمرين مطابق لنفس الفكرة.";

export const EXHAUSTIVE_IDEA_SPECTRUM_RULE_AR =
  "🔬 حصر أفكار المصادر: افحص الشرح والتدريبات والاختبارات الشهرية والنهائية واحصر أفكار الدرس من (البسيط التأسيسي ← المتوسط ← المتقدم ← المتفوقين) بدون إهمال أي فكرة في المصادر، وبدون حشو. ⛔ حظر قاطع لاختلاق الأفكار أو القوانين غير المنصوص عليها كقاعدة بالدرس أو تحويل خطوة حل/إثبات فرعي إلى قانون مستقل وفكرة جديدة.";

const COMPACT_MATH_PROMPT_INVARIANTS_EN: readonly string[] = [
  "1. منع التكرار: كل سؤال يختبر فكرة رياضية مستقلة ومختلفة.",
  "2. الاختيار (MCQ): 4 بدائل (أ، ب، جـ، د) تتضمن إجابة واحدة فقط صحيحة رياضياً + 3 مشتتات ذكية ومعقولة رياضياً، موزعة بالتساوي (~25% لكل حرف) دون حصرها في (أ).",
  "3. الصياغة: رقّم [1] [2]، المعادلات `$...$`، الفترات `$]a, b[$`، الفرق `$\\mathbb{R}-\\{3\\}$`، الوحدات بالعربية (`$5$ سم`)، البرهان ($\\because$/$\\therefore$)، بلا `【...】`.",
] as const;

const COMPACT_MATH_PROMPT_INVARIANTS_AR: readonly string[] = [
  "1. منع التكرار: كل سؤال يختبر فكرة رياضية مستقلة ومختلفة.",
  "2. الاختيار (MCQ): ٤ بدائل (أ، ب، جـ، د) تتضمن إجابة واحدة فقط صحيحة رياضياً + ٣ مشتتات ذكية ومعقولة رياضياً، موزعة بالتساوي (~٢٥٪ لكل حرف) دون حصرها في (أ).",
  "3. الصياغة: رقّم [1] [2]، المعادلات `$...$`، الفترات `$]أ, ب[$`، الفرق `$ح-\\{3\\}$`، الوحدات بالعربية (`$5$ سم`)، البرهان ($\\because$/$\\therefore$)، بلا `【...】`.",
] as const;

export function buildSharedMathInvariantsPromptBlock(params: {
  readonly branchId: MathBranchId;
  readonly notationLanguage?: MathNotationLanguage;
  readonly lessonTitleArabic?: string;
  readonly unitTitleArabic?: string;
}): string {
  const branchSpec = MATH_BRANCHES_SSOT[params.branchId];
  const effectiveNotation: MathNotationLanguage = params.notationLanguage ?? "english";
  const notationRule =
    effectiveNotation === "english"
      ? "إنجليزية مطابقة للمنهج الجديد بالمصادر (الأرقام 0-9، المجاهيل x, y, z، ورؤوس الأشكال A, B, C, D, M — يُمنع تعريبها إلى أ، ب، جـ، م، س، ص)"
      : "عربية (س، ص، أ، ب، جـ، ح، جا، جتا، ظا)";

  const geometryDirective = buildSmartGeometryPromptGuidance({
    branchId: params.branchId,
    notationLanguage: effectiveNotation,
    lessonTitleArabic: params.lessonTitleArabic,
    unitTitleArabic: params.unitTitleArabic,
  });

  const compactRules =
    effectiveNotation === "english"
      ? COMPACT_MATH_PROMPT_INVARIANTS_EN
      : COMPACT_MATH_PROMPT_INVARIANTS_AR;

  return [
    SOURCE_PRIORITY_HIERARCHY_RULE_AR,
    EXHAUSTIVE_IDEA_SPECTRUM_RULE_AR,
    `📌 الفرع (${branchSpec.nameArabic}) | الرموز: ${notationRule}.`,
    ...(geometryDirective ? [geometryDirective] : []),
    ...compactRules,
  ].join("\n");
}
